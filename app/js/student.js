// Các màn hình của học sinh: chào, đăng nhập, chọn nhân vật, bản đồ, khảo sát, tốt nghiệp, sổ tay, xưởng sáng tạo, thư viện
import { store } from './store.js';
import { AVATARS, ADJECTIVES, COLORS, CHALLENGES, SURVEYS, BAD_WORDS } from './content.js';
import { h, mount, fill, mentor, speakBtn, sound, shields, toast, confetti, topbar, avatarEl, avatarEmoji, animalName, shuffle, spinner, hasBadWord, LEVEL, phone, audioBtns } from './ui.js';
import { playChallenge } from './player.js';
import { installButton } from './pwa.js';
import { owl } from './art.js';

const SKEY = 'hvahm:session';
export const session = {
  get() { try { return JSON.parse(localStorage.getItem(SKEY)); } catch { return null; } },
  set(v) { localStorage.setItem(SKEY, JSON.stringify(v)); },
  clear() { localStorage.removeItem(SKEY); },
};
export const nickname = p => p ? `${animalName(p.avatar)} ${p.adj}` : 'Học viên';
export const ctxOf = me => ({ name: animalName(me?.profile?.avatar), avatar: avatarEmoji(me?.profile?.avatar) });

async function loadMe() {
  const s = session.get();
  if (!s) { location.hash = '#/login'; return null; }
  const [cls, me] = await Promise.all([store.getClass(s.classCode), store.getStudent(s.classCode, s.sid)]);
  if (!cls || !me) { session.clear(); location.hash = '#/login'; return null; }
  if (!me.profile) { location.hash = '#/profile'; return null; }
  return { s, cls, me };
}

// ---------------------------------------------------------------- Chào
const word = (text, cls) => h('span', { class: cls }, text.split(' ').map((w, i) => h('span', { class: 'wobble', style: { animationDelay: `${i * 0.15}s` } }, w)));

export function welcome() {
  const s = session.get();
  const greet = 'Chào mừng em đến Học viện! Đây là trò chơi luyện tập. Mọi nhân vật trong trò chơi đều là nhân vật giả, nên em cứ yên tâm thử sức nhé!';
  const menuBtn = (href, icon, title, sub, color) => h('a', { class: 'menu-btn', href, style: { '--c': color } },
    h('span', { class: 'menu-ic' }, icon), h('span', { class: 'menu-tx' }, h('b', {}, title), h('small', {}, sub)), h('span', { class: 'menu-go' }, '▶'));
  mount(
    h('header', { class: 'topbar clear' }, h('span'), h('span'), h('span', { class: 'top-right' }, audioBtns())),
    h('main', { class: 'wrap welcome' },
      h('div', { class: 'title-wrap' },
        h('div', { class: 'title-badge' }, '🛡️'),
        h('h1', { class: 'title' }, word('Học viện', 't1'), word('Anh hùng Mạng', 't2')),
        h('p', { class: 'tagline' }, '✨ Cùng luyện kỹ năng an toàn trên mạng ✨')),
      h('div', { class: 'hero-owl' },
        h('div', { class: 'hero-owl-art' }, owl('owl-big')),
        h('div', { class: 'hero-bubble' }, h('b', {}, 'Cú Thông Thái'), h('p', {}, greet), speakBtn(greet))),
      h('nav', { class: 'menu' },
        menuBtn(s ? '#/map' : '#/login', s ? '🗺️' : '🎒', s ? 'Vào Học viện' : 'Em là học viên', s ? 'Tiếp tục hành trình của em' : 'Đăng nhập bằng mã lớp', '#7B2CBF'),
        menuBtn('#/join', '🎮', 'Chơi cùng cả lớp', 'Nhập mã PIN thầy cô chiếu trên bảng', '#F72585'),
        h('div', { class: 'menu-small' },
          h('a', { class: 'btn ghost sm', href: '#/teacher' }, '👩‍🏫 Dành cho giáo viên'),
          installButton())),
      store.mode === 'local' && h('p', { class: 'mode-note' }, '🧪 Chế độ chạy thử: dữ liệu lưu trên máy này. Kết nối Firebase để chơi trực tuyến trên nhiều thiết bị.')));
}

// ---------------------------------------------------------------- Đăng nhập
export function login() {
  const err = h('p', { class: 'error', hidden: true });
  const cls = h('input', { id: 'cls', placeholder: 'Ví dụ: 5A-K7Q2', autocomplete: 'off', autocapitalize: 'characters', required: true });
  const sid = h('input', { id: 'sid', placeholder: 'Ví dụ: 07', inputmode: 'numeric', autocomplete: 'off', required: true });
  const go = h('button', { class: 'btn big', type: 'submit' }, 'Vào Học viện ▶');
  async function submit(e) {
    e.preventDefault();
    err.hidden = true; go.disabled = true;
    const classCode = cls.value.trim().toUpperCase();
    const code = sid.value.trim().padStart(2, '0');
    try {
      const c = await store.getClass(classCode);
      if (!c) throw new Error('Không tìm thấy mã lớp. Em hỏi lại thầy cô nhé!');
      const me = await store.getStudent(classCode, code);
      if (!me) throw new Error('Không tìm thấy mã học viên trong lớp này.');
      session.set({ classCode, sid: code });
      location.hash = me.profile ? '#/map' : '#/profile';
    } catch (ex) { err.textContent = ex.message; err.hidden = false; sound('bad'); }
    go.disabled = false;
  }
  mount(topbar('Đăng nhập', { back: '#/' }),
    h('main', { class: 'wrap narrow' },
      mentor('Em nhập mã lớp và mã học viên mà thầy cô đã phát nhé. Em không cần nhập tên thật.'),
      h('form', { class: 'card form', onsubmit: submit },
        h('label', { for: 'cls' }, '🏫 Mã lớp'), cls,
        h('label', { for: 'sid' }, '🎫 Mã học viên'), sid,
        err, go)));
}

// ---------------------------------------------------------------- Chọn nhân vật
export async function profile() {
  const s = session.get();
  if (!s) return (location.hash = '#/login');
  mount(spinner());
  const me = await store.getStudent(s.classCode, s.sid);
  const p = { avatar: me?.profile?.avatar || AVATARS[0].id, adj: me?.profile?.adj || ADJECTIVES[0], color: me?.profile?.color || COLORS[0] };
  const preview = h('div', { class: 'preview' });
  const draw = () => preview.replaceChildren(avatarEl(p, 'xl'), h('h2', {}, nickname(p)));
  const grid = (items, key, render) => h('div', { class: 'pick-grid' }, items.map(it => {
    const val = typeof it === 'object' ? it.id : it;
    const b = h('button', { class: `pick ${p[key] === val ? 'on' : ''}`, onclick: () => { p[key] = val; b.parentElement.querySelectorAll('.pick').forEach(x => x.classList.remove('on')); b.classList.add('on'); sound('tap'); draw(); } }, render(it));
    return b;
  }));
  draw();
  mount(topbar('Chọn nhân vật', { back: '#/' }),
    h('main', { class: 'wrap' },
      mentor('Hãy chọn một con vật và một tính từ để làm biệt danh. Ở Học viện, mọi người gọi nhau bằng biệt danh thôi!'),
      h('div', { class: 'card center' }, preview),
      h('div', { class: 'card' }, h('h3', {}, '1. Chọn con vật'), grid(AVATARS, 'avatar', a => [h('span', { class: 'emo' }, a.emoji), h('small', {}, a.name)])),
      h('div', { class: 'card' }, h('h3', {}, '2. Chọn tính từ'), grid(ADJECTIVES, 'adj', a => a)),
      h('div', { class: 'card' }, h('h3', {}, '3. Chọn màu nền'), grid(COLORS, 'color', c => h('span', { class: 'swatch', style: { background: c } }))),
      h('div', { class: 'actions' }, h('button', {
        class: 'btn big', onclick: async () => { await store.updateStudent(s.classCode, s.sid, { profile: p }); sound('good'); location.hash = '#/map'; },
      }, 'Xong rồi! ✔'))));
}

// ---------------------------------------------------------------- Bản đồ Học viện
export function isAvailable(n, cls, me) {
  if (!me.results?.pre) return false;
  if (n > (cls.maxOpen ?? 8)) return false;
  return n === 1 || cls.freeOrder || !!me.results?.[`c${n - 1}`];
}

export function shieldArt(me, size = 'md') {
  return h('div', { class: `hero-shield ${size}` }, CHALLENGES.map(c =>
    h('span', { class: me.results?.[c.id] ? 'got' : '', style: { '--c': c.color }, title: c.badge }, me.results?.[c.id] ? c.icon : '·')));
}

export async function map() {
  mount(spinner());
  const d = await loadMe();
  if (!d) return;
  const { cls, me } = d;
  const R = me.results || {};
  const doneCount = CHALLENGES.filter(c => R[c.id]).length;
  const todayCount = +sessionStorage.getItem('hvahm:today') || 0;

  let say = 'Hãy làm Nhiệm vụ nhập học để mở cửa Học viện nhé!';
  if (R.pre) say = doneCount < 8 ? `Em đã có ${doneCount}/8 mảnh Lá chắn. Cố lên!` : R.post ? 'Chúc mừng Anh hùng Mạng! Ghé Xưởng sáng tạo để làm sản phẩm của em nhé.' : 'Em đã có đủ 8 mảnh! Hãy làm Kỳ thi tốt nghiệp.';
  if (todayCount >= 2) say += ' Hôm nay em đã học 2 thử thách rồi, nghỉ ngơi một chút cũng rất tốt đấy!';

  mount(
    topbar('Bản đồ Học viện', { back: '#/', backLabel: 'Trang đầu', right: h('span', { class: 'who' }, avatarEl(me.profile, 'sm'), h('span', { class: 'hide-sm' }, nickname(me.profile))) }),
    h('main', { class: 'wrap' },
      h('div', { class: 'map-head' },
        h('div', { class: 'shield-box' }, shieldArt(me, 'lg'), h('b', {}, `${doneCount}/8 mảnh`)),
        mentor(say)),
      journey(cls, me),
      h('div', { class: 'tiles' },
        R.post && h('a', { class: 'tile', href: '#/graduate', style: { '--c': '#FFB703' } }, '🎓', h('b', {}, 'Giấy chứng nhận')),
        h('a', { class: 'tile', href: '#/notebook', style: { '--c': '#06D6A0' } }, '📒', h('b', {}, 'Sổ tay Anh hùng')),
        R.post && h('a', { class: 'tile', href: '#/studio', style: { '--c': '#F72585' } }, '🎨', h('b', {}, 'Xưởng sáng tạo')),
        h('a', { class: 'tile', href: '#/library', style: { '--c': '#4CC9F0' } }, '📚', h('b', {}, 'Thư viện của lớp')),
        h('a', { class: 'tile', href: '#/join', style: { '--c': '#FB8500' } }, '🎮', h('b', {}, 'Chơi cùng lớp')),
        h('a', { class: 'tile', href: '#/profile', style: { '--c': '#B497D6' } }, '🎭', h('b', {}, 'Đổi nhân vật')),
        h('button', { class: 'tile', style: { '--c': '#8D99AE' }, onclick: () => { session.clear(); location.hash = '#/'; } }, '🚪', h('b', {}, 'Đăng xuất')))));
  requestAnimationFrame(() => drawRoad(document.querySelector('.journey')));
}

// Con đường phiêu lưu: Nhập học → 8 phòng → Tốt nghiệp, nối bằng đường cong
function journey(cls, me) {
  const R = me.results || {};
  const allDone = CHALLENGES.every(c => R[c.id]);
  const stops = [
    { icon: '📜', title: 'Nhập học', sub: 'Nhiệm vụ đầu tiên', color: '#FF9F1C', href: R.pre ? null : '#/survey/pre', open: !R.pre, done: !!R.pre },
    ...CHALLENGES.map(c => ({ no: c.no, icon: c.icon, title: c.room, sub: c.title, color: c.color, href: `#/c/${c.id}`, open: isAvailable(c.no, cls, me), done: !!R[c.id], shields: R[c.id]?.shields })),
    { icon: '🎓', title: 'Tốt nghiệp', sub: R.post ? 'Xem giấy chứng nhận' : 'Kỳ thi cuối cùng', color: '#FFB703', href: R.post ? '#/graduate' : '#/survey/post', open: allDone, done: !!R.post },
  ];
  const cur = stops.findIndex(s => s.open && !s.done);
  const XS = [50, 80, 50, 20];
  const box = h('div', { class: 'journey' }, stops.map((s, i) => {
    const state = s.done ? 'done' : s.open ? 'open' : 'locked';
    return h(s.open || (s.done && s.href) ? 'a' : 'div', {
      class: `stop ${state} ${i === cur ? 'current' : ''}`, href: s.open || s.done ? s.href : null,
      style: { '--x': XS[i % 4] + '%', '--c': s.color, animationDelay: `${i * 0.06}s` },
    },
      i === cur && h('span', { class: 'here' }, avatarEl(me.profile, 'sm'), 'Em ở đây'),
      h('span', { class: 'stop-dot' }, h('span', { class: 'stop-ic' }, state === 'locked' ? '🔒' : s.icon), s.no && h('span', { class: 'stop-no' }, s.no), s.done && h('span', { class: 'stop-ok' }, '✓')),
      h('span', { class: 'stop-label' }, h('b', {}, s.title), h('small', {}, s.sub), s.shields ? shields(s.shields) : null));
  }));
  const ro = new ResizeObserver(() => drawRoad(box));
  ro.observe(box);
  return box;
}

function drawRoad(box) {
  if (!box?.isConnected) return;
  const b = box.getBoundingClientRect();
  const stops = [...box.querySelectorAll('.stop')];
  const pts = stops.map(s => { const r = s.querySelector('.stop-dot').getBoundingClientRect(); return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; });
  const seg = (i) => {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], ym = (y0 + y1) / 2;
    return `M${x0} ${y0} C${x0} ${ym} ${x1} ${ym} ${x1} ${y1}`;
  };
  const paths = pts.slice(0, -1).map((_, i) => {
    const done = stops[i].classList.contains('done');
    return `<path class="road-base" d="${seg(i)}"/><path class="road-line ${done ? 'done' : ''}" d="${seg(i)}"/>`;
  }).join('');
  let svg = box.querySelector('svg.road');
  if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'road'); svg.setAttribute('aria-hidden', 'true'); box.prepend(svg); }
  svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
  svg.setAttribute('width', b.width); svg.setAttribute('height', b.height);
  svg.innerHTML = paths;
}

// ---------------------------------------------------------------- Thử thách
export async function challenge(id) {
  mount(spinner());
  const d = await loadMe();
  if (!d) return;
  const { s, cls, me } = d;
  const ch = CHALLENGES.find(c => c.id === id);
  if (!ch || !isAvailable(ch.no, cls, me)) { toast('Phòng này chưa mở'); location.hash = '#/map'; return; }
  playChallenge(ch, ctxOf(me), {
    onDone: async (result, rules, plan) => {
      const cur = await store.getStudent(s.classCode, s.sid);
      const patch = {
        [`plays.${id}`]: (cur.plays?.[id] || 0) + 1,
        notebook: [...new Set([...(cur.notebook || []), ...rules])],
      };
      if (!cur.results?.[id]) patch[`results.${id}`] = result; // chỉ ghi nhận lần chơi đầu
      if (plan) patch.plan = plan;
      await store.updateStudent(s.classCode, s.sid, patch);
      sessionStorage.setItem('hvahm:today', (+sessionStorage.getItem('hvahm:today') || 0) + 1);
    },
    onExit: () => { location.hash = '#/map'; },
  });
}

// ---------------------------------------------------------------- Khảo sát trước / sau
export async function survey(kind) {
  mount(spinner());
  const d = await loadMe();
  if (!d) return;
  const { s, me } = d;
  const S = SURVEYS[kind];
  const R = me.results || {};
  if (R[kind] || (kind === 'post' && CHALLENGES.some(c => !R[c.id]))) { location.hash = '#/map'; return; }
  const ctx = ctxOf(me);
  const answers = [];
  const self = [];
  const started = Date.now();
  const frame = (...k) => mount(topbar(`📜 ${S.title}`, { back: '#/map', backLabel: 'Bản đồ' }), h('main', { class: 'wrap narrow' }, k));

  const intro = () => frame(mentor(fill(S.intro, ctx)), h('div', { class: 'actions' }, h('button', { class: 'btn big', onclick: () => item(0) }, 'Bắt đầu ▶')));

  function item(i) {
    if (i >= S.items.length) return selfRate(0);
    const it = S.items[i];
    const order = shuffle(it.choices.map(([text, level], idx) => ({ text, level, idx })));
    frame(
      h('div', { class: 'progress' }, S.items.map((_, k) => h('span', { class: k < i ? 'done' : k === i ? 'now' : '' }))),
      h('div', { class: 'card survey' },
        h('div', { class: 'big-art' }, it.art),
        h('p', { class: 'lead' }, it.text, speakBtn(it.text + '. ' + order.map(c => c.text).join('. '))),
        h('div', { class: 'choices' }, order.map(c => h('button', {
          class: 'choice', onclick: () => { answers.push({ t: it.t, level: c.level, choice: c.idx }); sound('tap'); item(i + 1); },
        }, c.text)))));
  }

  function selfRate(i) {
    if (i >= SURVEYS.self.length) return save();
    const q = SURVEYS.self[i];
    frame(
      h('div', { class: 'card survey' },
        h('p', { class: 'muted' }, `Em tự đánh giá (${i + 1}/${SURVEYS.self.length})`),
        h('p', { class: 'lead' }, q, speakBtn(q)),
        h('div', { class: 'scale' }, SURVEYS.scale.map(([emo, label], v) => h('button', { class: 'scale-btn', onclick: () => { self.push(v + 1); sound('tap'); selfRate(i + 1); } }, h('span', {}, emo), h('small', {}, label))))));
  }

  async function save() {
    frame(spinner('Đang ghi nhận…'));
    await store.updateStudent(s.classCode, s.sid, { [`results.${kind}`]: { answers, self, ms: Date.now() - started, at: Date.now() } });
    sound('win');
    if (kind === 'post') { location.hash = '#/graduate'; return; }
    confetti();
    frame(mentor(`Cảm ơn ${ctx.name}! Cửa Học viện đã mở. Phòng đầu tiên đang chờ em!`), h('div', { class: 'actions' }, h('a', { class: 'btn big', href: '#/map' }, 'Đến Bản đồ 🗺️')));
  }
  intro();
}

// ---------------------------------------------------------------- Tốt nghiệp
export async function graduate() {
  mount(spinner());
  const d = await loadMe();
  if (!d) return;
  const { cls, me } = d;
  if (!me.results?.post) { location.hash = '#/map'; return; }
  const date = new Date(me.results.post.at).toLocaleDateString('vi-VN');
  confetti(); sound('win');
  mount(topbar('🎓 Lễ tốt nghiệp', { back: '#/map', backLabel: 'Bản đồ' }),
    h('main', { class: 'wrap' },
      h('div', { class: 'cert', id: 'print-area' },
        h('div', { class: 'cert-in' },
          h('p', { class: 'cert-top' }, 'HỌC VIỆN ANH HÙNG MẠNG'),
          h('h2', {}, 'GIẤY CHỨNG NHẬN TỐT NGHIỆP'),
          h('p', {}, 'Trao cho học viên'),
          h('div', { class: 'cert-name' }, avatarEl(me.profile, 'lg'), h('b', {}, nickname(me.profile))),
          h('p', {}, `Lớp ${cls.name} · đã vượt qua 8 thử thách`),
          shieldArt(me, 'md'),
          h('p', { class: 'cert-title' }, '🛡️ ANH HÙNG MẠNG 🛡️'),
          h('p', { class: 'muted' }, `Ngày ${date}`),
          h('div', { class: 'cert-sign' }, owl('owl-sign'), h('small', {}, 'Cú Thông Thái – Hiệu trưởng')))),
      h('div', { class: 'actions no-print' },
        h('button', { class: 'btn', onclick: () => window.print() }, '🖨️ In giấy chứng nhận'),
        h('a', { class: 'btn alt', href: '#/studio' }, '🎨 Đến Xưởng sáng tạo'))));
}

// ---------------------------------------------------------------- Sổ tay
export async function notebook() {
  mount(spinner());
  const d = await loadMe();
  if (!d) return;
  const { me } = d;
  const nb = me.notebook || [];
  mount(topbar('📒 Sổ tay Anh hùng', { back: '#/map', backLabel: 'Bản đồ' }),
    h('main', { class: 'wrap narrow' },
      mentor(nb.length ? 'Đây là những quy tắc em đã tự rút ra. Hãy đọc lại thường xuyên nhé!' : 'Sổ tay đang trống. Hoàn thành thử thách để ghi quy tắc vào đây!'),
      nb.length > 0 && h('div', { class: 'card' }, h('ol', { class: 'nb' }, nb.map(r => h('li', {}, r, speakBtn(r))))),
      me.plan && h('div', { class: 'card' }, h('h3', {}, '⏰ Kế hoạch dùng thiết bị'), h('p', {}, `Mỗi ngày tối đa ${me.plan.minutes} phút giải trí.`), h('p', {}, 'Khi hết giờ em sẽ: ', me.plan.activities.join(', '))),
      h('div', { class: 'card' }, h('h3', {}, '🏅 Huy hiệu'), h('div', { class: 'badges' }, CHALLENGES.map(c => {
        const r = me.results?.[c.id];
        return h('div', { class: `badge ${r ? '' : 'off'}` }, h('span', {}, c.icon), h('small', {}, c.badge), r && shields(r.shields));
      })))));
}

// ---------------------------------------------------------------- Xưởng sáng tạo
const CHARS = [['🦊', 'Cáo'], ['🐺', 'Sói'], ['🐍', 'Rắn'], ['🦝', 'Gấu Mèo'], ['👤', 'Người lạ'], ['🤖', 'Rô-bốt'], ['🐦‍⬛', 'Quạ']];
const SETTINGS = ['Chat Nhí', 'Kết Nối Vui', 'Đảo Kim Cương', 'MeoTube'];

export async function studio() {
  mount(spinner());
  const d = await loadMe();
  if (!d) return;
  const { s, me } = d;
  if (!me.results?.post) { location.hash = '#/map'; return; }
  const mine = (await store.listCreations(s.classCode)).filter(c => c.by === s.sid);
  const form = { char: CHARS[0], setting: SETTINGS[0], safe: null };
  const err = h('p', { class: 'error', hidden: true });
  const msg = h('textarea', { maxlength: 120, rows: 3, placeholder: 'Ví dụ: Bạn ơi cho mình mượn tài khoản game nhé!' });
  const opts = [0, 1, 2].map(i => h('input', { maxlength: 60, placeholder: `Cách xử lý ${i + 1}` }));
  const safeBtns = opts.map((_, i) => h('button', { type: 'button', class: 'chip', onclick: e => { form.safe = i; safeBtns.forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); } }, '🌟 An toàn'));
  const rule = h('input', { maxlength: 80, placeholder: 'Quy tắc em muốn góp cho Lá chắn của lớp', value: me.notebook?.[0] || '' });
  const chips = (list, key, label) => h('div', { class: 'chips' }, list.map(v => h('button', { type: 'button', class: `chip ${form[key] === v ? 'on' : ''}`, onclick: e => { form[key] = v; e.currentTarget.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, label(v))));

  async function submit(e) {
    e.preventDefault();
    err.hidden = true;
    const texts = [msg.value, ...opts.map(o => o.value), rule.value].map(t => t.trim());
    if (texts.some(t => !t)) return showErr('Em hãy điền đủ tất cả các ô nhé.');
    if (form.safe === null) return showErr('Em hãy đánh dấu cách xử lý an toàn.');
    if (texts.some(t => hasBadWord(t, BAD_WORDS))) return showErr('Có từ ngữ chưa phù hợp. Em sửa lại cho lịch sự hơn nhé!');
    await store.addCreation(s.classCode, {
      by: s.sid, nickname: nickname(me.profile), avatar: me.profile.avatar,
      char: form.char[0], charName: form.char[1], setting: form.setting, message: texts[0],
      options: [0, 1, 2].map(i => ({ text: texts[i + 1], safe: i === form.safe })), rule: texts[4],
    });
    sound('good'); toast('Đã gửi cho thầy cô duyệt!');
    studio();
  }
  const showErr = t => { err.textContent = t; err.hidden = false; sound('bad'); };

  mount(topbar('🎨 Xưởng sáng tạo', { back: '#/map', backLabel: 'Bản đồ' }),
    h('main', { class: 'wrap narrow' },
      mentor('Giờ em là người ra đề! Hãy sáng tác một tình huống để thử thách các bạn. Thầy cô sẽ duyệt trước khi đưa vào Thư viện của lớp.'),
      h('form', { class: 'card form', onsubmit: submit },
        h('h3', {}, '1. Nhân vật'), chips(CHARS, 'char', c => `${c[0]} ${c[1]}`),
        h('h3', {}, '2. Ứng dụng'), chips(SETTINGS, 'setting', v => v),
        h('h3', {}, '3. Nhân vật nhắn gì?'), msg,
        h('h3', {}, '4. Ba cách xử lý (đánh dấu cách an toàn)'), opts.map((o, i) => h('div', { class: 'opt-row' }, o, safeBtns[i])),
        h('h3', {}, '5. Quy tắc góp cho Lá chắn an toàn của lớp'), rule,
        err, h('button', { class: 'btn big', type: 'submit' }, 'Gửi thầy cô duyệt 📨')),
      h('div', { class: 'card' }, h('h3', {}, '🖼️ Poster điện tử'), h('p', { class: 'muted' }, 'Tạo poster từ các quy tắc trong Sổ tay của em.'), h('button', { class: 'btn alt', onclick: () => poster(me) }, 'Tạo poster')),
      mine.length > 0 && h('div', { class: 'card' }, h('h3', {}, 'Tình huống em đã gửi'), mine.map(c => h('div', { class: 'mine' }, `${c.char} ${c.message}`, h('span', { class: `status ${c.status}` }, { pending: '⏳ Chờ duyệt', approved: '✅ Đã duyệt', rejected: '✏️ Cần sửa' }[c.status]))))));
}

function poster(me) {
  const rules = (me.notebook || []).slice(0, 4);
  const cv = document.createElement('canvas');
  cv.width = 1080; cv.height = 1350;
  const g = cv.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 1080, 1350);
  grad.addColorStop(0, '#FFD6E8'); grad.addColorStop(1, '#C8F1FF');
  g.fillStyle = grad; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = me.profile.color; g.beginPath(); g.arc(540, 250, 140, 0, Math.PI * 2); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '160px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; g.fillText(avatarEmoji(me.profile.avatar), 540, 260);
  g.fillStyle = '#2B2D42'; g.font = 'bold 64px "Baloo 2", sans-serif'; g.fillText('LÁ CHẮN CỦA', 540, 470);
  g.font = 'bold 72px "Baloo 2", sans-serif'; g.fillStyle = '#7B2CBF'; g.fillText(nickname(me.profile).toUpperCase(), 540, 550);
  g.textAlign = 'left'; g.fillStyle = '#2B2D42'; g.font = '44px "Baloo 2", sans-serif';
  let y = 680;
  (rules.length ? rules : ['Dừng lại – Suy nghĩ – Hỏi người lớn.']).forEach(r => {
    const words = `🛡️ ${r}`.split(' ');
    let line = '';
    words.forEach(w => { if (g.measureText(line + w).width > 900) { g.fillText(line, 90, y); y += 58; line = ''; } line += w + ' '; });
    g.fillText(line, 90, y); y += 90;
  });
  g.textAlign = 'center'; g.font = '36px "Baloo 2", sans-serif'; g.fillStyle = '#555'; g.fillText('Học viện Anh hùng Mạng 🦉', 540, 1290);
  const a = h('a', { href: cv.toDataURL('image/png'), download: 'poster-anh-hung-mang.png' });
  document.body.append(a); a.click(); a.remove();
  toast('Đã tạo poster!');
}

// ---------------------------------------------------------------- Thư viện tình huống của lớp
export async function library() {
  mount(spinner());
  const d = await loadMe();
  if (!d) return;
  const { s, me } = d;
  const list = (await store.listCreations(s.classCode)).filter(c => c.status === 'approved');
  mount(topbar('📚 Thư viện của lớp', { back: '#/map', backLabel: 'Bản đồ' }),
    h('main', { class: 'wrap narrow' },
      mentor(list.length ? 'Đây là các tình huống do các bạn trong lớp sáng tác. Em thử sức nhé!' : 'Thư viện chưa có tình huống nào. Các bạn tốt nghiệp sẽ sáng tác thêm!'),
      list.map(c => h('button', { class: 'quest', onclick: () => playCreation(c, me) }, h('span', {}, c.char), h('div', {}, h('b', {}, c.message), h('small', {}, `Tác giả: ${c.nickname}`)), h('span', { class: 'go' }, '▶')))));
}

function playCreation(c, me) {
  const screen = { app: c.setting, contact: { name: c.charName, avatar: c.char, meta: 'Tình huống của bạn ' + c.nickname }, blocks: [{ b: 'msg', from: 'them', text: c.message }] };
  const panel = h('div', { class: 'result-panel', hidden: true });
  const safe = c.options.find(o => o.safe);
  mount(topbar('📚 Tình huống của lớp', { back: '#/library', backLabel: 'Thư viện' }),
    h('main', { class: 'wrap play' }, h('div', { class: 'stage' }, phone(screen, ctxOf(me)),
      h('div', { class: 'side' }, h('div', { class: 'ask' }, 'Em sẽ làm gì?'),
        h('div', { class: 'choices' }, shuffle(c.options).map(o => h('button', {
          class: 'choice', onclick: e => {
            e.currentTarget.parentElement.querySelectorAll('button').forEach(b => { b.disabled = true; });
            const lv = o.safe ? 3 : 1;
            e.currentTarget.classList.add('picked', LEVEL[lv].cls);
            sound(o.safe ? 'good' : 'bad');
            panel.hidden = false; panel.className = `result-panel ${LEVEL[lv].cls}`;
            panel.replaceChildren(h('div', { class: 'lv-tag' }, o.safe ? '🌟 An toàn' : '💡 Chưa an toàn'),
              h('p', {}, 'Cách an toàn bạn tác giả chọn: ', h('b', {}, safe.text)),
              h('p', {}, '📌 Quy tắc: ', c.rule),
              h('div', { class: 'actions' }, h('button', { class: 'btn', onclick: () => library() }, 'Về thư viện')));
          },
        }, o.text))), panel))));
}
