// Nhạc nền hộp nhạc nhẹ nhàng, tạo trực tiếp bằng WebAudio (không cần tệp nhạc).
// Giai điệu ngũ cung tự soạn, vòng hợp âm C – Am – F – G, nhịp chậm.

let ctx = null;
let master, musicBus, sfxBus, timer = null, nextTime = 0, step = 0;
const KEY = 'hvahm:music';
const VOL = 0.55;
const listeners = new Set();

export function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
    // Nhạc đi qua bộ lọc mềm + vang để nghe êm
    musicBus = ctx.createGain(); musicBus.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    const verb = ctx.createConvolver(); verb.buffer = impulse(2.6);
    musicBus.connect(lp); lp.connect(master); lp.connect(verb); verb.connect(wet); wet.connect(master);
  }
  return ctx;
}
export const sfxOut = () => (audioCtx(), sfxBus);

function impulse(sec) {
  const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const EIGHTH = 60 / 76 / 2; // 76 nhịp/phút
const CHORDS = { C: [60, 64, 67], Am: [57, 60, 64], F: [53, 57, 60], G: [55, 59, 62] };
const BARS = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'];
const MELODY = [
  [76, 0, 79, 0, 84, 0, 79, 0],
  [81, 0, 79, 0, 76, 0, 0, 0],
  [81, 0, 84, 0, 81, 79, 0, 0],
  [79, 0, 74, 0, 79, 0, 0, 0],
  [76, 79, 84, 0, 86, 0, 84, 0],
  [81, 0, 76, 0, 79, 0, 81, 0],
  [84, 0, 81, 0, 79, 0, 76, 0],
  [74, 0, 76, 0, 72, 0, 0, 0],
];
const SPARKLE = [96, 98, 100, 103, 105];

function musicBox(m, t, vel = 1) {
  [[1, 0.07], [2, 0.018], [4.01, 0.006]].forEach(([mult, g]) => {
    const o = ctx.createOscillator(), e = ctx.createGain();
    o.type = 'sine'; o.frequency.value = hz(m) * mult;
    e.gain.setValueAtTime(0.0001, t);
    e.gain.exponentialRampToValueAtTime(g * vel, t + 0.008);
    e.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / mult);
    o.connect(e).connect(musicBus); o.start(t); o.stop(t + 1.7);
  });
}
function pad(notes, t, dur) {
  notes.forEach(m => {
    const o = ctx.createOscillator(), e = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = hz(m - 12);
    o.detune.value = (Math.random() - 0.5) * 8;
    e.gain.setValueAtTime(0.0001, t);
    e.gain.linearRampToValueAtTime(0.018, t + 0.9);
    e.gain.linearRampToValueAtTime(0.012, t + dur - 0.3);
    e.gain.linearRampToValueAtTime(0.0001, t + dur + 1.2);
    o.connect(e).connect(musicBus); o.start(t); o.stop(t + dur + 1.3);
  });
}

function schedule(s, t) {
  const bar = Math.floor(s / 8), slot = s % 8;
  if (slot === 0) pad(CHORDS[BARS[bar]], t, EIGHTH * 8);
  const n = MELODY[bar][slot];
  if (n) musicBox(n, t, slot % 2 ? 0.75 : 1);
  if (slot === 6 && Math.random() < 0.25) musicBox(SPARKLE[Math.floor(Math.random() * SPARKLE.length)], t, 0.25);
}
function tick() {
  while (nextTime < ctx.currentTime + 0.25) {
    schedule(step, nextTime);
    nextTime += EIGHTH;
    step = (step + 1) % (BARS.length * 8);
  }
}

export const musicOn = () => localStorage.getItem(KEY) !== '0';
export const musicPlaying = () => !!timer;

export function startMusic() {
  if (!musicOn() || timer) return;
  if (!audioCtx()) return;
  ctx.resume();
  nextTime = ctx.currentTime + 0.1;
  timer = setInterval(tick, 80);
  tick();
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setTargetAtTime(VOL, ctx.currentTime, 1.2);
  listeners.forEach(l => l());
}
export function stopMusic() {
  if (!timer) return;
  clearInterval(timer); timer = null;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  listeners.forEach(l => l());
}
export function toggleMusic() {
  localStorage.setItem(KEY, musicOn() ? '0' : '1');
  musicOn() ? startMusic() : stopMusic();
}
export function onMusicChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// Nhỏ nhạc lại khi đang đọc lời thoại
export function duck(on) {
  if (!ctx || !timer) return;
  musicBus.gain.setTargetAtTime(on ? VOL * 0.15 : VOL, ctx.currentTime, 0.25);
}

// Trình duyệt chỉ cho phát âm thanh sau lần chạm đầu tiên
export function initMusic() {
  const kick = () => { startMusic(); if (timer || !musicOn()) { window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); } };
  window.addEventListener('pointerdown', kick);
  window.addEventListener('keydown', kick);
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    document.hidden ? ctx.suspend() : (timer && ctx.resume());
  });
}
