// Pure Float32Array Stereo DSP Synthesizer — 24-Bar (~58.8s) Modern Arabic Hip-Hop Instrumental
// Renders in ~50ms with zero OfflineAudioContext bottlenecks, zero chimes/bells, and full punch:
// - 98 BPM Hip-Hop 808 Kick + Gliding Sub-Bass
// - Punchy Snare + Multi-Tap Stereo Clap + Trap Hi-Hat Rolls
// - Authentic Arabic Darbuka (Doum, Tak, Ka) Maqsoum Groove
// - Karplus-Strong Physical-Modeled Arabic Oud in Maqam Hijaz (D - Eb - F# - G - A - Bb - C# - D)
// - Cinematic Detuned Brass/String Swells + Warm Studio Limiter

const SAMPLE_RATE = 24000;
const BPM = 98;
const BEAT_SEC = 60 / BPM;
const BAR_SEC = BEAT_SEC * 4;
const TOTAL_BARS = 24;
const DURATION_SEC = BAR_SEC * TOTAL_BARS; // ~58.7755s exact loop

function mixMonoIntoStereo(
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

function make808KickSample(subFreq = 46.25, durSec = 0.45): Float32Array {
  const len = Math.floor(SAMPLE_RATE * durSec);
  const buf = new Float32Array(len);
  let phase = 0;
  let clickPhase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const freq = subFreq + 125 * Math.exp(-t / 0.028);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const body = Math.sin(phase) * Math.exp(-t / 0.21);

    // Tight beater click
    clickPhase += (2 * Math.PI * (75 + 220 * Math.exp(-t / 0.008))) / SAMPLE_RATE;
    const click = Math.sin(clickPhase) * Math.exp(-t / 0.012) * 0.42;

    const env = Math.min(1, t / 0.003);
    buf[i] = Math.tanh((body * 1.45 + click) * 1.35) * env * 0.9;
  }
  return buf;
}

function makeSnareClapSample(): { L: Float32Array; R: Float32Array } {
  const len = Math.floor(SAMPLE_RATE * 0.24);
  const L = new Float32Array(len);
  const R = new Float32Array(len);
  let phase = 0;
  let lpL = 0;
  let lpR = 0;
  let hpPrevL = 0;
  let hpPrevR = 0;
  let hpOutL = 0;
  let hpOutR = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const bodyFreq = 128 + 95 * Math.exp(-t / 0.022);
    phase += (2 * Math.PI * bodyFreq) / SAMPLE_RATE;
    const body = Math.sin(phase) * Math.exp(-t / 0.055) * 0.52;

    // Multi-tap stereo clap bursts at 0ms, 11ms, 22ms
    const burstEnv =
      (t < 0.014 ? Math.exp(-t / 0.006) * 0.55 : 0) +
      (t >= 0.011 && t < 0.026 ? Math.exp(-(t - 0.011) / 0.006) * 0.6 : 0) +
      (t >= 0.022 ? Math.exp(-(t - 0.022) / 0.068) * 0.95 : 0);

    const nL = Math.random() * 2 - 1;
    const nR = Math.random() * 2 - 1;

    // Band-limit noise (roughly 750Hz - 4200Hz)
    lpL += 0.48 * (nL - lpL);
    lpR += 0.48 * (nR - lpR);
    hpOutL = 0.82 * (hpOutL + lpL - hpPrevL);
    hpOutR = 0.82 * (hpOutR + lpR - hpPrevR);
    hpPrevL = lpL;
    hpPrevR = lpR;

    const snapL = hpOutL * burstEnv * 0.72;
    const snapR = hpOutR * burstEnv * 0.72;
    L[i] = Math.tanh((body + snapL) * 1.25) * 0.78;
    R[i] = Math.tanh((body + snapR) * 1.25) * 0.78;
  }
  return { L, R };
}

function makeHiHatSample(open: boolean): Float32Array {
  const dur = open ? 0.22 : 0.05;
  const len = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(len);
  let prev = 0;
  let prev2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const noise = Math.random() * 2 - 1;
    // Crisp high-pass metallic sheen
    const hp1 = noise - 0.88 * prev;
    prev = noise;
    const hp2 = hp1 - 0.82 * prev2;
    prev2 = hp1;

    const env = Math.exp(-t / (open ? 0.075 : 0.015)) * Math.min(1, t / 0.002);
    buf[i] = hp2 * env * (open ? 0.22 : 0.19);
  }
  return buf;
}

function makeDarbukaSample(kind: 'doum' | 'tak' | 'ka'): Float32Array {
  const dur = kind === 'doum' ? 0.22 : 0.085;
  const len = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(len);
  let phase = 0;
  let lp = 0;
  let prev = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    if (kind === 'doum') {
      const freq = 76 + 105 * Math.exp(-t / 0.018);
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const env = Math.exp(-t / 0.078) * Math.min(1, t / 0.003);
      buf[i] = Math.tanh(Math.sin(phase) * 1.4) * env * 0.52;
    } else {
      const f = kind === 'tak' ? 310 + 260 * Math.exp(-t / 0.012) : 275 + 210 * Math.exp(-t / 0.01);
      phase += (2 * Math.PI * f) / SAMPLE_RATE;
      const skin = Math.sin(phase) * Math.exp(-t / 0.022);
      const n = Math.random() * 2 - 1;
      lp += 0.42 * (n - lp);
      const slap = (lp - 0.72 * prev) * Math.exp(-t / 0.018);
      prev = lp;
      const amp = kind === 'tak' ? 0.44 : 0.3;
      buf[i] = Math.tanh((skin * 0.75 + slap * 0.9) * 1.3) * amp;
    }
  }
  return buf;
}

function addOudPluck(
  outL: Float32Array,
  outR: Float32Array,
  freq: number,
  startSec: number,
  durSec: number,
  gain: number,
  slideFromFreq?: number
) {
  // Karplus-Strong woody Arabic Oud waveguide with warm body filter
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.min(Math.floor(durSec * SAMPLE_RATE), outL.length - startSample);
  if (len <= 0 || startSample < 0) return;

  const baseDelay = Math.max(4, Math.round(SAMPLE_RATE / freq));
  const ring = new Float32Array(baseDelay + 64);

  // Warm filtered pluck excitation (no harsh high metallic ping)
  let excitLp = 0;
  for (let i = 0; i < ring.length; i++) {
    const n = Math.random() * 2 - 1;
    excitLp += 0.36 * (n - excitLp);
    ring[i] = excitLp;
  }

  let readPos = 0;
  let lastSample = 0;
  let bodyLp = 0;
  const slideSamples = slideFromFreq ? Math.floor(0.065 * SAMPLE_RATE) : 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const curFreq =
      slideFromFreq && i < slideSamples
        ? slideFromFreq + (freq - slideFromFreq) * (i / slideSamples)
        : freq;
    const delayLen = Math.max(4, Math.min(ring.length - 1, Math.round(SAMPLE_RATE / curFreq)));

    const idx = readPos % delayLen;
    const nextIdx = (readPos + 1) % delayLen;
    const avg = 0.5 * (ring[idx] + ring[nextIdx]);
    // Damping factor shapes warm wooden oud decay
    const decayed = (0.992 * avg + 0.008 * lastSample) * 0.993;
    lastSample = decayed;
    ring[idx] = decayed;
    readPos++;

    bodyLp += 0.42 * (decayed - bodyLp);
    const fadeOut = i > len - 240 ? (len - i) / 240 : 1;
    const sample = bodyLp * gain * fadeOut;

    outL[startSample + i] += sample * 0.92;
    outR[startSample + i] += sample * 0.78;
  }
}

function addSubBassGlide(
  outL: Float32Array,
  outR: Float32Array,
  freq: number,
  startSec: number,
  durSec: number,
  gain: number,
  glideFrom?: number
) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.min(Math.floor(durSec * SAMPLE_RATE), outL.length - startSample);
  if (len <= 0 || startSample < 0) return;

  let phase = 0;
  const glideLen = glideFrom ? Math.floor(0.08 * SAMPLE_RATE) : 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const f =
      glideFrom && i < glideLen ? glideFrom + (freq - glideFrom) * (i / glideLen) : freq;
    phase += (2 * Math.PI * f) / SAMPLE_RATE;

    // Warm saturated sub + 2nd harmonic so bass cuts through phone speakers too
    const raw = Math.sin(phase) * 0.82 + Math.sin(phase * 2) * 0.26;
    const env = Math.min(1, t / 0.012) * Math.min(1, (durSec - t) / 0.04);
    const s = Math.tanh(raw * 1.4) * gain * Math.max(0, env);
    outL[startSample + i] += s;
    outR[startSample + i] += s;
  }
}

function addCinematicStrings(
  outL: Float32Array,
  outR: Float32Array,
  freqs: number[],
  startSec: number,
  durSec: number,
  gain: number,
  attackSec = 0.06
) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.min(Math.floor(durSec * SAMPLE_RATE), outL.length - startSample);
  if (len <= 0 || startSample < 0) return;

  const phases = freqs.map(() => [0, 0.2, 0.45]);
  let lpL = 0;
  let lpR = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let sumL = 0;
    let sumR = 0;

    for (let fIdx = 0; fIdx < freqs.length; fIdx++) {
      const f = freqs[fIdx];
      const p = phases[fIdx];
      p[0] = (p[0] + (f * 0.996) / SAMPLE_RATE) % 1;
      p[1] = (p[1] + f / SAMPLE_RATE) % 1;
      p[2] = (p[2] + (f * 1.004) / SAMPLE_RATE) % 1;

      const saw = (p[0] * 2 - 1 + (p[1] * 2 - 1) + (p[2] * 2 - 1)) * 0.33;
      if (fIdx % 2 === 0) {
        sumL += saw * 0.85;
        sumR += saw * 0.55;
      } else {
        sumL += saw * 0.55;
        sumR += saw * 0.85;
      }
    }

    const norm = 1 / Math.max(1, freqs.length);
    lpL += 0.26 * (sumL * norm - lpL);
    lpR += 0.26 * (sumR * norm - lpR);

    const env = Math.min(1, t / attackSec) * Math.min(1, (durSec - t) / 0.12);
    outL[startSample + i] += lpL * gain * Math.max(0, env);
    outR[startSample + i] += lpR * gain * Math.max(0, env);
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
  const totalSamples = Math.floor(SAMPLE_RATE * DURATION_SEC);
  const dryL = new Float32Array(totalSamples);
  const dryR = new Float32Array(totalSamples);
  const verbSendL = new Float32Array(totalSamples);
  const verbSendR = new Float32Array(totalSamples);

  // Pre-synthesize one-shot drum samples once (instant mixing!)
  const kickD = make808KickSample(46.25, 0.45);
  const kickEb = make808KickSample(49.0, 0.45);
  const kickA = make808KickSample(55.0, 0.42);
  const snareClap = makeSnareClapSample();
  const closedHat = makeHiHatSample(false);
  const openHat = makeHiHatSample(true);
  const darbukaDoum = makeDarbukaSample('doum');
  const darbukaTak = makeDarbukaSample('tak');
  const darbukaKa = makeDarbukaSample('ka');

  // Maqam Hijaz in D (D - Eb - F# - G - A - Bb - C# - D)
  const N = {
    D1: 36.71,
    Eb1: 38.89,
    A1: 55.0,
    D2: 73.42,
    Eb2: 77.78,
    A2: 110.0,
    Bb2: 116.54,
    D3: 146.83,
    Eb3: 155.56,
    Fs3: 185.0,
    G3: 196.0,
    A3: 220.0,
    Bb3: 233.08,
    Cs4: 277.18,
    D4: 293.66,
    Eb4: 311.13,
    Fs4: 369.99,
    G4: 392.0,
    A4: 440.0,
    Bb4: 466.16,
  };

  const step16 = BEAT_SEC / 4;

  // Confident, catchy 2-bar Arabic Hip-Hop Oud hook
  const oudHookA: Array<[number, number, number, number?]> = [
    [0, N.D3, 3.2],
    [3, N.Fs3, 2.2, N.Eb3],
    [6, N.G3, 2.2],
    [8, N.A3, 3.2, N.G3],
    [11, N.Bb3, 2.2],
    [13, N.A3, 2.2],
    [16, N.G3, 3.2],
    [19, N.Fs3, 2.2],
    [22, N.Eb3, 2.2],
    [24, N.D3, 3.4, N.Eb3],
    [28, N.A2, 2.2],
    [30, N.Cs4, 2.2],
  ];

  // Higher-octave call-and-response hook for Drop B peak
  const oudHookB: Array<[number, number, number, number?]> = [
    [0, N.D4, 3.2],
    [3, N.Fs4, 2.2, N.Eb4],
    [6, N.G4, 2.2],
    [8, N.A4, 3.2, N.G4],
    [11, N.Bb4, 2.2],
    [13, N.A4, 2.2],
    [16, N.G4, 2.2],
    [18, N.Fs4, 2.2],
    [20, N.Eb4, 2.2],
    [22, N.D4, 2.2],
    [24, N.Fs4, 2.2],
    [26, N.Eb4, 2.2],
    [28, N.D4, 3.2],
  ];

  const bridgeOud: Array<[number, number, number, number?]> = [
    [0, N.Bb3, 4.2],
    [4, N.A3, 4.2, N.Bb3],
    [8, N.G3, 4.2],
    [12, N.Fs3, 4.2],
    [16, N.Eb3, 4.2],
    [20, N.Fs3, 4.2],
    [24, N.G3, 3.2],
    [27, N.A3, 2.2],
    [29, N.Cs4, 3.2],
  ];

  for (let bar = 0; bar < TOTAL_BARS; bar++) {
    const barStart = bar * BAR_SEC;
    const isIntro = bar < 2;
    const isDropA = bar >= 2 && bar < 10;
    const isBridge = bar >= 10 && bar < 14;
    const isDropB = bar >= 14 && bar < 22;
    const isOutro = bar >= 22;

    // 1. 808 KICK & GLIDING SUB-BASS
    if (isDropA || isDropB || (isBridge && bar % 2 === 0)) {
      const kickSteps = isBridge ? [0, 10] : [0, 6, 10, 14];
      const kickSample = bar % 4 === 2 ? kickEb : bar % 4 === 3 ? kickA : kickD;
      kickSteps.forEach((s) => {
        const idx = Math.floor((barStart + s * step16) * SAMPLE_RATE);
        mixMonoIntoStereo(dryL, dryR, kickSample, idx, 0.72, 0.72);
      });

      if (!isBridge) {
        const root = bar % 4 === 2 ? N.Eb2 : bar % 4 === 3 ? N.A1 * 2 : N.D2;
        const alt = bar % 4 === 2 ? N.D2 : N.Eb2;
        addSubBassGlide(dryL, dryR, root, barStart, step16 * 5.2, 0.34);
        addSubBassGlide(dryL, dryR, alt, barStart + 10 * step16, step16 * 4.8, 0.32, root);
      }
    } else if (isOutro && bar === 22) {
      mixMonoIntoStereo(dryL, dryR, kickD, Math.floor(barStart * SAMPLE_RATE), 0.65, 0.65);
      mixMonoIntoStereo(dryL, dryR, kickD, Math.floor((barStart + 6 * step16) * SAMPLE_RATE), 0.58, 0.58);
    }

    // 2. HIP-HOP SNARE + CLAP
    if (!isIntro || bar === 1) {
      const clapSteps = isIntro ? [12] : [4, 12];
      clapSteps.forEach((s) => {
        const idx = Math.floor((barStart + s * step16) * SAMPLE_RATE);
        const g = isBridge ? 0.55 : 0.72;
        mixMonoIntoStereo(dryL, dryR, snareClap.L, idx, g, 0);
        mixMonoIntoStereo(dryL, dryR, snareClap.R, idx, 0, g);
        mixMonoIntoStereo(verbSendL, verbSendR, snareClap.L, idx, 0.35, 0);
        mixMonoIntoStereo(verbSendL, verbSendR, snareClap.R, idx, 0, 0.35);
      });

      if (bar === 1 || bar === 9 || bar === 13 || bar === 23) {
        [13, 14, 15].forEach((s, k) => {
          const idx = Math.floor((barStart + s * step16) * SAMPLE_RATE);
          const g = 0.32 + k * 0.12;
          mixMonoIntoStereo(dryL, dryR, snareClap.L, idx, g, 0);
          mixMonoIntoStereo(dryL, dryR, snareClap.R, idx, 0, g);
        });
      }
    }

    // 3. TRAP HI-HATS & ENERGETIC ROLLS
    if (isDropA || isDropB || (isIntro && bar === 1) || (isOutro && bar === 22)) {
      for (let s = 0; s < 16; s += 2) {
        const idx = Math.floor((barStart + s * step16) * SAMPLE_RATE);
        const isOpen = s === 14 && bar % 2 === 1;
        const hat = isOpen ? openHat : closedHat;
        const g = s % 4 === 0 ? 0.75 : 0.52;
        mixMonoIntoStereo(dryL, dryR, hat, idx, g * 0.85, g * 1.1);
      }
      if (isDropB || bar % 2 === 1) {
        const rollBase = barStart + 10 * step16;
        for (let r = 0; r < 4; r++) {
          const idx = Math.floor((rollBase + r * (step16 / 2)) * SAMPLE_RATE);
          mixMonoIntoStereo(dryL, dryR, closedHat, idx, 0.48 + r * 0.08, 0.6 + r * 0.08);
        }
      }
    }

    // 4. ARABIC DARBUKA (MAQSOUM / SAAIDI FUSION)
    const dGain = isIntro ? 0.55 : isBridge ? 0.5 : 0.7;
    const darbukaHits: Array<[number, Float32Array, number, number]> = [
      [0, darbukaDoum, dGain, dGain * 0.9],
      [3, darbukaTak, dGain * 0.75, dGain * 1.05],
      [6, darbukaDoum, dGain * 0.9, dGain * 0.8],
      [8, darbukaTak, dGain * 0.75, dGain * 1.05],
      [11, darbukaKa, dGain * 0.95, dGain * 0.7],
      [12, darbukaTak, dGain * 0.75, dGain * 1.05],
      [14, darbukaKa, dGain * 0.95, dGain * 0.7],
    ];
    darbukaHits.forEach(([s, smp, gL, gR]) => {
      const idx = Math.floor((barStart + s * step16) * SAMPLE_RATE);
      mixMonoIntoStereo(dryL, dryR, smp, idx, gL, gR);
      mixMonoIntoStereo(verbSendL, verbSendR, smp, idx, gL * 0.25, gR * 0.25);
    });

    // 5. ARABIC OUD HIJAZ HOOK
    if (bar % 2 === 0) {
      const hook = isBridge ? bridgeOud : isDropB ? oudHookB : oudHookA;
      hook.forEach(([s, freq, durSteps, slide]) => {
        const t = barStart + s * step16;
        addOudPluck(verbSendL, verbSendR, freq, t, durSteps * step16, isIntro ? 0.42 : 0.56, slide);
      });
    }

    // 6. CINEMATIC LUXURY STRINGS STABS & HARMONY
    if (bar === 0) {
      addCinematicStrings(verbSendL, verbSendR, [N.D3, N.A3, N.D4, N.Fs4], barStart, BAR_SEC * 2, 0.28, 0.28);
    } else if (isDropA || isDropB) {
      if (bar % 4 === 2) {
        addCinematicStrings(verbSendL, verbSendR, [N.D3, N.A3, N.Fs4], barStart, step16 * 6.5, 0.34, 0.03);
      } else if (bar % 4 === 0) {
        addCinematicStrings(verbSendL, verbSendR, [N.Eb3, N.Bb3, N.G4], barStart, step16 * 6.5, 0.32, 0.03);
      }
      if (isDropB && bar % 2 === 0) {
        addCinematicStrings(verbSendL, verbSendR, [N.D4, N.Fs4, N.A4], barStart + 8 * step16, step16 * 4.5, 0.26, 0.035);
      }
    } else if (isBridge && bar % 2 === 0) {
      const chord = bar === 10 ? [N.Bb2, N.D3, N.G3, N.Bb3] : [N.Eb3, N.G3, N.Bb3, N.D4];
      addCinematicStrings(verbSendL, verbSendR, chord, barStart, BAR_SEC * 1.88, 0.32, 0.14);
    }
  }

  // Tight stereo studio ambience (dual cross-feedback comb echoes) + warm mastering limiter
  const outL = new Float32Array(totalSamples);
  const outR = new Float32Array(totalSamples);
  const d1 = Math.floor(0.037 * SAMPLE_RATE);
  const d2 = Math.floor(0.061 * SAMPLE_RATE);
  const d3 = Math.floor(0.113 * SAMPLE_RATE);
  const fadeSamples = Math.floor(0.18 * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const wetL =
      (i >= d1 ? verbSendR[i - d1] * 0.28 : 0) +
      (i >= d2 ? verbSendL[i - d2] * 0.19 : 0) +
      (i >= d3 ? verbSendR[i - d3] * 0.12 : 0);
    const wetR =
      (i >= d1 ? verbSendL[i - d1] * 0.28 : 0) +
      (i >= d2 ? verbSendR[i - d2] * 0.19 : 0) +
      (i >= d3 ? verbSendL[i - d3] * 0.12 : 0);

    let env = 1;
    if (i < 600) env = i / 600;
    else if (i > totalSamples - fadeSamples) env = (totalSamples - i) / fadeSamples;

    const mixL = (dryL[i] + verbSendL[i] * 0.85 + wetL * 0.6) * 0.82 * env;
    const mixR = (dryR[i] + verbSendR[i] * 0.85 + wetR * 0.6) * 0.82 * env;

    // Warm analog soft-clip mastering limiter
    outL[i] = Math.tanh(mixL * 1.15);
    outR[i] = Math.tanh(mixR * 1.15);
  }

  const wavBlob = encodeStereoWav(outL, outR, SAMPLE_RATE);
  return URL.createObjectURL(wavBlob);
}
