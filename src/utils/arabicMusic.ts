// Studio-Grade 32 kHz Stereo Arabic Wedding Instrumental Synthesizer
// Composed in Maqam Hijaz Kar / Hijaz in D (D - Eb - F# - G - A - Bb - C# - D)
// 24-Bar Luxury Bridal / Nikah Entrance Groove (~56.47s seamless circular loop):
// - Fractional-Delay Double-Course Arabic Oud with Spruce Body Resonance & Risha Tremolos
// - Lush Middle Eastern Firqa String Ensemble with Delayed Vibrato & Legato Glissandos
// - Warm Qanun Ornamental Flourishes
// - Authentic Arabic Percussion: Darbuka (Doum, Tak, Ka), Daf Frame Drum, Silky Riq Shimmer
// - Clean Warm Modern Bass + 4-Line Hadamard FDN Concert Hall Reverb + Circular Seamless Loop

const SAMPLE_RATE = 32000;
const BPM = 102;
const BEAT_SEC = 60 / BPM;
const BAR_SEC = BEAT_SEC * 4;
const TOTAL_BARS = 24;
const LOOP_DURATION_SEC = BAR_SEC * TOTAL_BARS; // ~56.4706s exact seamless loop
const TAIL_SEC = 2.6; // Reverb & sustain wraparound window for 0ms gapless looping

// Fast 4096-point wavetable for high-precision, ultra-fast bowed string & percussion synthesis
const TABLE_SIZE = 4096;
const TABLE_MASK = TABLE_SIZE - 1;
const SIN_TABLE = new Float32Array(TABLE_SIZE);
for (let i = 0; i < TABLE_SIZE; i++) {
  SIN_TABLE[i] = Math.sin((i / TABLE_SIZE) * Math.PI * 2);
}

// Deterministic PRNG so the subtle humanization & plucks sound consistent & clean
function createRng(seed = 11122026) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function mixMono(
  outL: Float32Array,
  outR: Float32Array,
  src: Float32Array,
  startSample: number,
  gainL: number,
  gainR: number
) {
  const maxLen = Math.min(src.length, outL.length - startSample);
  if (maxLen <= 0 || startSample < 0) return;
  for (let i = 0; i < maxLen; i++) {
    const s = src[i];
    outL[startSample + i] += s * gainL;
    outR[startSample + i] += s * gainR;
  }
}

// 1. AUTHENTIC ARABIC DARBUKA (DOUM, TAK, KA)
function makeDarbukaSample(kind: 'doum' | 'tak' | 'ka', rng: () => number): Float32Array {
  const dur = kind === 'doum' ? 0.34 : 0.14;
  const len = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(len);

  let ph1 = 0;
  let ph2 = 0;
  let ph3 = 0;
  let lp = 0;
  let hpPrev = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.0022);

    if (kind === 'doum') {
      const f1 = 74 + 98 * Math.exp(-t / 0.022);
      const f2 = 148 + 120 * Math.exp(-t / 0.014);
      ph1 += (2 * Math.PI * f1) / SAMPLE_RATE;
      ph2 += (2 * Math.PI * f2) / SAMPLE_RATE;

      const body = Math.sin(ph1) * Math.exp(-t / 0.115) * 0.85;
      const over = Math.sin(ph2) * Math.exp(-t / 0.045) * 0.25;
      const thump = Math.exp(-t / 0.009) * 0.18;

      buf[i] = Math.tanh((body + over + thump) * 1.1) * attack * 0.68;
    } else {
      const isTak = kind === 'tak';
      const f1 = (isTak ? 335 : 290) + 210 * Math.exp(-t / 0.009);
      const f2 = (isTak ? 585 : 495) + 240 * Math.exp(-t / 0.007);
      const f3 = isTak ? 890 : 760;

      ph1 += (2 * Math.PI * f1) / SAMPLE_RATE;
      ph2 += (2 * Math.PI * f2) / SAMPLE_RATE;
      ph3 += (2 * Math.PI * f3) / SAMPLE_RATE;

      const skin =
        Math.sin(ph1) * Math.exp(-t / 0.032) * 0.55 +
        Math.sin(ph2) * Math.exp(-t / 0.021) * 0.34 +
        Math.sin(ph3) * Math.exp(-t / 0.012) * 0.18;

      const n = rng() * 2 - 1;
      lp += 0.34 * (n - lp);
      const hp = lp - 0.78 * hpPrev;
      hpPrev = lp;
      const slap = hp * Math.exp(-t / (isTak ? 0.016 : 0.012)) * 0.65;

      const level = isTak ? 0.44 : 0.28;
      buf[i] = Math.tanh((skin + slap) * 1.15) * attack * level;
    }
  }
  return buf;
}

// 2. WARM CINEMATIC DAF / FRAME DRUM (REGAL PULSE)
function makeDafFrameDrumSample(rng: () => number): Float32Array {
  const dur = 0.48;
  const len = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(len);
  let ph1 = 0;
  let ph2 = 0;
  let lp = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.006);
    const f1 = 58 + 56 * Math.exp(-t / 0.028);
    const f2 = 128 + 65 * Math.exp(-t / 0.018);

    ph1 += (2 * Math.PI * f1) / SAMPLE_RATE;
    ph2 += (2 * Math.PI * f2) / SAMPLE_RATE;

    const head = Math.sin(ph1) * Math.exp(-t / 0.16) * 0.85;
    const warmOver = Math.sin(ph2) * Math.exp(-t / 0.075) * 0.28;

    const n = rng() * 2 - 1;
    lp += 0.14 * (n - lp);
    const palmBrush = lp * Math.exp(-t / 0.024) * 0.25;

    buf[i] = Math.tanh((head + warmOver + palmBrush) * 1.05) * attack * 0.56;
  }
  return buf;
}

// 3. SILKY ARABIC RIQ (SOFT TAMBOURINE SHIMMER — NO HARSH BELLS)
function makeRiqShimmerSample(accent: boolean, rng: () => number): Float32Array {
  const dur = accent ? 0.11 : 0.065;
  const len = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(len);
  let hp1 = 0;
  let hp2 = 0;
  let lp = 0;
  let prev = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const n = rng() * 2 - 1;
    lp += 0.55 * (n - lp);
    const h1 = lp - 0.88 * prev;
    prev = lp;
    hp1 += 0.35 * (h1 - hp1);
    hp2 = h1 - hp1;

    const jingle =
      (Math.sin(2 * Math.PI * 5320 * t) * 0.35 + Math.sin(2 * Math.PI * 6940 * t) * 0.25) *
      Math.exp(-t / (accent ? 0.032 : 0.016));

    const env = Math.min(1, t / 0.003) * Math.exp(-t / (accent ? 0.034 : 0.018));
    buf[i] = (hp2 * 0.55 + jingle * 0.16) * env * (accent ? 0.14 : 0.085);
  }
  return buf;
}

// 4. FRACTIONAL-DELAY DOUBLE-COURSE ARABIC OUD + WOODEN BODY RESONANCE
function addOudNote(
  outL: Float32Array,
  outR: Float32Array,
  freq: number,
  startSec: number,
  durSec: number,
  gain: number,
  rng: () => number,
  pan = 0.08,
  slideFromFreq?: number,
  slideSec = 0.07
) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.min(Math.floor(durSec * SAMPLE_RATE), outL.length - startSample);
  if (len <= 0 || startSample < 0) return;

  const minFreq = slideFromFreq ? Math.min(freq, slideFromFreq) : freq;
  const bufSize = Math.max(32, Math.ceil(SAMPLE_RATE / minFreq) + 16);

  const ringA = new Float32Array(bufSize);
  const ringB = new Float32Array(bufSize);

  let exLp = 0;
  const pickDelay = Math.max(2, Math.floor(bufSize * 0.22));
  const rawEx = new Float32Array(bufSize);
  for (let i = 0; i < bufSize; i++) {
    const n = rng() * 2 - 1;
    exLp += 0.32 * (n - exLp);
    rawEx[i] = exLp;
  }
  for (let i = 0; i < bufSize; i++) {
    const comb = rawEx[i] - 0.65 * rawEx[(i - pickDelay + bufSize) % bufSize];
    ringA[i] = comb;
    ringB[i] = comb * 0.92 + (rng() * 2 - 1) * 0.04;
  }

  let writePos = 0;
  let prevOutA = 0;
  let prevOutB = 0;

  let res1Y1 = 0;
  let res1Y2 = 0;
  let res2Y1 = 0;
  let res2Y2 = 0;
  let postLp = 0;

  const w1 = (2 * Math.PI * 235) / SAMPLE_RATE;
  const r1 = 0.962;
  const c1a1 = -2 * r1 * Math.cos(w1);
  const c1a2 = r1 * r1;

  const w2 = (2 * Math.PI * 540) / SAMPLE_RATE;
  const r2 = 0.952;
  const c2a1 = -2 * r2 * Math.cos(w2);
  const c2a2 = r2 * r2;

  const slideSamples = slideFromFreq ? Math.floor(slideSec * SAMPLE_RATE) : 0;
  const gainL = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gainR = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  const fadeOutSamples = Math.min(len, Math.floor(0.035 * SAMPLE_RATE));

  const fixedDelayA = Math.max(2.5, Math.min(bufSize - 2, SAMPLE_RATE / freq - 0.5));
  const fixedDelayB = Math.max(2.5, Math.min(bufSize - 2, SAMPLE_RATE / (freq * 1.00095) - 0.5));

  for (let i = 0; i < len; i++) {
    let dA = fixedDelayA;
    let dB = fixedDelayB;

    if (slideFromFreq && i < slideSamples) {
      const u = i / slideSamples;
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * u);
      const curFreq = slideFromFreq + (freq - slideFromFreq) * ease;
      dA = Math.max(2.5, Math.min(bufSize - 2, SAMPLE_RATE / curFreq - 0.5));
      dB = Math.max(2.5, Math.min(bufSize - 2, SAMPLE_RATE / (curFreq * 1.00095) - 0.5));
    }

    let rPosA = writePos - dA;
    if (rPosA < 0) rPosA += bufSize;
    const iA0 = rPosA | 0;
    const iA1 = iA0 + 1 >= bufSize ? 0 : iA0 + 1;
    const fracA = rPosA - iA0;
    const valA = ringA[iA0] * (1 - fracA) + ringA[iA1] * fracA;

    let rPosB = writePos - dB;
    if (rPosB < 0) rPosB += bufSize;
    const iB0 = rPosB | 0;
    const iB1 = iB0 + 1 >= bufSize ? 0 : iB0 + 1;
    const fracB = rPosB - iB0;
    const valB = ringB[iB0] * (1 - fracB) + ringB[iB1] * fracB;

    const filtA = (0.72 * valA + 0.28 * prevOutA) * 0.9942;
    const filtB = (0.70 * valB + 0.30 * prevOutB) * 0.9936;
    prevOutA = filtA;
    prevOutB = filtB;

    ringA[writePos] = filtA;
    ringB[writePos] = filtB;
    writePos = writePos + 1 >= bufSize ? 0 : writePos + 1;

    const dryString = (filtA + filtB) * 0.5;

    const res1 = dryString - c1a1 * res1Y1 - c1a2 * res1Y2;
    res1Y2 = res1Y1;
    res1Y1 = res1;

    const res2 = dryString - c2a1 * res2Y1 - c2a2 * res2Y2;
    res2Y2 = res2Y1;
    res2Y1 = res2;

    const bodyOut = dryString * 0.68 + res1 * 0.045 + res2 * 0.025;
    postLp += 0.44 * (bodyOut - postLp);

    const attackEnv = i < 72 ? i / 72 : 1;
    const releaseEnv = i > len - fadeOutSamples ? (len - i) / fadeOutSamples : 1;
    const sample = postLp * attackEnv * releaseEnv;

    outL[startSample + i] += sample * gainL;
    outR[startSample + i] += sample * gainR;
  }
}

// Expressive Arabic Oud Risha Tremolo Phrase
function addOudTremolo(
  outL: Float32Array,
  outR: Float32Array,
  freq: number,
  startSec: number,
  totalDurSec: number,
  gain: number,
  rng: () => number,
  pan = 0.08
) {
  const strokeStep = 0.084;
  const count = Math.max(2, Math.floor(totalDurSec / strokeStep));
  for (let k = 0; k < count; k++) {
    const t = startSec + k * strokeStep;
    const arc = Math.sin(((k + 0.5) / count) * Math.PI);
    const g = gain * (0.58 + 0.42 * arc) * (k % 2 === 0 ? 1.0 : 0.84);
    const noteDur = k === count - 1 ? 0.52 : strokeStep * 2.1;
    addOudNote(outL, outR, freq, t, noteDur, g, rng, pan);
  }
}

// 5. WARM QANUN ORNAMENTAL PLUCK
function addQanunFlourish(
  outL: Float32Array,
  outR: Float32Array,
  freqs: number[],
  startSec: number,
  stepSec: number,
  gain: number,
  rng: () => number
) {
  freqs.forEach((f, idx) => {
    const pan = -0.35 + (idx / Math.max(1, freqs.length - 1)) * 0.7;
    addOudNote(
      outL,
      outR,
      f,
      startSec + idx * stepSec,
      0.52,
      gain * (0.75 + 0.25 * (idx / freqs.length)),
      rng,
      pan
    );
  });
}

// 6. LUSH MIDDLE-EASTERN FIRQA STRING ENSEMBLE (WAVETABLE BOWED HARMONICS + VIBRATO + GLISSANDO)
function addFirqaStrings(
  outL: Float32Array,
  outR: Float32Array,
  freq: number,
  startSec: number,
  durSec: number,
  gain: number,
  options?: {
    attackSec?: number;
    releaseSec?: number;
    glideFromFreq?: number;
    glideSec?: number;
    vibratoDepth?: number;
    octaveLayer?: boolean;
  }
) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.min(Math.floor(durSec * SAMPLE_RATE), outL.length - startSample);
  if (len <= 0 || startSample < 0) return;

  const attackSec = options?.attackSec ?? 0.14;
  const releaseSec = options?.releaseSec ?? 0.22;
  const glideFrom = options?.glideFromFreq;
  const glideSec = options?.glideSec ?? 0.09;
  const vibDepth = options?.vibratoDepth ?? 0.0055;
  const octaveLayer = options?.octaveLayer ?? true;

  const attSamples = Math.max(1, Math.floor(attackSec * SAMPLE_RATE));
  const relSamples = Math.max(1, Math.floor(releaseSec * SAMPLE_RATE));
  const glideSamples = glideFrom ? Math.floor(glideSec * SAMPLE_RATE) : 0;
  const vibStartSample = Math.floor(0.1 * SAMPLE_RATE);
  const vibRampSamples = Math.floor(0.24 * SAMPLE_RATE);

  // Wavetable phase increments in [0..TABLE_SIZE)
  const detune0 = 1 - 0.0038;
  const detune1 = 1 - 0.0012;
  const detune2 = 1 + 0.0013;
  const detune3 = 1 + 0.0039;

  let ph0 = 0;
  let ph1 = 0.27 * TABLE_SIZE;
  let ph2 = 0.54 * TABLE_SIZE;
  let ph3 = 0.81 * TABLE_SIZE;

  let oPh0 = 0.15 * TABLE_SIZE;
  let oPh1 = 0.42 * TABLE_SIZE;
  let oPh2 = 0.69 * TABLE_SIZE;
  let oPh3 = 0.93 * TABLE_SIZE;

  let vibPh = 0;
  const vibInc = (5.35 * TABLE_SIZE) / SAMPLE_RATE;

  let lpL = 0;
  let lpR = 0;
  let chestL = 0;
  let chestR = 0;

  const scaleToTable = TABLE_SIZE / SAMPLE_RATE;

  for (let i = 0; i < len; i++) {
    let baseFreq = freq;
    if (glideFrom && i < glideSamples) {
      const u = i / glideSamples;
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * u);
      baseFreq = glideFrom + (freq - glideFrom) * ease;
    }

    vibPh += vibInc;
    const vibFade = i <= vibStartSample ? 0 : Math.min(1, (i - vibStartSample) / vibRampSamples);
    const vibSin = SIN_TABLE[(vibPh | 0) & TABLE_MASK];
    const fStep = baseFreq * (1 + vibSin * vibDepth * vibFade) * scaleToTable;

    ph0 += fStep * detune0;
    ph1 += fStep * detune1;
    ph2 += fStep * detune2;
    ph3 += fStep * detune3;

    const p0 = ph0 | 0;
    const p1 = ph1 | 0;
    const p2 = ph2 | 0;
    const p3 = ph3 | 0;

    let v0 =
      SIN_TABLE[p0 & TABLE_MASK] * 0.52 +
      SIN_TABLE[(p0 * 2) & TABLE_MASK] * 0.28 +
      SIN_TABLE[(p0 * 3) & TABLE_MASK] * 0.15 +
      SIN_TABLE[(p0 * 4) & TABLE_MASK] * 0.08 +
      SIN_TABLE[(p0 * 5) & TABLE_MASK] * 0.04;
    let v1 =
      SIN_TABLE[p1 & TABLE_MASK] * 0.52 +
      SIN_TABLE[(p1 * 2) & TABLE_MASK] * 0.28 +
      SIN_TABLE[(p1 * 3) & TABLE_MASK] * 0.15 +
      SIN_TABLE[(p1 * 4) & TABLE_MASK] * 0.08 +
      SIN_TABLE[(p1 * 5) & TABLE_MASK] * 0.04;
    let v2 =
      SIN_TABLE[p2 & TABLE_MASK] * 0.52 +
      SIN_TABLE[(p2 * 2) & TABLE_MASK] * 0.28 +
      SIN_TABLE[(p2 * 3) & TABLE_MASK] * 0.15 +
      SIN_TABLE[(p2 * 4) & TABLE_MASK] * 0.08 +
      SIN_TABLE[(p2 * 5) & TABLE_MASK] * 0.04;
    let v3 =
      SIN_TABLE[p3 & TABLE_MASK] * 0.52 +
      SIN_TABLE[(p3 * 2) & TABLE_MASK] * 0.28 +
      SIN_TABLE[(p3 * 3) & TABLE_MASK] * 0.15 +
      SIN_TABLE[(p3 * 4) & TABLE_MASK] * 0.08 +
      SIN_TABLE[(p3 * 5) & TABLE_MASK] * 0.04;

    if (octaveLayer) {
      const fOct = fStep * 2;
      oPh0 += fOct * detune0;
      oPh1 += fOct * detune1;
      oPh2 += fOct * detune2;
      oPh3 += fOct * detune3;
      const op0 = oPh0 | 0;
      const op1 = oPh1 | 0;
      const op2 = oPh2 | 0;
      const op3 = oPh3 | 0;

      v0 +=
        (SIN_TABLE[op0 & TABLE_MASK] * 0.36 +
          SIN_TABLE[(op0 * 2) & TABLE_MASK] * 0.16 +
          SIN_TABLE[(op0 * 3) & TABLE_MASK] * 0.07) *
        0.58;
      v1 +=
        (SIN_TABLE[op1 & TABLE_MASK] * 0.36 +
          SIN_TABLE[(op1 * 2) & TABLE_MASK] * 0.16 +
          SIN_TABLE[(op1 * 3) & TABLE_MASK] * 0.07) *
        0.58;
      v2 +=
        (SIN_TABLE[op2 & TABLE_MASK] * 0.36 +
          SIN_TABLE[(op2 * 2) & TABLE_MASK] * 0.16 +
          SIN_TABLE[(op2 * 3) & TABLE_MASK] * 0.07) *
        0.58;
      v3 +=
        (SIN_TABLE[op3 & TABLE_MASK] * 0.36 +
          SIN_TABLE[(op3 * 2) & TABLE_MASK] * 0.16 +
          SIN_TABLE[(op3 * 3) & TABLE_MASK] * 0.07) *
        0.58;
    }

    // Stereo panning across [-0.52, -0.18, +0.18, +0.52]
    const sumL = (v0 * 0.732 + v1 * 0.613 + v2 * 0.487 + v3 * 0.368) * 0.25;
    const sumR = (v0 * 0.368 + v1 * 0.487 + v2 * 0.613 + v3 * 0.732) * 0.25;

    lpL += 0.38 * (sumL - lpL);
    lpR += 0.38 * (sumR - lpR);
    chestL += 0.06 * (lpL - chestL);
    chestR += 0.06 * (lpR - chestR);

    const outSampleL = lpL * 0.86 + chestL * 0.22;
    const outSampleR = lpR * 0.86 + chestR * 0.22;

    const att = i < attSamples ? i / attSamples : 1;
    const rem = len - i;
    const rel = rem < relSamples ? Math.max(0, rem / relSamples) : 1;
    const bowShape = att * att * (3 - 2 * att) * rel;

    outL[startSample + i] += outSampleL * gain * bowShape;
    outR[startSample + i] += outSampleR * gain * bowShape;
  }
}

// 7. CLEAN WARM MODERN BASS
function addModernBass(
  outL: Float32Array,
  outR: Float32Array,
  freq: number,
  startSec: number,
  durSec: number,
  gain: number,
  glideFromFreq?: number
) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.min(Math.floor(durSec * SAMPLE_RATE), outL.length - startSample);
  if (len <= 0 || startSample < 0) return;

  let ph = 0;
  let lp = 0;
  const glideSamples = glideFromFreq ? Math.floor(0.065 * SAMPLE_RATE) : 0;
  const attSamples = Math.floor(0.015 * SAMPLE_RATE);
  const relSamples = Math.floor(0.06 * SAMPLE_RATE);
  const scaleToTable = TABLE_SIZE / SAMPLE_RATE;

  for (let i = 0; i < len; i++) {
    let f = freq;
    if (glideFromFreq && i < glideSamples) {
      const u = i / glideSamples;
      f = glideFromFreq + (freq - glideFromFreq) * (0.5 - 0.5 * Math.cos(Math.PI * u));
    }

    ph += f * scaleToTable;
    const p = ph | 0;
    const raw =
      SIN_TABLE[p & TABLE_MASK] * 0.82 +
      SIN_TABLE[(p * 2) & TABLE_MASK] * 0.22 +
      SIN_TABLE[(p * 3) & TABLE_MASK] * 0.05;
    lp += 0.08 * (raw - lp);

    const att = i < attSamples ? i / attSamples : 1;
    const rem = len - i;
    const rel = rem < relSamples ? Math.max(0, rem / relSamples) : 1;
    const env = att * rel * (0.72 + 0.28 * Math.exp(-i / (0.35 * SAMPLE_RATE)));

    const s = lp * gain * env;
    outL[startSample + i] += s;
    outR[startSample + i] += s;
  }
}

function encodeStereoWav(left: Float32Array, right: Float32Array, sampleRate: number): Blob {
  const len = left.length;
  const dataBytes = len * 4;
  const arrayBuffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let i = 0; i < len; i++) {
    const sL = Math.max(-1, Math.min(1, left[i]));
    const sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    offset += 2;
    view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export async function createArabicNikahTrackUrl(): Promise<string> {
  const rng = createRng(11122026);
  const loopSamples = Math.floor(LOOP_DURATION_SEC * SAMPLE_RATE);
  const tailSamples = Math.floor(TAIL_SEC * SAMPLE_RATE);
  const renderSamples = loopSamples + tailSamples;

  const dryL = new Float32Array(renderSamples);
  const dryR = new Float32Array(renderSamples);
  const verbSendL = new Float32Array(renderSamples);
  const verbSendR = new Float32Array(renderSamples);

  const doum = makeDarbukaSample('doum', rng);
  const tak = makeDarbukaSample('tak', rng);
  const ka = makeDarbukaSample('ka', rng);
  const daf = makeDafFrameDrumSample(rng);
  const riqAcc = makeRiqShimmerSample(true, rng);
  const riqSoft = makeRiqShimmerSample(false, rng);

  // Maqam Hijaz Kar / Hijaz in D
  const N = {
    D1: 36.71,
    A1: 55.0,
    Bb1: 58.27,
    C2: 65.41,
    D2: 73.42,
    Eb2: 77.78,
    G2: 98.0,
    A2: 110.0,
    Bb2: 116.54,
    C3: 130.81,
    Cs3: 138.59,
    D3: 146.83,
    Eb3: 155.56,
    Fs3: 185.0,
    G3: 196.0,
    A3: 220.0,
    Bb3: 233.08,
    C4: 261.63,
    Cs4: 277.18,
    D4: 293.66,
    Eb4: 311.13,
    Fs4: 369.99,
    G4: 392.0,
    A4: 440.0,
    Bb4: 466.16,
    Cs5: 554.37,
    D5: 587.33,
    Eb5: 622.25,
    Fs5: 739.99,
  };

  const step16 = BEAT_SEC / 4;

  type OudEvent = {
    step: number;
    freq: number;
    durSteps: number;
    gain?: number;
    slideFrom?: number;
    tremolo?: boolean;
  };

  const playOudPhrase = (baseTime: number, events: OudEvent[], gainScale = 1, pan = 0.08) => {
    for (const ev of events) {
      const t = baseTime + ev.step * step16 + (rng() - 0.5) * 0.004;
      const g = (ev.gain ?? 0.42) * gainScale;
      if (ev.tremolo) {
        addOudTremolo(verbSendL, verbSendR, ev.freq, t, ev.durSteps * step16, g, rng, pan);
      } else {
        addOudNote(
          verbSendL,
          verbSendR,
          ev.freq,
          t,
          ev.durSteps * step16,
          g,
          rng,
          pan,
          ev.slideFrom
        );
      }
    }
  };

  const introOud: OudEvent[] = [
    { step: 0.08, freq: N.D4, durSteps: 6, gain: 0.44, tremolo: true },
    { step: 6, freq: N.Fs4, durSteps: 3, gain: 0.40, slideFrom: N.Eb4 },
    { step: 10, freq: N.G4, durSteps: 3, gain: 0.42 },
    { step: 14, freq: N.A4, durSteps: 6, gain: 0.46, tremolo: true },
    { step: 22, freq: N.Bb4, durSteps: 2.5, gain: 0.40 },
    { step: 24, freq: N.A4, durSteps: 3, gain: 0.42, slideFrom: N.Bb4 },
    { step: 28, freq: N.G4, durSteps: 2.5, gain: 0.38 },
    { step: 30, freq: N.Fs4, durSteps: 3, gain: 0.40 },
    { step: 34, freq: N.Eb4, durSteps: 3, gain: 0.40, slideFrom: N.Fs4 },
    { step: 38, freq: N.D4, durSteps: 8, gain: 0.46, tremolo: true },
    { step: 48, freq: N.Cs4, durSteps: 3, gain: 0.36 },
    { step: 51, freq: N.D4, durSteps: 2.5, gain: 0.40 },
    { step: 54, freq: N.Eb4, durSteps: 3, gain: 0.40 },
    { step: 58, freq: N.Fs4, durSteps: 4, gain: 0.44, slideFrom: N.Eb4 },
  ];

  const themeOudA: OudEvent[] = [
    { step: 0, freq: N.D4, durSteps: 3.5, gain: 0.46 },
    { step: 3, freq: N.Fs4, durSteps: 3, gain: 0.44, slideFrom: N.Eb4 },
    { step: 6, freq: N.G4, durSteps: 2.5, gain: 0.44 },
    { step: 8, freq: N.A4, durSteps: 6, gain: 0.48, tremolo: true },
    { step: 14, freq: N.G4, durSteps: 2.5, gain: 0.40 },
    { step: 16, freq: N.Bb4, durSteps: 3.5, gain: 0.46, slideFrom: N.A4 },
    { step: 20, freq: N.A4, durSteps: 2.5, gain: 0.43 },
    { step: 22, freq: N.G4, durSteps: 2.5, gain: 0.42 },
    { step: 24, freq: N.Fs4, durSteps: 3, gain: 0.44 },
    { step: 27, freq: N.Eb4, durSteps: 3, gain: 0.42, slideFrom: N.Fs4 },
    { step: 30, freq: N.D4, durSteps: 4, gain: 0.45 },
    { step: 32, freq: N.A3, durSteps: 3, gain: 0.41 },
    { step: 35, freq: N.D4, durSteps: 3, gain: 0.44 },
    { step: 38, freq: N.Eb4, durSteps: 2.5, gain: 0.42 },
    { step: 40, freq: N.Fs4, durSteps: 4, gain: 0.46, slideFrom: N.Eb4 },
    { step: 44, freq: N.G4, durSteps: 3.5, gain: 0.44 },
    { step: 48, freq: N.Fs4, durSteps: 2.5, gain: 0.44 },
    { step: 50, freq: N.Eb4, durSteps: 2.5, gain: 0.42 },
    { step: 52, freq: N.D4, durSteps: 3.5, gain: 0.46 },
    { step: 56, freq: N.Cs4, durSteps: 2.5, gain: 0.39 },
    { step: 59, freq: N.D4, durSteps: 5, gain: 0.46, tremolo: true },
  ];

  const themeOudB_2Bar: OudEvent[] = [
    { step: 0, freq: N.G3, durSteps: 3, gain: 0.36 },
    { step: 3, freq: N.Bb3, durSteps: 3, gain: 0.36 },
    { step: 6, freq: N.D4, durSteps: 3, gain: 0.38 },
    { step: 10, freq: N.G4, durSteps: 4, gain: 0.40 },
    { step: 14, freq: N.Fs4, durSteps: 2.5, gain: 0.38 },
    { step: 16, freq: N.Eb4, durSteps: 3, gain: 0.38, slideFrom: N.Fs4 },
    { step: 20, freq: N.D4, durSteps: 3, gain: 0.38 },
    { step: 24, freq: N.A3, durSteps: 4, gain: 0.38, tremolo: true },
    { step: 28, freq: N.Cs4, durSteps: 2.5, gain: 0.36 },
    { step: 30, freq: N.D4, durSteps: 3, gain: 0.39 },
  ];

  playOudPhrase(0, introOud, 0.96, 0.06);
  playOudPhrase(4 * BAR_SEC, themeOudA, 1.0, 0.08);
  playOudPhrase(8 * BAR_SEC, themeOudA, 1.04, 0.05);
  playOudPhrase(12 * BAR_SEC, themeOudB_2Bar, 0.92, -0.14);
  playOudPhrase(14 * BAR_SEC, themeOudB_2Bar, 0.94, -0.14);
  playOudPhrase(16 * BAR_SEC, themeOudB_2Bar, 0.96, -0.14);
  playOudPhrase(18 * BAR_SEC, themeOudB_2Bar, 0.98, -0.14);
  playOudPhrase(20 * BAR_SEC, themeOudA, 1.06, 0.06);

  addQanunFlourish(
    verbSendL,
    verbSendR,
    [N.D4, N.Eb4, N.Fs4, N.G4, N.A4, N.Bb4, N.Cs5, N.D5],
    3 * BAR_SEC + 10 * step16,
    0.058,
    0.20,
    rng
  );
  addQanunFlourish(
    verbSendL,
    verbSendR,
    [N.D5, N.Cs5, N.Bb4, N.A4, N.G4, N.Fs4, N.Eb4, N.D4],
    11 * BAR_SEC + 10 * step16,
    0.055,
    0.22,
    rng
  );
  addQanunFlourish(
    verbSendL,
    verbSendR,
    [N.D4, N.Fs4, N.A4, N.D5, N.Eb5, N.Fs5],
    19 * BAR_SEC + 11 * step16,
    0.062,
    0.23,
    rng
  );

  // Soft atmospheric regal pedal bed throughout intro (Bars 0-3)
  addFirqaStrings(verbSendL, verbSendR, N.D3, 0, BAR_SEC * 4.1, 0.19, {
    attackSec: 0.45,
    releaseSec: 0.55,
    octaveLayer: false,
    vibratoDepth: 0.0025,
  });
  addFirqaStrings(verbSendL, verbSendR, N.A3, 0, BAR_SEC * 4.1, 0.14, {
    attackSec: 0.65,
    releaseSec: 0.55,
    octaveLayer: false,
    vibratoDepth: 0.0025,
  });

  // Bars 4-11: Warm orchestral harmony chords
  for (let b = 4; b < 12; b += 2) {
    const t = b * BAR_SEC;
    if (b % 4 === 0) {
      addFirqaStrings(verbSendL, verbSendR, N.D3, t, BAR_SEC * 2.05, 0.21, {
        attackSec: 0.24,
        releaseSec: 0.35,
        octaveLayer: true,
      });
      addFirqaStrings(verbSendL, verbSendR, N.A3, t, BAR_SEC * 2.05, 0.16, {
        attackSec: 0.28,
        releaseSec: 0.35,
        octaveLayer: false,
      });
    } else {
      addFirqaStrings(verbSendL, verbSendR, N.Eb3, t, BAR_SEC * 1.05, 0.19, {
        attackSec: 0.2,
        releaseSec: 0.25,
        octaveLayer: true,
      });
      addFirqaStrings(verbSendL, verbSendR, N.D3, t + BAR_SEC, BAR_SEC * 1.05, 0.2, {
        attackSec: 0.18,
        releaseSec: 0.28,
        glideFromFreq: N.Eb3,
        glideSec: 0.1,
        octaveLayer: true,
      });
    }
  }

  // Bars 12-19: Grand Soaring Firqa String Ensemble Melody
  const grandStringMelody: Array<[number, number, number, number?]> = [
    [0, N.G4, 6, N.Fs4],
    [6, N.A4, 4],
    [10, N.Bb4, 6, N.A4],
    [16, N.A4, 5],
    [21, N.G4, 3],
    [24, N.Fs4, 4, N.G4],
    [28, N.G4, 4],
    [32, N.A4, 8, N.G4],
    [40, N.Bb4, 4],
    [44, N.A4, 4],
    [48, N.G4, 4],
    [52, N.Fs4, 4],
    [56, N.Eb4, 4, N.Fs4],
    [60, N.D4, 6, N.Eb4],
    [64, N.D4, 4],
    [68, N.Fs4, 4, N.Eb4],
    [72, N.G4, 4],
    [76, N.A4, 6, N.G4],
    [82, N.Bb4, 6],
    [88, N.Cs5, 4, N.Bb4],
    [92, N.D5, 6, N.Cs5],
    [98, N.Bb4, 4],
    [102, N.A4, 6, N.Bb4],
    [108, N.G4, 4],
    [112, N.Fs4, 5],
    [117, N.Eb4, 4, N.Fs4],
    [121, N.D4, 7, N.Eb4],
  ];

  for (const [s, freq, dSteps, glideFrom] of grandStringMelody) {
    addFirqaStrings(verbSendL, verbSendR, freq, 12 * BAR_SEC + s * step16, dSteps * step16 + 0.08, 0.30, {
      attackSec: 0.11,
      releaseSec: 0.18,
      glideFromFreq: glideFrom,
      glideSec: 0.085,
      octaveLayer: true,
      vibratoDepth: 0.006,
    });
  }

  // Bars 20-23: Royal Finale Strings leading seamlessly into Bar 0
  addFirqaStrings(verbSendL, verbSendR, N.D4, 20 * BAR_SEC, BAR_SEC * 2.05, 0.25, {
    attackSec: 0.2,
    releaseSec: 0.3,
    octaveLayer: true,
  });
  addFirqaStrings(verbSendL, verbSendR, N.Eb4, 22 * BAR_SEC, BAR_SEC * 1.05, 0.24, {
    attackSec: 0.16,
    releaseSec: 0.25,
    octaveLayer: true,
  });
  addFirqaStrings(verbSendL, verbSendR, N.D4, 23 * BAR_SEC, BAR_SEC * 1.25, 0.25, {
    attackSec: 0.16,
    releaseSec: 0.45,
    glideFromFreq: N.Eb4,
    glideSec: 0.09,
    octaveLayer: true,
  });

  // Schedule Arabic Percussion + Modern Warm Bass Bar-by-Bar
  for (let bar = 0; bar < TOTAL_BARS; bar++) {
    const barStart = bar * BAR_SEC;
    const isIntro = bar < 4;
    const isB = bar >= 12 && bar < 20;
    const isFinale = bar >= 20;

    if (bar >= 2) {
      const bassGain = isIntro ? 0.22 : isFinale ? 0.34 : 0.31;
      let root = N.D2;
      let fifth = N.A1;
      if (isB) {
        const bMod = (bar - 12) % 4;
        if (bMod === 0) {
          root = N.G2;
          fifth = N.D2;
        } else if (bMod === 1) {
          root = N.Eb2;
          fifth = N.Bb1;
        } else if (bMod === 2) {
          root = N.A2;
          fifth = N.D2;
        } else {
          root = N.D2;
          fifth = N.A1;
        }
      } else {
        if (bar % 4 === 2) {
          root = N.Eb2;
          fifth = N.Bb1;
        } else if (bar % 4 === 3) {
          root = N.D2;
          fifth = N.A1;
        }
      }

      addModernBass(dryL, dryR, root, barStart + 0.015, step16 * 5.8, bassGain);
      addModernBass(dryL, dryR, fifth, barStart + 6 * step16 + 0.01, step16 * 3.8, bassGain * 0.9, root);
      addModernBass(dryL, dryR, root, barStart + 10 * step16, step16 * 5.6, bassGain * 0.95, fifth);
    }

    if (bar >= 1) {
      const dafSteps = isIntro ? [0, 6] : [0, 6, 10];
      const dafGain = isIntro ? 0.42 : isFinale ? 0.68 : 0.60;
      for (const s of dafSteps) {
        const idx = Math.floor((barStart + s * step16) * SAMPLE_RATE);
        const vel = dafGain * (s === 0 ? 1.0 : 0.82);
        mixMono(dryL, dryR, daf, idx, vel, vel);
        mixMono(verbSendL, verbSendR, daf, idx, vel * 0.16, vel * 0.16);
      }
    }

    const darbLevel = isIntro ? (bar < 2 ? 0.42 : 0.62) : isFinale ? 0.92 : 0.84;
    const pattern: Array<[number, Float32Array, number, number]> = [
      [0, doum, 1.0, 0.96],
      [3, tak, 0.82, 1.04],
      [6, doum, 0.92, 0.90],
      [8, tak, 0.80, 1.02],
      [11, ka, 1.02, 0.78],
      [12, tak, 0.84, 1.02],
      [14, ka, 0.98, 0.82],
    ];

    if (bar % 4 === 3 && bar >= 3) {
      pattern.push([15, tak, 0.92, 0.95]);
    }
    if (bar === 11 || bar === 19 || bar === 23) {
      pattern.push([13, ka, 0.88, 0.9]);
    }

    for (const [step, smp, panL, panR] of pattern) {
      if (bar === 0 && step > 8) continue;
      // Leave clean 8ms zero-crossing cushion on bar 0 beat 0 so loop boundary never clicks
      const jitter = bar === 0 && step === 0 ? Math.floor(0.008 * SAMPLE_RATE) : Math.floor((rng() - 0.5) * 0.0025 * SAMPLE_RATE);
      const idx = Math.max(0, Math.floor((barStart + step * step16) * SAMPLE_RATE) + jitter);
      const vel = darbLevel * (0.94 + rng() * 0.12);
      mixMono(dryL, dryR, smp, idx, vel * panL * 0.76, vel * panR * 0.76);
      mixMono(verbSendL, verbSendR, smp, idx, vel * panL * 0.18, vel * panR * 0.18);
    }

    if (bar >= 4) {
      const riqGain = isB || isFinale ? 0.78 : 0.64;
      for (let s = 0; s < 16; s += 2) {
        const isAcc = s === 4 || s === 12;
        const smp = isAcc ? riqAcc : riqSoft;
        const idx = Math.floor((barStart + s * step16) * SAMPLE_RATE);
        mixMono(dryL, dryR, smp, idx, riqGain * 0.7, riqGain * 1.0);
        mixMono(verbSendL, verbSendR, smp, idx, riqGain * 0.25, riqGain * 0.35);
      }
    }
  }

  // 4-Channel Hadamard FDN Concert Hall Reverb (delay lengths scaled cleanly for 32 kHz)
  const dA = 953;  // ~29.8 ms
  const dB = 1277; // ~39.9 ms
  const dC = 1657; // ~51.8 ms
  const dD = 2111; // ~66.0 ms
  const bufA = new Float32Array(dA);
  const bufB = new Float32Array(dB);
  const bufC = new Float32Array(dC);
  const bufD = new Float32Array(dD);
  let pA = 0;
  let pB = 0;
  let pC = 0;
  let pD = 0;
  let dampA = 0;
  let dampB = 0;
  let dampC = 0;
  let dampD = 0;

  const wetL = new Float32Array(renderSamples);
  const wetR = new Float32Array(renderSamples);
  const fb = 0.76;
  const dampAlpha = 0.42;

  for (let i = 0; i < renderSamples; i++) {
    const inL = verbSendL[i];
    const inR = verbSendR[i];

    const yA = bufA[pA];
    const yB = bufB[pB];
    const yC = bufC[pC];
    const yD = bufD[pD];

    const hA = 0.5 * (yA + yB + yC + yD);
    const hB = 0.5 * (yA - yB + yC - yD);
    const hC = 0.5 * (yA + yB - yC - yD);
    const hD = 0.5 * (yA - yB - yC + yD);

    dampA += dampAlpha * (hA - dampA);
    dampB += dampAlpha * (hB - dampB);
    dampC += dampAlpha * (hC - dampC);
    dampD += dampAlpha * (hD - dampD);

    bufA[pA] = inL + dampA * fb;
    bufB[pB] = inR + dampB * fb;
    bufC[pC] = inL * 0.7 + inR * 0.3 + dampC * fb;
    bufD[pD] = inR * 0.7 + inL * 0.3 + dampD * fb;

    pA = pA + 1 >= dA ? 0 : pA + 1;
    pB = pB + 1 >= dB ? 0 : pB + 1;
    pC = pC + 1 >= dC ? 0 : pC + 1;
    pD = pD + 1 >= dD ? 0 : pD + 1;

    wetL[i] = (yA + yC) * 0.34;
    wetR[i] = (yB + yD) * 0.34;
  }

  // Circularly wrap tailSamples back onto 0..tailSamples with zero seam discontinuity
  const loopL = new Float32Array(loopSamples);
  const loopR = new Float32Array(loopSamples);

  for (let i = 0; i < loopSamples; i++) {
    loopL[i] = dryL[i] + verbSendL[i] * 0.78 + wetL[i] * 0.56;
    loopR[i] = dryR[i] + verbSendR[i] * 0.78 + wetR[i] * 0.56;
  }

  for (let i = 0; i < tailSamples; i++) {
    const srcIdx = loopSamples + i;
    const taper = 0.5 * (1 + Math.cos((Math.PI * i) / tailSamples));
    loopL[i] += (dryL[srcIdx] + verbSendL[srcIdx] * 0.78 + wetL[srcIdx] * 0.56) * taper;
    loopR[i] += (dryR[srcIdx] + verbSendR[srcIdx] * 0.78 + wetR[srcIdx] * 0.56) * taper;
  }

  // DC-block + Studio Soft Limiter + Normalize to -1.5 dBFS
  const outL = new Float32Array(loopSamples);
  const outR = new Float32Array(loopSamples);
  let dcInL = 0;
  let dcOutL = 0;
  let dcInR = 0;
  let dcOutR = 0;
  const dcR = 0.996;
  let maxAbs = 0;

  for (let i = 0; i < loopSamples; i++) {
    const xL = loopL[i];
    const xR = loopR[i];
    dcOutL = xL - dcInL + dcR * dcOutL;
    dcInL = xL;
    dcOutR = xR - dcInR + dcR * dcOutR;
    dcInR = xR;

    const limL = Math.tanh(dcOutL * 0.92);
    const limR = Math.tanh(dcOutR * 0.92);
    outL[i] = limL;
    outR[i] = limR;
    const a = Math.max(Math.abs(limL), Math.abs(limR));
    if (a > maxAbs) maxAbs = a;
  }

  if (maxAbs > 0.001) {
    const scale = 0.84 / maxAbs;
    for (let i = 0; i < loopSamples; i++) {
      outL[i] *= scale;
      outR[i] *= scale;
    }
  }

  // Equalize exact seam endpoint (4ms circular cross-blend between sample N-1 and sample 0)
  // AFTER DC-block & limiting so sample[loopSamples - 1] === sample[0] with zero pop/click
  const seamWin = Math.floor(0.004 * SAMPLE_RATE); // 128 samples (~4ms)
  const midL = 0.5 * (outL[0] + outL[loopSamples - 1]);
  const midR = 0.5 * (outR[0] + outR[loopSamples - 1]);
  for (let k = 0; k < seamWin; k++) {
    const w = k / seamWin;
    outL[k] = midL * (1 - w) + outL[k] * w;
    outR[k] = midR * (1 - w) + outR[k] * w;
    outL[loopSamples - 1 - k] = midL * (1 - w) + outL[loopSamples - 1 - k] * w;
    outR[loopSamples - 1 - k] = midR * (1 - w) + outR[loopSamples - 1 - k] * w;
  }

  const wavBlob = encodeStereoWav(outL, outR, SAMPLE_RATE);
  return URL.createObjectURL(wavBlob);
}
