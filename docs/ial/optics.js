// optics.js — honest scalar-diffraction engine for the microscopy companion.
// Everything here is computed, not faked: 2-D FFT, coherent + partially coherent
// image formation through a circular pupil, incoherent OTF imaging, Airy patterns.

const REVCACHE = new Map();
function bitrev(n) {
  let t = REVCACHE.get(n);
  if (t) return t;
  t = new Uint32Array(n);
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    t[i] = j;
  }
  REVCACHE.set(n, t);
  return t;
}

export function fft(re, im, inv) {
  const n = re.length, rev = bitrev(n);
  for (let i = 1; i < n; i++) {
    const j = rev[i];
    if (j > i) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const ang = (inv ? 2 : -2) * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const a = i + k, b = a + half;
        const ur = re[a], ui = im[a];
        const vr = re[b] * cr - im[b] * ci;
        const vi = re[b] * ci + im[b] * cr;
        re[a] = ur + vr; im[a] = ui + vi;
        re[b] = ur - vr; im[b] = ui - vi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

export function fft2(re, im, N, inv) {
  const tr = new Float64Array(N), ti = new Float64Array(N);
  for (let y = 0; y < N; y++) {
    const o = y * N;
    for (let x = 0; x < N; x++) { tr[x] = re[o + x]; ti[x] = im[o + x]; }
    fft(tr, ti, inv);
    for (let x = 0; x < N; x++) { re[o + x] = tr[x]; im[o + x] = ti[x]; }
  }
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) { const i = y * N + x; tr[y] = re[i]; ti[y] = im[i]; }
    fft(tr, ti, inv);
    for (let y = 0; y < N; y++) { const i = y * N + x; re[i] = tr[y]; im[i] = ti[y]; }
  }
}

// Signed frequency index for row/col k on an N-grid (unshifted FFT order).
function sidx(k, N) { return k < N / 2 ? k : k - N; }

// ---------------------------------------------------------------------------
// Objects. All return amplitude transmittance on an N x N grid spanning L µm.
// ---------------------------------------------------------------------------
export function makeObject(kind, N, L, p) {
  const o = new Float64Array(N * N);
  const dx = L / N;
  if (kind === 'grating' || kind === 'cross') {
    const period = p.period;
    for (let y = 0; y < N; y++) {
      const yy = y * dx;
      const by = ((yy % period) / period) < 0.5 ? 1 : 0;
      for (let x = 0; x < N; x++) {
        const xx = x * dx;
        const bx = ((xx % period) / period) < 0.5 ? 1 : 0;
        o[y * N + x] = kind === 'cross' ? bx * by : bx;
      }
    }
    return o;
  }
  if (kind === 'points') {
    const sep = p.sep, r = 0.055;
    const cx = L / 2, cy = L / 2;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const xx = x * dx - cx, yy = y * dx - cy;
      const d1 = Math.hypot(xx + sep / 2, yy), d2 = Math.hypot(xx - sep / 2, yy);
      o[y * N + x] = (d1 < r || d2 < r) ? 1 : 0;
    }
    return o;
  }
  // 'specimen' — synthetic phase-poor absorbing cell with fine internal striations.
  const cells = [
    { x: .38, y: .42, a: .20, b: .13, rot: .5 },
    { x: .62, y: .58, a: .17, b: .11, rot: -.7 },
    { x: .30, y: .70, a: .11, b: .09, rot: .2 },
  ];
  // µm — the fine structure that NA and the condenser decide you can or cannot see
  const stri = p && p.stri ? p.stri : 0.42;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N;
    let t = 1.0;
    for (const c of cells) {
      const ux = (u - c.x) * Math.cos(c.rot) + (v - c.y) * Math.sin(c.rot);
      const uy = -(u - c.x) * Math.sin(c.rot) + (v - c.y) * Math.cos(c.rot);
      const q = (ux / c.a) ** 2 + (uy / c.b) ** 2;
      if (q < 1) {
        const edge = Math.min(1, (1 - q) * 6);
        t *= 1 - 0.34 * edge;                                    // cytoplasm
        const sv = 0.5 + 0.5 * Math.cos(2 * Math.PI * (x * dx) / stri);
        t *= 1 - 0.30 * sv * edge;                               // striations
        const nq = ((ux + c.a * .28) / (c.a * .34)) ** 2 + ((uy - c.b * .2) / (c.b * .42)) ** 2;
        if (nq < 1) t *= 0.62;                                   // nucleus
      }
    }
    o[y * N + x] = t;
  }
  return o;
}

// A frequency chirp target: instantaneous spatial frequency ramps across the field.
export function makeChirp(N, L, f0, f1) {
  const o = new Float64Array(N * N), dx = L / N;
  for (let x = 0; x < N; x++) {
    const xx = x * dx;
    const phase = 2 * Math.PI * (f0 * xx + (f1 - f0) * xx * xx / (2 * L));
    const v = 0.5 + 0.5 * Math.cos(phase);
    for (let y = 0; y < N; y++) o[y * N + x] = v;
  }
  return o;
}

// ---------------------------------------------------------------------------
// Coherent imaging: I = |F^-1{ O(f) · P(f) }|^2 . This is Abbe's experiment.
// blocked = [[px,py], ...] in *shifted display* pixel coords (centre at N/2).
// ---------------------------------------------------------------------------
export function coherent(obj, N, L, lambda_nm, NA, blocked, blockR) {
  const re = Float64Array.from(obj), im = new Float64Array(N * N);
  fft2(re, im, N, false);
  const spec = new Float64Array(N * N);           // display magnitude, shifted
  const rc = (NA / (lambda_nm / 1000)) * L;       // cutoff radius in index units
  const br = blockR == null ? 4 : blockR;
  for (let y = 0; y < N; y++) {
    const ky = sidx(y, N);
    for (let x = 0; x < N; x++) {
      const kx = sidx(x, N), i = y * N + x;
      spec[((ky + N / 2) | 0) * N + ((kx + N / 2) | 0)] = Math.hypot(re[i], im[i]);
      let pass = (kx * kx + ky * ky) <= rc * rc;
      if (pass && blocked) {
        for (let b = 0; b < blocked.length; b++) {
          const bx = blocked[b][0] - N / 2, by = blocked[b][1] - N / 2;
          if ((kx - bx) ** 2 + (ky - by) ** 2 <= br * br) { pass = false; break; }
        }
      }
      if (!pass) { re[i] = 0; im[i] = 0; }
    }
  }
  fft2(re, im, N, true);
  const img = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) img[i] = re[i] * re[i] + im[i] * im[i];
  return { img, spec, cutoffPx: rc };
}

// ---------------------------------------------------------------------------
// Partially coherent imaging (Hopkins, source-point summation).
// Each condenser point s contributes |F^-1{ O(f)·P(f+s) }|^2 , summed in intensity.
// This is what the aperture (condenser) diaphragm actually does.
// ---------------------------------------------------------------------------
export function partial(obj, N, L, lambda_nm, NAobj, NAcond, maxPts) {
  const O_re = Float64Array.from(obj), O_im = new Float64Array(N * N);
  fft2(O_re, O_im, N, false);
  const lam = lambda_nm / 1000;
  const rc = (NAobj / lam) * L;
  const rs = (NAcond / lam) * L;
  // Source points on an area-uniform lattice clipped to the condenser disc.
  // The rim matters: it is the obliquity that carries the highest object
  // frequencies through the objective, so it must be sampled honestly.
  const pts = [];
  const step = Math.max(1, rs / 3.2);
  const k = Math.ceil(rs / step);
  for (let j = -k; j <= k; j++) for (let i = -k; i <= k; i++) {
    const sx = i * step, sy = j * step;
    if (sx * sx + sy * sy <= rs * rs) pts.push([sx, sy]);
  }
  if (!pts.length) pts.push([0, 0]);
  const cap = maxPts || 64;
  while (pts.length > cap) pts.splice(Math.floor(pts.length / 2), 1);

  const acc = new Float64Array(N * N);
  const re = new Float64Array(N * N), im = new Float64Array(N * N);
  for (const [sx, sy] of pts) {
    re.fill(0); im.fill(0);
    for (let y = 0; y < N; y++) {
      const ky = sidx(y, N);
      for (let x = 0; x < N; x++) {
        const kx = sidx(x, N);
        const fx = kx + sx, fy = ky + sy;
        if (fx * fx + fy * fy <= rc * rc) { const i = y * N + x; re[i] = O_re[i]; im[i] = O_im[i]; }
      }
    }
    fft2(re, im, N, true);
    for (let i = 0; i < N * N; i++) acc[i] += re[i] * re[i] + im[i] * im[i];
  }
  for (let i = 0; i < N * N; i++) acc[i] /= pts.length;
  return { img: acc, nPts: pts.length };
}

// ---------------------------------------------------------------------------
// Incoherent imaging via the OTF (autocorrelation of the pupil, done by FFT).
// ---------------------------------------------------------------------------
export function incoherent(objI, N, L, lambda_nm, NA) {
  const lam = lambda_nm / 1000, rc = (NA / lam) * L;
  const pr = new Float64Array(N * N), pi = new Float64Array(N * N);
  for (let y = 0; y < N; y++) {
    const ky = sidx(y, N);
    for (let x = 0; x < N; x++) {
      const kx = sidx(x, N);
      if (kx * kx + ky * ky <= rc * rc) pr[y * N + x] = 1;
    }
  }
  fft2(pr, pi, N, true);
  const psf = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) psf[i] = pr[i] * pr[i] + pi[i] * pi[i];
  const hr = Float64Array.from(psf), hi = new Float64Array(N * N);
  fft2(hr, hi, N, false);
  const or_ = Float64Array.from(objI), oi = new Float64Array(N * N);
  fft2(or_, oi, N, false);
  const norm = hr[0] || 1;
  for (let i = 0; i < N * N; i++) {
    const a = or_[i], b = oi[i], c = hr[i] / norm, d = hi[i] / norm;
    or_[i] = a * c - b * d; oi[i] = a * d + b * c;
  }
  fft2(or_, oi, N, true);
  const out = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) out[i] = Math.max(0, or_[i]);
  return out;
}

// Box-integrating detector: average the continuous image over each pixel footprint.
export function sample(img, N, L, pixelUm) {
  const n = Math.max(2, Math.floor(L / pixelUm));
  const out = new Float64Array(n * n);
  const step = N / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    let s = 0, c = 0;
    const y0 = Math.floor(j * step), y1 = Math.max(y0 + 1, Math.floor((j + 1) * step));
    const x0 = Math.floor(i * step), x1 = Math.max(x0 + 1, Math.floor((i + 1) * step));
    for (let y = y0; y < y1 && y < N; y++) for (let x = x0; x < x1 && x < N; x++) { s += img[y * N + x]; c++; }
    out[j * n + i] = c ? s / c : 0;
  }
  return { data: out, n };
}

// ---------------------------------------------------------------------------
// Airy pattern / two-point incoherent imaging, analytic.
// ---------------------------------------------------------------------------
export function besselJ1(x) {
  const ax = Math.abs(x);
  if (ax < 3) {
    const y = (x / 3) ** 2;
    return x * (0.5 - 0.56249985 * y + 0.21093573 * y * y - 0.03954289 * y ** 3
      + 0.00443319 * y ** 4 - 0.00031761 * y ** 5 + 0.00001109 * y ** 6);
  }
  const z = 3 / ax;
  const f = 0.79788456 + 0.00000156 * z + 0.01659667 * z * z + 0.00017105 * z ** 3
    - 0.00249511 * z ** 4 + 0.00113653 * z ** 5 - 0.00020033 * z ** 6;
  const th = ax - 2.35619449 + z * (0.12499612 + z * (0.00005650 + z * (-0.00637879
    + z * (0.00074348 + z * (0.00079824 + z * (-0.00029166))))));
  const v = f / Math.sqrt(ax) * Math.cos(th);
  return x < 0 ? -v : v;
}

// Normalised Airy intensity at radius r (µm).
export function airy(r, NA, lambda_nm) {
  const v = 2 * Math.PI * NA * r / (lambda_nm / 1000);
  if (Math.abs(v) < 1e-9) return 1;
  const j = besselJ1(v);
  return (2 * j / v) ** 2;
}

// Two incoherent point sources separated by sep (µm), on an N x N field of L µm.
export function twoPointField(N, L, sep, NA, lambda_nm) {
  const out = new Float64Array(N * N), dx = L / N, c = L / 2;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const xx = x * dx - c, yy = y * dx - c;
    out[y * N + x] = airy(Math.hypot(xx + sep / 2, yy), NA, lambda_nm)
      + airy(Math.hypot(xx - sep / 2, yy), NA, lambda_nm);
  }
  return out;
}

// RMS contrast (std / mean). Unlike Michelson it does not saturate at 1 the moment
// a single pixel goes dark, so it can actually detect a blank-but-lit field.
export function rmsContrast(img, N) {
  const n = N * N;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += img[i];
  mean /= n;
  if (mean <= 1e-12) return 0;
  let v = 0;
  for (let i = 0; i < n; i++) { const d = img[i] - mean; v += d * d; }
  return Math.sqrt(v / n) / mean;
}

// Erode a binary mask by r pixels (city-block), so measurements taken inside
// structures are not contaminated by ringing that lives on their boundaries.
// Returns the original mask if erosion would leave too little to measure.
export function erode(mask, N, r) {
  let orig = 0;
  for (let i = 0; i < mask.length; i++) orig += mask[i];
  let cur = mask;
  for (let pass = 0; pass < r; pass++) {
    const next = new Uint8Array(N * N);
    let cnt = 0;
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x;
      if (cur[i] && cur[i - 1] && cur[i + 1] && cur[i - N] && cur[i + N]) { next[i] = 1; cnt++; }
    }
    if (cnt < 0.15 * orig || cnt < 64) return cur;
    cur = next;
  }
  return cur;
}

// Split an object into background and structure using its own modal (most common)
// transmittance, so bright-on-dark and dark-on-bright specimens both work.
// Returns { mask, bg, bgFrac } where mask marks STRUCTURE.
export function structureMask(obj, N, tol) {
  const n = N * N, BINS = 64, hist = new Int32Array(BINS);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) { const v = obj[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
  const span = hi - lo || 1;
  for (let i = 0; i < n; i++) {
    let b = Math.floor((obj[i] - lo) / span * BINS);
    if (b >= BINS) b = BINS - 1; if (b < 0) b = 0;
    hist[b]++;
  }
  let mb = 0;
  for (let b = 1; b < BINS; b++) if (hist[b] > hist[mb]) mb = b;
  const bg = lo + (mb + 0.5) * span / BINS;
  const t = tol == null ? 0.06 * span : tol;
  const mask = new Uint8Array(n);
  let cnt = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(obj[i] - bg) > t) { mask[i] = 1; cnt++; }
  }
  return { mask, bg, bgFrac: 1 - cnt / n };
}

// Edge overshoot: how far the brightest pixel exceeds the open-field background.
// Pure ringing — intensity the specimen never had, manufactured by coherent
// illumination. Returns null when the object has no genuine open field to
// reference (a full-field grating, or sparse bright points on black), because the
// measurement is then undefined rather than merely small.
export function overshoot(img, mask, N, bgFrac) {
  const n = N * N;
  let bg = 0, c = 0, mx = 0, structMax = 0;
  for (let i = 0; i < n; i++) {
    if (img[i] > mx) mx = img[i];
    if (mask[i]) { if (img[i] > structMax) structMax = img[i]; }
    else { bg += img[i]; c++; }
  }
  if (!c) return null;
  bg /= c;
  if (bgFrac != null && bgFrac < 0.25) return null;   // not enough open field
  if (bg <= 0.15 * mx) return null;                   // background is dark, not an open field
  return Math.max(0, mx / bg - 1);
}

// Phase-referenced modulation depth at frequency f, measured ONLY where mask is set.
// The projection is accumulated as ONE complex sum over the whole masked region, so
// genuinely transmitted striations (which share the object's phase everywhere) add
// coherently, while edge-ringing energy near the same frequency cancels instead of
// being rectified into a false signal.
export function freqAmpMasked(img, mask, N, L, f) {
  let mean = 0, cnt = 0;
  for (let i = 0; i < N * N; i++) if (mask[i]) { mean += img[i]; cnt++; }
  if (!cnt) return 0;
  mean /= cnt;
  if (mean <= 1e-12) return 0;
  const cs = new Float64Array(N), sn = new Float64Array(N);
  for (let x = 0; x < N; x++) {
    const ph = 2 * Math.PI * f * (x * L / N);
    cs[x] = Math.cos(ph); sn[x] = Math.sin(ph);
  }
  let re = 0, im = 0;
  for (let y = 0; y < N; y++) {
    const o = y * N;
    for (let x = 0; x < N; x++) {
      if (!mask[o + x]) continue;
      const v = img[o + x] - mean;
      re += v * cs[x]; im += v * sn[x];
    }
  }
  return 2 * Math.hypot(re, im) / cnt / mean;
}

// Whole-field Michelson contrast of an intensity map.
export function michelson(img, N) {
  let mn = Infinity, mx = -Infinity;
  for (let i = 0; i < N * N; i++) { const v = img[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
  return mx + mn <= 1e-12 ? 0 : (mx - mn) / (mx + mn);
}

// Whole-field modulation depth at spatial frequency f (cyc/µm) along x, measured
// from the computed image and normalised by the field mean. A measurement, not an estimate.
export function freqAmp(img, N, L, f) {
  let mean = 0;
  for (let i = 0; i < N * N; i++) mean += img[i];
  mean /= N * N;
  if (mean <= 1e-12) return 0;
  const cs = new Float64Array(N), sn = new Float64Array(N);
  for (let x = 0; x < N; x++) {
    const ph = 2 * Math.PI * f * (x * L / N);
    cs[x] = Math.cos(ph); sn[x] = Math.sin(ph);
  }
  // Per-row complex amplitude, then average the magnitudes so rows stay in phase-agnostic sum.
  let acc = 0;
  for (let y = 0; y < N; y++) {
    const o = y * N;
    let re = 0, im = 0;
    for (let x = 0; x < N; x++) { const v = img[o + x]; re += v * cs[x]; im += v * sn[x]; }
    acc += 2 * Math.hypot(re, im) / N;
  }
  return acc / N / mean;
}

export function meanOf(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; }

// Strongest non-DC periodicity along x in an n x n map spanning L µm.
// Rows are averaged first (the targets here vary only in x), then a plain DFT.
// Returns { period, amp } with period in µm and amp as modulation depth.
export function dominantPeriod(data, n, L) {
  const prof = new Float64Array(n);
  for (let y = 0; y < n; y++) { const o = y * n; for (let x = 0; x < n; x++) prof[x] += data[o + x]; }
  let mean = 0;
  for (let x = 0; x < n; x++) { prof[x] /= n; mean += prof[x]; }
  mean /= n;
  if (mean <= 1e-12) return { period: null, amp: 0 };
  let bk = 0, bv = 0;
  const kmax = Math.floor(n / 2);
  for (let k = 1; k <= kmax; k++) {
    let re = 0, im = 0;
    for (let x = 0; x < n; x++) {
      const ph = 2 * Math.PI * k * x / n;
      const v = prof[x] - mean;
      re += v * Math.cos(ph); im += v * Math.sin(ph);
    }
    const a = 2 * Math.hypot(re, im) / n;
    if (a > bv) { bv = a; bk = k; }
  }
  return bk ? { period: L / bk, amp: bv / mean } : { period: null, amp: 0 };
}

export function maxOf(a) { let m = 0; for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; }

export function row(img, N, y) {
  const o = ((y == null ? (N / 2) | 0 : y)) * N, r = new Float64Array(N);
  for (let x = 0; x < N; x++) r[x] = img[o + x];
  return r;
}
