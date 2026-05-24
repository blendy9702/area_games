import type { Grade } from "./types";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let rouletteIntervalId: ReturnType<typeof setInterval> | null = null;
let rouletteTimeouts: ReturnType<typeof setTimeout>[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.175;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function getMasterGain(): GainNode {
  getAudioContext();
  return masterGain!;
}

export function resumeAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

interface ToneOptions {
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  release?: number;
  detune?: number;
}

function playTone(
  ctx: AudioContext,
  startTime: number,
  frequency: number,
  duration: number,
  options: ToneOptions = {}
) {
  const {
    type = "square",
    volume = 0.2,
    attack = 0.008,
    release = 0.04,
    detune = 0,
  } = options;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  osc.detune.setValueAtTime(detune, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.setValueAtTime(volume, startTime + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(getMasterGain());

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playNoiseBurst(
  ctx: AudioContext,
  startTime: number,
  duration: number,
  volume = 0.08
) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = 800;

  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterGain());

  source.start(startTime);
  source.stop(startTime + duration + 0.02);
}

const GRADE_SOUND: Record<Grade, (ctx: AudioContext, t: number) => void> = {
  common: (ctx, t) => {
    playTone(ctx, t, 196, 0.18, { type: "square", volume: 0.12 });
    playTone(ctx, t + 0.06, 165, 0.22, { type: "triangle", volume: 0.08 });
  },

  rare: (ctx, t) => {
    playTone(ctx, t, 523, 0.12, { type: "triangle", volume: 0.16 });
    playTone(ctx, t + 0.1, 659, 0.14, { type: "triangle", volume: 0.18 });
    playTone(ctx, t + 0.22, 784, 0.2, { type: "square", volume: 0.14 });
  },

  epic: (ctx, t) => {
    const notes = [523, 659, 784, 988];
    notes.forEach((freq, i) => {
      playTone(ctx, t + i * 0.09, freq, 0.16, {
        type: "square",
        volume: 0.14 + i * 0.02,
      });
    });
    playTone(ctx, t + 0.38, 1047, 0.35, {
      type: "sawtooth",
      volume: 0.1,
      attack: 0.02,
      release: 0.12,
    });
  },

  legendary: (ctx, t) => {
    playTone(ctx, t, 196, 0.5, { type: "triangle", volume: 0.14, release: 0.15 });
    const fanfare = [392, 494, 587, 784, 988];
    fanfare.forEach((freq, i) => {
      playTone(ctx, t + 0.05 + i * 0.1, freq, 0.22, {
        type: "square",
        volume: 0.16 + i * 0.015,
      });
    });
    playTone(ctx, t + 0.55, 1175, 0.45, {
      type: "square",
      volume: 0.12,
      attack: 0.015,
      release: 0.18,
    });
  },

  mythic: (ctx, t) => {
    playTone(ctx, t, 98, 0.7, { type: "sawtooth", volume: 0.1, release: 0.2 });
    const rainbow = [523, 622, 740, 880, 1047, 1245, 1480];
    rainbow.forEach((freq, i) => {
      playTone(ctx, t + 0.08 + i * 0.07, freq, 0.14, {
        type: i % 2 === 0 ? "square" : "sawtooth",
        volume: 0.15,
        detune: i * 8,
      });
    });
    playTone(ctx, t + 0.58, 1568, 0.5, {
      type: "square",
      volume: 0.14,
      attack: 0.01,
      release: 0.2,
    });
    playTone(ctx, t + 0.62, 2093, 0.4, {
      type: "triangle",
      volume: 0.1,
      release: 0.15,
    });
  },

  secret: (ctx, t) => {
    playNoiseBurst(ctx, t, 0.08, 0.12);
    playTone(ctx, t + 0.04, 73, 0.35, { type: "sawtooth", volume: 0.1 });
    const glitch = [880, 220, 660, 110, 990, 165];
    glitch.forEach((freq, i) => {
      playTone(ctx, t + 0.1 + i * 0.07, freq, 0.08, {
        type: "square",
        volume: 0.14,
        attack: 0.002,
        release: 0.02,
      });
    });
    playNoiseBurst(ctx, t + 0.45, 0.12, 0.1);
    playTone(ctx, t + 0.48, 55, 0.4, { type: "square", volume: 0.08, release: 0.2 });
    playTone(ctx, t + 0.52, 830, 0.06, { type: "square", volume: 0.16, attack: 0.001 });
    playTone(ctx, t + 0.58, 124, 0.06, { type: "square", volume: 0.14, attack: 0.001 });
  },
};

export function playGradeRevealSound(grade: Grade): void {
  try {
    resumeAudioContext();
    const ctx = getAudioContext();
    GRADE_SOUND[grade](ctx, ctx.currentTime);
  } catch {
    // 오디오 미지원 환경에서는 무시
  }
}

function playCardFlipSound(intensity = 1) {
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const duration = 0.032 + Math.random() * 0.012;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const envelope = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.Q.value = 1.8 + Math.random() * 1.2;
  filter.frequency.setValueAtTime(3200 + Math.random() * 800, t);
  filter.frequency.exponentialRampToValueAtTime(350 + Math.random() * 150, t + duration);

  gain.gain.setValueAtTime(0.14 * intensity, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterGain());

  source.start(t);
  source.stop(t + duration + 0.01);

  playTone(ctx, t + duration * 0.55, 95 + Math.random() * 45, 0.018, {
    type: "triangle",
    volume: 0.045 * intensity,
    attack: 0.001,
    release: 0.01,
  });
}

function playCardStopSound() {
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  playTone(ctx, t, 72, 0.07, {
    type: "triangle",
    volume: 0.07,
    attack: 0.002,
    release: 0.04,
  });
  playTone(ctx, t + 0.015, 130, 0.05, {
    type: "square",
    volume: 0.05,
    attack: 0.001,
    release: 0.025,
  });

  const duration = 0.05;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = 600;

  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterGain());

  source.start(t);
  source.stop(t + duration + 0.01);
}

export function stopRouletteSound(): void {
  if (rouletteIntervalId) {
    clearInterval(rouletteIntervalId);
    rouletteIntervalId = null;
  }
  rouletteTimeouts.forEach(clearTimeout);
  rouletteTimeouts = [];
}

export function startFastRouletteSound(): void {
  try {
    stopRouletteSound();
    resumeAudioContext();
    playCardFlipSound(0.95);
    rouletteIntervalId = setInterval(() => playCardFlipSound(0.8), 72);
  } catch {
    // 오디오 미지원 환경에서는 무시
  }
}

export function startDeceleratingRouletteSound(durationMs = 4800): void {
  try {
    stopRouletteSound();
    resumeAudioContext();

    const flipCount = 48;
    let elapsed = 0;

    for (let i = 0; i < flipCount; i++) {
      const progress = i / (flipCount - 1);
      const gap = 24 + Math.pow(progress, 2.3) * (durationMs / flipCount) * 2.4;
      const intensity = 1 - progress * 0.3;

      const id = setTimeout(() => playCardFlipSound(intensity), elapsed);
      rouletteTimeouts.push(id);
      elapsed += gap;
    }

    const stopId = setTimeout(() => playCardStopSound(), durationMs - 50);
    rouletteTimeouts.push(stopId);
  } catch {
    // 오디오 미지원 환경에서는 무시
  }
}
