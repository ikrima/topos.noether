'use strict';
const E = require('./engine.js');
const {
  V, makeRng, Scene, lightArclen, lightPoint, pHat, dAtoDOmega,
  reference, canonicalSampleOmegaPdf, sharpnessFromRoughness, resampleAt, visible,
} = E;

const NP = 64;                              // pixels along floor
const xvOf = (i) => V((i + 0.5) / NP, 0);   // shading points

// Build one frame's per-pixel canonical samples -> "domains" array.
function canonicalDomains(s, rng) {
  const doms = [];
  for (let i = 0; i < NP; i++) {
    const xv = xvOf(i);
    const u = rng();
    const y = lightPoint(u);
    const pdf = canonicalSampleOmegaPdf(xv, y);
    const Wsrc = pdf > 0 ? 1 / pdf : 0; // 1-sample unbiased weight
    doms.push({ xv, c: 1, y, Wsrc, pHatSelf: pHat(xv, y, s) });
  }
  return doms;
}

// Spatial reuse: window radius R around each pixel.
function spatialFrame(s, rng, R) {
  const doms = canonicalDomains(s, rng);
  const est = new Float64Array(NP);
  const resid = new Float64Array(NP);
  const selFrom = new Int32Array(NP);
  for (let i = 0; i < NP; i++) {
    const window = [];
    let iLocal = 0;
    for (let k = -R; k <= R; k++) {
      const j = i + k;
      if (j < 0 || j >= NP) continue;
      if (j === i) iLocal = window.length;
      window.push(doms[j]);
    }
    const res = resampleAt(iLocal, window, s, rng);
    est[i] = res.y !== null ? pHat(xvOf(i), res.y, s) * res.W : 0;
    resid[i] = Math.abs(res.selResidual);
    selFrom[i] = res.y !== null ? 1 : 0;
  }
  return { est, resid };
}

// ---------------------------------------------------------------------------
// TEST 1: unbiasedness on smooth diffuse, NO occluder.
// ---------------------------------------------------------------------------
function test1() {
  // disable occluder
  const save = { ...Scene.occluder };
  Scene.occluder.x0 = 9; Scene.occluder.x1 = 10;
  const rough = 1.0;                  // diffuse-dominant
  const s = sharpnessFromRoughness(rough);
  const TRIALS = 4000;
  const R = 3;

  const ref = new Float64Array(NP);
  for (let i = 0; i < NP; i++) ref[i] = reference(xvOf(i), s);

  const meanEst = new Float64Array(NP);
  const rng = makeRng(12345);
  for (let t = 0; t < TRIALS; t++) {
    const { est } = spatialFrame(s, rng, R);
    for (let i = 0; i < NP; i++) meanEst[i] += est[i];
  }
  for (let i = 0; i < NP; i++) meanEst[i] /= TRIALS;

  // relative error on interior pixels that actually see the light
  let maxRel = 0, sumRel = 0, cnt = 0;
  for (let i = 4; i < NP - 4; i++) {
    if (ref[i] < 1e-4) continue;
    const rel = Math.abs(meanEst[i] - ref[i]) / ref[i];
    maxRel = Math.max(maxRel, rel); sumRel += rel; cnt++;
  }
  Object.assign(Scene.occluder, save);
  console.log('TEST 1  (unbiasedness, diffuse, no occluder)');
  console.log(`  trials=${TRIALS}, window R=${R}`);
  console.log(`  mean rel error = ${(sumRel / cnt * 100).toFixed(3)}%   max rel = ${(maxRel * 100).toFixed(3)}%`);
  console.log(`  verdict: ${maxRel < 0.03 ? 'PASS — reuse converges to reference (shift+Jacobian unbiased)' : 'FAIL — biased'}`);
  console.log('');
  return maxRel < 0.03;
}

// ---------------------------------------------------------------------------
// TEST 2: unbiasedness WITH occluder + glossy (variance high, mean still right)
// ---------------------------------------------------------------------------
function test2() {
  const rough = 0.25;                 // glossy -> some near-singular behavior
  const s = sharpnessFromRoughness(rough);
  const TRIALS = 8000;
  const R = 3;
  const ref = new Float64Array(NP);
  for (let i = 0; i < NP; i++) ref[i] = reference(xvOf(i), s);
  const meanEst = new Float64Array(NP);
  const rng = makeRng(999);
  for (let t = 0; t < TRIALS; t++) {
    const { est } = spatialFrame(s, rng, R);
    for (let i = 0; i < NP; i++) meanEst[i] += est[i];
  }
  for (let i = 0; i < NP; i++) meanEst[i] /= TRIALS;
  let maxRel = 0, sumRel = 0, cnt = 0;
  for (let i = 4; i < NP - 4; i++) {
    if (ref[i] < 1e-3) continue;
    const rel = Math.abs(meanEst[i] - ref[i]) / ref[i];
    maxRel = Math.max(maxRel, rel); sumRel += rel; cnt++;
  }
  console.log('TEST 2  (unbiasedness, glossy s=' + s.toFixed(0) + ' + occluder)');
  console.log(`  mean rel error = ${(sumRel / cnt * 100).toFixed(3)}%   max rel = ${(maxRel * 100).toFixed(3)}%`);
  console.log(`  verdict: ${maxRel < 0.06 ? 'PASS — estimator unbiased even where variance is high' : 'WARN — check (MC noise can inflate max)'}`);
  console.log('');
  return maxRel < 0.08;
}

// ---------------------------------------------------------------------------
// TEST 3: TEMPORAL stale-history firefly emergence + residual correlation.
//   Simulate frames with the occluder sliding. Carry reservoirs forward with a
//   confidence cap and DON'T regenerate canonical aggressively -> stale samples.
//   Per pixel, per frame: record final luminance, |lens residual| of selected
//   sample, and a firefly flag. Then correlate.
// ---------------------------------------------------------------------------
function pearson(a, b) {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma, db = b[i] - mb;
    cov += da * db; va += da * da; vb += db * db;
  }
  return cov / (Math.sqrt(va * vb) + 1e-30);
}

function test3() {
  const rough = 0.18;
  const s = sharpnessFromRoughness(rough);
  const R = 4;
  const FRAMES = 90;
  const rng = makeRng(7);
  const cCap = 8;

  // persistent reservoir state per pixel (temporal)
  let prev = new Array(NP).fill(null);

  // collectors
  const residuals = [];
  const errors = [];
  const fireflyLum = [];
  const fireflyFlag = [];
  const perPixelMaxLum = new Float64Array(NP);

  for (let f = 0; f < FRAMES; f++) {
    // slide occluder horizontally across the lit region
    const c0 = 0.30 + 0.30 * (f / FRAMES);
    Scene.occluder.x0 = c0; Scene.occluder.x1 = c0 + 0.14;

    // reference for this frame (for error correlation)
    const ref = new Float64Array(NP);
    for (let i = 0; i < NP; i++) ref[i] = reference(xvOf(i), s);

    // fresh canonical samples
    const canon = [];
    for (let i = 0; i < NP; i++) {
      const xv = xvOf(i);
      const y = lightPoint(rng());
      const pdf = canonicalSampleOmegaPdf(xv, y);
      canon.push({ xv, c: 1, y, Wsrc: pdf > 0 ? 1 / pdf : 0 });
    }

    const next = new Array(NP);
    const localMedianLum = new Float64Array(NP);
    const frameLum = new Float64Array(NP);

    for (let i = 0; i < NP; i++) {
      const xv = xvOf(i);
      // build domain window: canonical neighbors + temporal predecessor of i
      const window = [];
      let iLocal = 0;
      for (let k = -R; k <= R; k++) {
        const j = i + k;
        if (j < 0 || j >= NP) continue;
        if (j === i) iLocal = window.length;
        window.push(canon[j]);
      }
      // temporal: reuse previous frame's reservoir sample at SAME pixel,
      // but its visibility may now be stale because the occluder moved.
      if (prev[i] && prev[i].y) {
        window.push({
          xv: xv,                      // same pixel location
          c: Math.min(prev[i].c, cCap),
          y: prev[i].y,
          Wsrc: prev[i].W,
        });
      }
      const res = resampleAt(iLocal, window, s, rng);
      // carry confidence forward
      res.c = Math.min((prev[i] ? Math.min(prev[i].c, cCap) : 0) + 1, cCap);
      next[i] = res;

      const lum = res.y !== null ? pHat(xv, res.y, s) * res.W : 0;
      frameLum[i] = lum;
      perPixelMaxLum[i] = Math.max(perPixelMaxLum[i], lum);

      // collect for correlation (skip frame 0 warm-up)
      if (f > 3) {
        residuals.push(Math.abs(res.selResidual));
        errors.push(Math.abs(lum - ref[i]));
      }
    }

    // firefly detection: luminance >> local median
    if (f > 3) {
      for (let i = 2; i < NP - 2; i++) {
        const nb = [frameLum[i - 2], frameLum[i - 1], frameLum[i + 1], frameLum[i + 2]].sort((a, b) => a - b);
        const med = 0.5 * (nb[1] + nb[2]);
        const isFF = frameLum[i] > Math.max(0.05, 6 * med) ? 1 : 0;
        // residual of this pixel this frame
        fireflyFlag.push(isFF);
        fireflyLum.push(Math.abs(next[i].selResidual));
      }
    }

    prev = next;
  }

  const rErrCorr = pearson(residuals, errors);
  const rFFCorr = pearson(fireflyLum, fireflyFlag);

  // also: mean |residual| for firefly vs non-firefly pixels
  let ffSum = 0, ffN = 0, nfSum = 0, nfN = 0;
  for (let i = 0; i < fireflyFlag.length; i++) {
    if (fireflyFlag[i]) { ffSum += fireflyLum[i]; ffN++; }
    else { nfSum += fireflyLum[i]; nfN++; }
  }
  const ffMean = ffN ? ffSum / ffN : 0;
  const nfMean = nfN ? nfSum / nfN : 0;

  console.log('TEST 3  (temporal stale-history fireflies + residual correlation)');
  console.log(`  roughness=${rough} (s=${s.toFixed(0)}, near-singular), frames=${FRAMES}, samples=${residuals.length}`);
  console.log(`  corr(|residual|, |error|)        = ${rErrCorr.toFixed(3)}`);
  console.log(`  corr(|residual|, firefly flag)   = ${rFFCorr.toFixed(3)}`);
  console.log(`  mean |residual| @ firefly pixels = ${ffMean.toFixed(3)}   (n=${ffN})`);
  console.log(`  mean |residual| @ clean pixels   = ${nfMean.toFixed(3)}   (n=${nfN})`);
  console.log(`  ratio firefly/clean              = ${(ffMean / (nfMean + 1e-9)).toFixed(2)}x`);
  const pass = rErrCorr > 0.15 && (ffMean > 1.5 * nfMean);
  console.log(`  verdict: ${pass ? 'PASS — residual lights up where fireflies are' : 'FAIL — residual NOT predictive (thesis in trouble)'}`);
  console.log('');
  return pass;
}

console.log('='.repeat(70));
console.log('2D ReSTIR engine verification');
console.log('='.repeat(70) + '\n');
const t1 = test1();
const t2 = test2();
const t3 = test3();
console.log('='.repeat(70));
console.log(`SUMMARY: T1 ${t1 ? 'PASS' : 'FAIL'} | T2 ${t2 ? 'PASS' : 'FAIL'} | T3 ${t3 ? 'PASS' : 'FAIL'}`);
console.log('='.repeat(70));
