// Tiện ích giao diện dùng chung
import { MENTOR, AVATARS } from './content.js';
import { owl } from './art.js';
import { audioCtx, sfxOut, duck, toggleMusic, musicOn, onMusicChange } from './music.js';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [p, val] of Object.entries(v)) p.startsWith('--') ? el.style.setProperty(p, val) : (el.style[p] = val);
    }
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const $app = () => document.getElementById('app');
export function mount(...nodes) {
  stopSpeak();
  const app = $app();
  app.replaceChildren(...nodes);
  window.scrollTo(0, 0);
}

export function fill(text, ctx = {}) {
  return String(text ?? '')
    .replaceAll('{name}', ctx.name || 'Học viên')
    .replaceAll('{NAME}', (ctx.name || 'Học viên').toUpperCase())
    .replaceAll('{avatar}', ctx.avatar || '🙂');
}

// ---- Giọng đọc (Web Speech API, ưu tiên giọng tiếng Việt nếu thiết bị có)
let viVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  viVoice = vs.find(v => v.lang?.toLowerCase().startsWith('vi')) || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
export function speak(text) {
  if (!('speechSynthesis' in window)) return toast('Thiết bị này chưa hỗ trợ giọng đọc');
  stopSpeak();
  const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ''));
  u.lang = 'vi-VN'; u.rate = 0.95;
  if (viVoice) u.voice = viVoice;
  u.onend = u.onerror = () => duck(false);
  duck(true);
  speechSynthesis.speak(u);
}
export function stopSpeak() { if ('speechSynthesis' in window) speechSynthesis.cancel(); duck(false); }
export const speakBtn = text => h('button', { class: 'speak', title: 'Nghe đọc', 'aria-label': 'Nghe đọc', onclick: e => { e.stopPropagation(); speak(typeof text === 'function' ? text() : text); } }, '🔊');

// ---- Âm thanh ngắn (tạo bằng WebAudio, không cần tệp)
export function sound(kind) {
  if (localStorage.getItem('hvahm:mute') === '1') return;
  try {
    const actx = audioCtx();
    if (!actx) return;
    actx.resume();
    const notes = { good: [523, 659, 784], ok: [440, 523], bad: [330, 262], tap: [660], win: [523, 659, 784, 1047] }[kind] || [440];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      const t = actx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(sfxOut()); o.start(t); o.stop(t + 0.3);
    });
  } catch { /* không có âm thanh cũng không sao */ }
}

export function toast(msg) {
  const t = h('div', { class: 'toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 2600);
}

export function confetti() {
  const box = h('div', { class: 'confetti' });
  const bits = ['🎉', '⭐', '✨', '🎊', '💖', '🛡️'];
  for (let i = 0; i < 28; i++) {
    box.append(h('span', { style: { left: Math.random() * 100 + '%', animationDelay: Math.random() * 0.8 + 's', fontSize: 18 + Math.random() * 18 + 'px' } }, bits[i % bits.length]));
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 3200);
}

// Lời của Cú Thông Thái
export function mentor(text, extra) {
  return h('div', { class: 'mentor' },
    h('div', { class: 'mentor-ava' }, owl()),
    h('div', { class: 'bubble' }, h('b', {}, MENTOR.name), h('p', {}, text), speakBtn(text), extra));
}

export function avatarEl(profile, size = 'md') {
  const a = AVATARS.find(x => x.id === profile?.avatar) || { emoji: '🙂' };
  return h('span', { class: `ava ava-${size}`, style: { background: profile?.color || '#FFD166' } }, a.emoji);
}
export const avatarEmoji = id => (AVATARS.find(x => x.id === id) || { emoji: '🙂' }).emoji;
export const animalName = id => (AVATARS.find(x => x.id === id) || { name: 'Học viên' }).name;

export function shields(n, max = 3) {
  return h('span', { class: 'shields', 'aria-label': `${n} trên ${max} khiên` },
    Array.from({ length: max }, (_, i) => h('span', { class: i < n ? 'on' : 'off' }, '🛡️')));
}

export const LEVEL = {
  3: { label: 'An toàn', cls: 'lv3', icon: '🌟' },
  2: { label: 'Gần an toàn', cls: 'lv2', icon: '🤔' },
  1: { label: 'Cần luyện thêm', cls: 'lv1', icon: '💡' },
};

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---- "Điện thoại giả": khung ứng dụng hư cấu
export function phone(screen, ctx) {
  const f = t => fill(t, ctx);
  const head = h('div', { class: 'ph-head' },
    screen.contact
      ? [h('span', { class: 'ph-ava' }, f(screen.contact.avatar)), h('div', {}, h('b', {}, f(screen.contact.name)), h('small', {}, screen.contact.meta))]
      : h('b', {}, appIcon(screen.app), ' ', screen.app));
  const body = h('div', { class: 'ph-body' }, (screen.blocks || []).map(b => block(b, f)));
  return h('div', { class: 'phone', 'data-app': screen.app }, h('div', { class: 'ph-bar' }, h('span', {}, '9:41'), h('span', {}, screen.contact ? `💬 ${screen.app}` : ''), h('span', {}, '📶 🔋')), head, body);
}
function appIcon(app) {
  return { 'Kết Nối Vui': '🌐', 'Chat Nhí': '💬', 'MeoTube': '▶️', 'Đảo Kim Cương': '💎', 'Trình duyệt': '🧭', 'Hộp thư': '✉️' }[app] || '📱';
}
function block(b, f) {
  switch (b.b) {
    case 'msg': return h('div', { class: `msg ${b.from}` }, f(b.text));
    case 'note': return h('div', { class: 'ph-note' }, f(b.text));
    case 'notif': return h('div', { class: 'notif' }, h('span', {}, b.icon), f(b.text));
    case 'profile': return h('div', { class: 'profile' }, h('span', { class: 'ph-ava big' }, b.avatar), h('div', {}, h('b', {}, f(b.name)), b.lines.map(l => h('div', { class: 'pl' }, l))));
    case 'post': return h('div', { class: 'post' },
      h('div', { class: 'post-h' }, h('span', { class: 'ph-ava' }, f(b.avatar)), h('div', {}, h('b', {}, f(b.who)), h('small', {}, b.time))),
      h('p', {}, f(b.text)), b.art && h('div', { class: 'art' }, b.art), b.stats && h('small', { class: 'stats' }, '🔁 ', b.stats),
      h('div', { class: 'post-act' }, h('span', {}, '👍 Thích'), h('span', {}, '💬 Bình luận'), h('span', {}, '↗️ Chia sẻ')));
    case 'comment': return h('div', { class: 'comment' }, h('span', { class: 'ph-ava sm' }, b.avatar), h('div', {}, h('b', {}, f(b.who)), ' ', f(b.text)));
    case 'web': return h('div', { class: 'web' }, h('div', { class: 'url' }, '🔒 ', b.url), h('h4', {}, f(b.title)), h('p', {}, f(b.text)),
      (b.fields || []).map(x => h('div', { class: 'fake-input' }, x)), b.button && h('div', { class: 'fake-btn' }, b.button));
    case 'video': return h('div', { class: 'video' }, h('div', { class: 'screen' }, h('div', { class: 'art' }, b.art), h('div', { class: 'next' }, b.next)), h('b', {}, f(b.title)), h('small', {}, b.watched));
    case 'popup': return h('div', { class: 'popup' }, h('h4', {}, f(b.title)), h('div', { class: 'art' }, b.art), h('p', {}, f(b.text)), b.timer && h('div', { class: 'timer' }, '⏳ ', b.timer), b.button && h('div', { class: 'fake-btn big' }, b.button));
    case 'photo': return h('div', { class: 'photo' }, h('div', { class: 'art' }, b.art), h('small', {}, f(b.caption)));
    default: return null;
  }
}

export function spinner(text = 'Đang tải…') { return h('div', { class: 'center pad' }, h('div', { class: 'spin' }, owl()), h('p', { class: 'spin-text' }, text)); }

export function topbar(title, opts = {}) {
  return h('header', { class: 'topbar' },
    opts.back ? h('a', { class: 'btn ghost sm back', href: opts.back }, '⬅ ', h('span', { class: 'hide-xs' }, opts.backLabel || 'Quay lại')) : h('span'),
    h('h1', {}, title),
    h('span', { class: 'top-right' }, opts.right, audioBtns()));
}

// Hai nút: nhạc nền 🎵 và hiệu ứng âm thanh 🔈
export function audioBtns() {
  const sfxOn = () => localStorage.getItem('hvahm:mute') !== '1';
  const music = h('button', { class: 'icon-btn', onclick: e => { e.stopPropagation(); toggleMusic(); } });
  const drawMusic = () => {
    music.classList.toggle('off', !musicOn());
    music.title = musicOn() ? 'Tắt nhạc nền' : 'Bật nhạc nền';
    music.setAttribute('aria-label', music.title);
    music.textContent = '🎵';
  };
  drawMusic();
  const off = onMusicChange(drawMusic);
  new MutationObserver((_, obs) => { if (!music.isConnected) { off(); obs.disconnect(); } }).observe(document.body, { childList: true, subtree: true });
  const sfx = h('button', {
    class: `icon-btn ${sfxOn() ? '' : 'off'}`, title: 'Bật/tắt hiệu ứng âm thanh', 'aria-label': 'Bật/tắt hiệu ứng âm thanh',
    onclick: e => { e.stopPropagation(); localStorage.setItem('hvahm:mute', sfxOn() ? '1' : '0'); sfx.classList.toggle('off', !sfxOn()); sfx.textContent = sfxOn() ? '🔈' : '🔇'; },
  }, sfxOn() ? '🔈' : '🔇');
  return h('span', { class: 'audio-btns' }, music, sfx);
}

// Kiểm tra từ ngữ không phù hợp
export function hasBadWord(text, list) {
  const t = ' ' + text.toLowerCase().replace(/[.,!?;:"'()]/g, ' ') + ' ';
  return list.some(w => t.includes(' ' + w + ' '));
}
