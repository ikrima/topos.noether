'use strict';
// =============================================================================
// 2D ReSTIR path-reuse engine  —  verification harness
//
// Goal: prove (1) the reconnection shift + Jacobian + RIS weights are UNBIASED
//       (reuse estimate converges to a brute-force reference on smooth diffuse),
//       (2) fireflies EMERGE near the occluder / specular band,
//       (3) the lens residual r = log p_dst + log|T'| - log p_src is correlated
//       with where the fireflies land.
//
// Flatland (2D) light transport, direct lighting, reservoir reuse across pixels.
// =============================================================================

// ---------- vec2 helpers -----------------------------------------------------
const V = (x, y) => ({ x, y });
const sub = (a, b) => V(a.x - b.x, a.y - b.y);
const add = (a, b) => V(a.x + b.x, a.y + b.y);
const scale = (a, s) => V(a.x * s, a.y * s);
const dot = (a, b) => a.x * b.x + a.y * b.y;
const len = (a) => Math.hypot(a.x, a.y);
const norm = (a) => { const l = len(a) || 1e-12; return V(a.x / l, a.y / l); };

// ---------- RNG (deterministic, seedable) ------------------------------------
function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    // mulberry32
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Scene ------------------------------------------------------------
// Floor: y = 0, x in [0,1]. Shading points spread along it.
// Light: horizontal segment at y = LY, x in [LX0, LX1], normal pointing DOWN.
// Occluder: short horizontal segment (thin blocker) at (OX0..OX1, OY).
// Camera: a point far above; view direction at a floor point is toward camera.
const Scene = {
  light: { y: 1.0, x0: 0.34, x1: 0.66, Le: 1.0 },
  occluder: { y: 0.45, x0: 0.46, x1: 0.62 }, // draggable in UI; fixed here
  camera: V(0.5, 3.0),
  n: V(0, 1),          // floor normal
  nLight: V(0, -1),    // light normal (points down toward floor)
  // material
  kd: 0.35,            // diffuse weight
  ks: 0.9,             // glossy weight
};

function lightArclen() { return Scene.light.x1 - Scene.light.x0; }
function lightPoint(u) { // u in [0,1] -> point on light
  return V(Scene.light.x0 + u * (Scene.light.x1 - Scene.light.x0), Scene.light.y);
}

// segment intersection test: does segment p->q cross the occluder segment?
function segCross(p, q, ax0, ax1, ay) {
  // occluder is horizontal at y=ay from x=ax0..ax1
  const dy = q.y - p.y;
  if (Math.abs(dy) < 1e-12) return false;
  const t = (ay - p.y) / dy;
  if (t <= 1e-6 || t >= 1 - 1e-6) return false;
  const x = p.x + t * (q.x - p.x);
  return x >= ax0 && x <= ax1;
}

function visible(xv, y) {
  const o = Scene.occluder;
  return segCross(xv, y, o.x0, o.x1, o.y) ? 0 : 1;
}

// ---------- BRDF + target function ------------------------------------------
// roughness slider -> Blinn-Phong exponent s. Small roughness -> huge s -> sharp
// (near-singular) lobe with a TALL peak (energy concentrates).
function sharpnessFromRoughness(rough) {
  // rough in (0,1]; s grows as rough shrinks
  const r = Math.max(1e-3, rough);
  return Math.max(1.0, 2.0 / (r * r));
}

// p_hat in SOLID-ANGLE (planar-angle) measure at the shading point xv,
// for a light point y. Includes BRDF, cosine foreshortening, visibility, Le.
function pHat(xv, y, s) {
  const wo = norm(sub(Scene.camera, xv)); // toward camera
  const wl = sub(y, xv);
  const d = len(wl);
  if (d < 1e-9) return 0;
  const wlN = scale(wl, 1 / d);
  const cosSurf = dot(Scene.n, wlN);
  if (cosSurf <= 0) return 0;            // light below horizon
  // Blinn-Phong glossy lobe (tall, narrow when s large)
  const h = norm(add(wo, wlN));
  const hn = Math.max(0, dot(h, Scene.n));
  const glossy = Scene.ks * (s + 1) * Math.pow(hn, s);
  const brdf = Scene.kd + glossy;
  const vis = visible(xv, y);
  return brdf * cosSurf * vis * Scene.light.Le;
}

// Jacobian dA(y) -> dOmega at xv :  dOmega = (cosTheta_y / d) dA
function dAtoDOmega(xv, y) {
  const wl = sub(y, xv);
  const d = len(wl);
  if (d < 1e-9) return 0;
  const wlN = scale(wl, 1 / d);
  const cosY = dot(Scene.nLight, scale(wlN, -1)); // angle at light point
  if (cosY <= 0) return 0;
  return cosY / d;
}

// ---------- Brute-force reference -------------------------------------------
// L(xv) = ∫_light pHat(xv,y) * (cosY/d) dA(y)   (dense quadrature)
function reference(xv, s, N = 4000) {
  const L0 = lightArclen();
  let acc = 0;
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N;
    const y = lightPoint(u);
    acc += pHat(xv, y, s) * dAtoDOmega(xv, y);
  }
  return acc * (L0 / N);
}

// ---------- Reconnection shift ----------------------------------------------
// A reservoir sample is a light point y. Reuse from pixel j at pixel i keeps y
// fixed and recomputes the direction. Jacobian |T'_{j->i}| = dOmega_i / dOmega_j.
function shiftJacobian(xvJ, xvI, y) {
  const gj = dAtoDOmega(xvJ, y);
  const gi = dAtoDOmega(xvI, y);
  if (gj < 1e-12) return 0;
  return gi / gj; // dOmega_i / dOmega_j
}

// ---------- canonical sampling pdf in angle measure -------------------------
// Sample y uniformly by arclength on the light: pdf_A = 1/L0.
// pdf_omega(omega) = pdf_A * dA/dOmega = (1/L0) * (d/cosY) = (1/L0)/dAtoDOmega.
function canonicalSampleOmegaPdf(xv, y) {
  const g = dAtoDOmega(xv, y);
  if (g < 1e-12) return 0;
  return (1 / lightArclen()) * 1 / g; // pdf in angle measure
}

// =============================================================================
// Reservoir + generalized balance heuristic (confidence-weighted)
// =============================================================================
function makeReservoir() {
  return { y: null, wSum: 0, W: 0, c: 0, M: 0, selResidual: 0 };
}

// A "domain" = a pixel: { xv, c (confidence), sample y (light point), Wsrc }
// Candidate from domain d, evaluated/resampled at target i.

// generalized balance heuristic MIS weight for the candidate that came from
// domain `dIdx`, with its own sample y_d. Common measure: domain d's angle measure.
function balanceWeight(domains, dIdx, s) {
  const d = domains[dIdx];
  const yd = d.y;
  // numerator: c_d * pHat_d(y_d in d's measure)
  const num = d.c * pHat(d.xv, yd, s);
  if (num <= 0) return 0;
  let den = 0;
  for (let l = 0; l < domains.length; l++) {
    const dom = domains[l];
    // shift y_d to domain l (keep y_d), express pHat in domain d's measure:
    // pHat_l(omega_l) * |J_{d->l}|, where J_{d->l} = dOmega_l/dOmega_d
    const J = (l === dIdx) ? 1 : shiftJacobian(d.xv, dom.xv, yd);
    if (J <= 0) continue;
    const pl = pHat(dom.xv, yd, s);
    den += dom.c * pl * J;
  }
  if (den <= 0) return 0;
  return num / den;
}

// Resample at target pixel i over a set of candidate domains.
// Each domain provides: xv, c (confidence), y (its reservoir sample), Wsrc.
// Returns finalized reservoir for i, plus the lens residual of the selected sample.
function resampleAt(iIdx, domains, s, rng) {
  const target = domains[iIdx];
  const res = makeReservoir();
  for (let d = 0; d < domains.length; d++) {
    const dom = domains[d];
    if (dom.y === null) continue;
    const yd = dom.y;
    // shift sample d -> target i
    const J = (d === iIdx) ? 1 : shiftJacobian(dom.xv, target.xv, yd);
    if (J <= 0) continue;
    const pHatTarget = pHat(target.xv, yd, s);
    if (pHatTarget <= 0) {
      // still must account for it via MIS denom elsewhere; contributes 0 weight
      continue;
    }
    const m = balanceWeight(domains, d, s);
    if (m <= 0) continue;
    const w = m * pHatTarget * dom.Wsrc * J;
    if (!(w > 0)) continue;
    res.wSum += w;
    res.M += 1;
    if (rng() < w / res.wSum) {
      res.y = yd;
      // lens residual of THIS (currently selected) candidate
      const pSrc = pHat(dom.xv, yd, s);
      const r = Math.log(Math.max(pHatTarget, 1e-30))
              + Math.log(Math.max(J, 1e-30))
              - Math.log(Math.max(pSrc, 1e-30));
      res.selResidual = (d === iIdx) ? 0 : r;
    }
  }
  res.c = Math.min(domains.reduce((a, b) => a + b.c, 0), 1e9);
  if (res.y !== null) {
    const pf = pHat(target.xv, res.y, s);
    res.W = pf > 0 ? res.wSum / pf : 0;
  }
  return res;
}

module.exports = {
  V, sub, add, scale, dot, len, norm, makeRng,
  Scene, lightArclen, lightPoint, visible,
  sharpnessFromRoughness, pHat, dAtoDOmega, reference,
  shiftJacobian, canonicalSampleOmegaPdf,
  makeReservoir, balanceWeight, resampleAt,
};
