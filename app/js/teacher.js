// Trang giáo viên: tạo lớp, cấp mã, theo dõi, thống kê, duyệt sản phẩm, xuất dữ liệu, xóa dữ liệu
import { store } from './store.js';
import { CHALLENGES, TOPICS } from './content.js';
import { h, mount, mentor, toast, topbar, avatarEl, shields, spinner } from './ui.js';
import { nickname } from './student.js';

const pct = x => `${Math.round(x * 100)}%`;
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
const safeShare = answers => answers?.length ? answers.filter(a => a.level === 3).length / answers.length : 0;

// Tiến độ một học viên: số thử thách đã xong, tổng lượt chơi, lần chơi gần nhất
export function progressOf(s) {
  const R = s.results || {};
  const done = CHALLENGES.filter(c => R[c.id]).length;
  const plays = Object.values(s.plays || {}).reduce((a, n) => a + n, 0);
  const steps = (R.pre ? 1 : 0) + done + (R.post ? 1 : 0);
  const lastAt = s.lastAt || Math.max(0, ...Object.values(R).map(r => r?.at || 0)) || null;
  return { done, plays, share: steps / (CHALLENGES.length + 2), lastAt };
}
const when = t => t ? new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '–';
const progressCell = p => h('div', { class: 'prog' }, h('div', { class: 'mini-bar' }, h('span', { style: { width: pct(p.share) } })), h('small', {}, `${p.done}/${CHALLENGES.length} thử thách`));

async function requireTeacher() {
  const t = await store.currentTeacher();
  if (!t) { location.hash = '#/teacher'; return null; }
  return t;
}

// ---------------------------------------------------------------- Đăng nhập / Bảng điều khiển
export async function teacherHome() {
  mount(spinner());
  const t = await store.currentTeacher();
  if (!t) return teacherLogin();
  const classes = await store.listClasses();
  const roster = (await Promise.all(classes.map(async c => (await store.listStudents(c.code)).map(s => ({ s, c, p: progressOf(s) })))))
    .flat().filter(x => x.s.profile || x.s.name)
    .sort((a, b) => a.c.name.localeCompare(b.c.name, 'vi') || (a.s.name || a.s.code).localeCompare(b.s.name || b.s.code, 'vi'));
  const err = h('p', { class: 'error', hidden: true });
  const name = h('input', { placeholder: 'Ví dụ: 5A', maxlength: 12, required: true });
  const count = h('input', { type: 'number', min: 1, max: 50, value: 35, required: true });
  const type = h('select', {}, h('option', { value: 'thucnghiem' }, 'Lớp thực nghiệm'), h('option', { value: 'doichung' }, 'Lớp đối chứng'));
  async function create(e) {
    e.preventDefault();
    try {
      const code = await store.createClass({ name: name.value.trim(), type: type.value, count: Math.min(50, Math.max(1, +count.value)) });
      toast(`Đã tạo lớp ${code}`);
      location.hash = `#/teacher/class/${code}`;
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
  }
  mount(topbar('👩‍🏫 Trang giáo viên', { back: '#/', right: h('button', { class: 'btn ghost sm', onclick: async () => { await store.teacherSignOut(); location.hash = '#/'; } }, 'Đăng xuất') }),
    h('main', { class: 'wrap' },
      h('p', { class: 'muted' }, 'Đăng nhập: ', t.email),
      h('div', { class: 'tiles' },
        store.mode !== 'local' && h('a', { class: 'tile', href: '#/host-new' }, '🎮', h('b', {}, 'Mở phòng chơi trực tuyến')),
        h('a', { class: 'tile', href: '#/teacher/compare' }, '📊', h('b', {}, 'So sánh các lớp')),
        h('a', { class: 'tile', href: '#/teacher/consent' }, '📝', h('b', {}, 'Phiếu đồng ý phụ huynh'))),
      h('h2', {}, 'Lớp của tôi'),
      classes.length ? h('div', { class: 'class-list' }, classes.map(c => h('a', { class: 'class-card', href: `#/teacher/class/${c.code}` },
        h('b', {}, `Lớp ${c.name}`), h('span', { class: 'code' }, c.code), h('small', {}, c.type === 'doichung' ? 'Đối chứng' : 'Thực nghiệm'))))
        : h('p', { class: 'muted' }, 'Chưa có lớp nào. Hãy tạo lớp đầu tiên.'),
      h('h2', {}, '📈 Thống kê học viên'),
      store.mode === 'local' && h('p', { class: 'muted' }, 'Số liệu của các học viên đã chơi trên máy này.'),
      h('div', { class: 'kpis' },
        kpi('Học viên', roster.length),
        kpi('Tổng lượt chơi', roster.reduce((a, x) => a + x.p.plays, 0)),
        kpi('Tiến độ trung bình', pct(mean(roster.map(x => x.p.share)))),
        kpi('Đã tốt nghiệp', roster.filter(x => x.s.results?.post).length)),
      roster.length ? h('div', { class: 'card scroll-x' }, h('table', { class: 'tbl' },
        h('tr', {}, h('th', {}, 'Học viên'), h('th', {}, 'Lớp'), h('th', {}, 'Tiến độ'), h('th', {}, 'Lượt chơi'), h('th', {}, 'Nhập học'), h('th', {}, 'Tốt nghiệp'), h('th', {}, 'Chơi gần nhất')),
        roster.map(({ s, c, p }) => h('tr', {},
          h('td', {}, h('b', {}, s.name || s.code), s.profile && h('small', { class: 'muted' }, h('br'), nickname(s.profile))),
          h('td', {}, h('a', { href: `#/teacher/class/${c.code}` }, c.name)),
          h('td', {}, progressCell(p)),
          h('td', {}, h('b', {}, p.plays)),
          h('td', {}, s.results?.pre ? '✅' : '–'),
          h('td', {}, s.results?.post ? '🎓' : '–'),
          h('td', {}, when(p.lastAt))))))
        : h('p', { class: 'muted' }, 'Chưa có học viên nào vào chơi.'),
      h('form', { class: 'card form', onsubmit: create },
        h('h3', {}, '➕ Tạo lớp mới'),
        h('label', {}, 'Tên lớp (không ghi tên trường)'), name,
        h('label', {}, 'Số học sinh (app tự sinh mã 01, 02, …)'), count,
        h('label', {}, 'Loại lớp'), type, err,
        h('button', { class: 'btn', type: 'submit' }, 'Tạo lớp'))));
}

function teacherLogin() {
  const err = h('p', { class: 'error', hidden: true });
  if (store.mode === 'local') {
    return mount(topbar('👩‍🏫 Giáo viên', { back: '#/' }), h('main', { class: 'wrap narrow' },
      mentor('Trang này chỉ có dữ liệu của học viên đã chơi trên máy này. Lịch sử đăng nhập của cả lớp, thầy cô xem trong Google Trang tính nối với Google Form.'),
      h('div', { class: 'actions' }, h('button', { class: 'btn big', onclick: async () => { await store.teacherSignIn(); teacherHome(); } }, 'Vào trang giáo viên ▶'))));
  }
  const email = h('input', { type: 'email', placeholder: 'email@truong.edu.vn', required: true, autocomplete: 'username' });
  const pw = h('input', { type: 'password', placeholder: 'Mật khẩu (ít nhất 6 ký tự)', required: true, minlength: 6, autocomplete: 'current-password' });
  const run = fn => async e => {
    e.preventDefault(); err.hidden = true;
    try { await fn(email.value.trim(), pw.value); teacherHome(); }
    catch (ex) { err.textContent = viAuthError(ex); err.hidden = false; }
  };
  mount(topbar('👩‍🏫 Giáo viên đăng nhập', { back: '#/' }), h('main', { class: 'wrap narrow' },
    h('form', { class: 'card form', onsubmit: run((a, b) => store.teacherSignIn(a, b)) },
      h('label', {}, 'Email'), email, h('label', {}, 'Mật khẩu'), pw, err,
      h('button', { class: 'btn big', type: 'submit' }, 'Đăng nhập'),
      h('button', { class: 'btn ghost', type: 'button', onclick: run((a, b) => store.teacherRegister(a, b)) }, 'Tạo tài khoản giáo viên mới'))));
}
function viAuthError(ex) {
  const c = ex.code || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'Email hoặc mật khẩu chưa đúng.';
  if (c.includes('email-already-in-use')) return 'Email này đã có tài khoản. Hãy bấm Đăng nhập.';
  if (c.includes('weak-password')) return 'Mật khẩu cần ít nhất 6 ký tự.';
  if (c.includes('invalid-email')) return 'Email chưa đúng định dạng.';
  return 'Có lỗi: ' + (ex.message || c);
}

// ---------------------------------------------------------------- Một lớp
export async function classView(code, tab = 'hocvien') {
  mount(spinner());
  if (!(await requireTeacher())) return;
  const [cls, students, creations] = await Promise.all([store.getClass(code), store.listStudents(code), store.listCreations(code)]);
  if (!cls) { toast('Không tìm thấy lớp'); location.hash = '#/teacher'; return; }
  students.sort((a, b) => a.code.localeCompare(b.code));
  const tabs = [['hocvien', '👥 Học viên'], ['thongke', '📊 Thống kê'], ['sanpham', `🎨 Sản phẩm (${creations.filter(c => c.status === 'pending').length})`], ['lachan', '🛡️ Lá chắn lớp'], ['caidat', '⚙️ Cài đặt']];
  const body = { hocvien: tabStudents, thongke: tabStats, sanpham: tabCreations, lachan: tabShield, caidat: tabSettings }[tab](cls, students, creations);
  mount(topbar(`Lớp ${cls.name}`, { back: '#/teacher', backLabel: 'Các lớp' }),
    h('main', { class: 'wrap wide' },
      h('div', { class: 'class-head no-print' }, h('div', {}, 'Mã lớp: ', h('span', { class: 'code big' }, cls.code)), h('small', { class: 'muted' }, cls.type === 'doichung' ? 'Lớp đối chứng' : 'Lớp thực nghiệm')),
      h('nav', { class: 'tabs no-print' }, tabs.map(([id, label]) => h('a', { class: id === tab ? 'on' : '', href: `#/teacher/class/${code}/${id}` }, label))),
      body));
}

function tabStudents(cls, students) {
  return h('div', { class: 'card scroll-x' }, h('table', { class: 'tbl' },
    h('tr', {}, h('th', {}, 'Học viên'), h('th', {}, 'Biệt danh'), h('th', {}, 'Tiến độ'), h('th', {}, 'Lượt chơi'), h('th', {}, 'Chơi gần nhất'), h('th', {}, 'Nhập học'), CHALLENGES.map(c => h('th', { title: c.title }, c.icon)), h('th', {}, 'Tốt nghiệp')),
    students.map(s => { const p = progressOf(s); return h('tr', {},
      h('td', {}, h('b', {}, s.name || s.code)),
      h('td', {}, s.profile ? [avatarEl(s.profile, 'sm'), ' ', nickname(s.profile)] : h('span', { class: 'muted' }, 'Chưa vào')),
      h('td', {}, progressCell(p)), h('td', {}, h('b', {}, p.plays)), h('td', {}, when(p.lastAt)),
      h('td', {}, s.results?.pre ? `✅ ${Math.round(safeShare(s.results.pre.answers) * 8)}/8` : '–'),
      CHALLENGES.map(c => h('td', {}, s.results?.[c.id] ? [shields(s.results[c.id].shields), h('br'), h('small', { class: 'muted' }, `${Math.round(s.results[c.id].ms / 60000)}′ · ${s.plays?.[c.id] || 1} lượt`)] : '–')),
      h('td', {}, s.results?.post ? `🎓 ${Math.round(safeShare(s.results.post.answers) * 8)}/8` : '–')); })));
}

export function classStats(students) {
  const active = students.filter(s => s.profile);
  const per = CHALLENGES.map(c => {
    const rs = active.map(s => s.results?.[c.id]).filter(Boolean);
    return { c, done: rs.length, completion: active.length ? rs.length / active.length : 0, safe: mean(rs.map(r => r.safeRate)), shields: mean(rs.map(r => r.shields)) };
  });
  const topic = kind => TOPICS.map((_, t) => {
    const as = active.map(s => s.results?.[kind]?.answers?.find(a => a.t === t)).filter(Boolean);
    return as.length ? as.filter(a => a.level === 3).length / as.length : null;
  });
  const pre = active.filter(s => s.results?.pre), post = active.filter(s => s.results?.post);
  return {
    active, per, preTopic: topic('pre'), postTopic: topic('post'),
    preSafe: mean(pre.map(s => safeShare(s.results.pre.answers))), postSafe: mean(post.map(s => safeShare(s.results.post.answers))),
    preSelf: mean(pre.map(s => mean(s.results.pre.self || []))), postSelf: mean(post.map(s => mean(s.results.post.self || []))),
    nPre: pre.length, nPost: post.length,
  };
}

function tabStats(cls, students) {
  const st = classStats(students);
  // Lựa chọn chưa an toàn phổ biến nhất ở mỗi tình huống
  const common = CHALLENGES.flatMap(c => c.screens.map((sc, i) => ({ c, sc, i })).filter(x => x.sc.type === 'choice').map(({ c, sc, i }) => {
    const firsts = st.active.map(s => s.results?.[c.id]?.first?.find(f => f.s === i)).filter(Boolean);
    const wrong = firsts.filter(f => f.level < 3);
    if (!wrong.length) return null;
    const counts = {};
    wrong.forEach(f => { counts[f.choice] = (counts[f.choice] || 0) + 1; });
    const [idx, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { c, ask: sc.station || sc.ask, text: sc.choices[idx].text, n, total: firsts.length };
  }).filter(Boolean)).sort((a, b) => b.n / b.total - a.n / a.total).slice(0, 8);

  const bar = (v, cls2 = '') => h('div', { class: `mini-bar ${cls2}` }, h('span', { style: { width: v == null ? '0' : pct(v) } }));
  return h('div', {},
    h('div', { class: 'kpis' },
      kpi('Học viên đã vào', `${st.active.length}/${students.length}`),
      kpi('Tổng lượt chơi', students.reduce((a, s) => a + progressOf(s).plays, 0)),
      kpi('Hoàn thành nhập học', `${st.nPre}`),
      kpi('Đã tốt nghiệp', `${st.nPost}`),
      kpi('Chọn an toàn (trước → sau)', `${pct(st.preSafe)} → ${st.nPost ? pct(st.postSafe) : '…'}`),
      kpi('Tự tin (1–4, trước → sau)', `${st.preSelf.toFixed(1)} → ${st.nPost ? st.postSelf.toFixed(1) : '…'}`)),
    h('div', { class: 'card' }, h('h3', {}, 'So sánh trước – sau theo chủ đề'), h('p', { class: 'muted' }, 'Tỉ lệ học sinh chọn cách xử lý an toàn trong bài Nhập học (trước) và Tốt nghiệp (sau).'),
      h('div', { class: 'legend' }, h('span', { class: 'lg pre' }, 'Trước'), h('span', { class: 'lg post' }, 'Sau')),
      h('table', { class: 'tbl' }, TOPICS.map((t, i) => h('tr', {}, h('td', {}, t),
        h('td', { class: 'w50' }, bar(st.preTopic[i], 'pre'), bar(st.postTopic[i], 'post')),
        h('td', {}, st.preTopic[i] == null ? '–' : pct(st.preTopic[i]), ' → ', st.postTopic[i] == null ? '–' : pct(st.postTopic[i])))))),
    h('div', { class: 'card' }, h('h3', {}, 'Theo từng thử thách'),
      h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'Thử thách'), h('th', {}, 'Hoàn thành'), h('th', {}, 'Chọn an toàn ngay lần đầu'), h('th', {}, 'Khiên TB')),
        st.per.map(p => h('tr', {}, h('td', {}, p.c.icon, ' ', p.c.title), h('td', {}, bar(p.completion), ` ${p.done}`), h('td', {}, bar(p.safe), ` ${pct(p.safe)}`), h('td', {}, p.shields ? p.shields.toFixed(1) : '–'))))),
    h('div', { class: 'card' }, h('h3', {}, '⚠️ Lựa chọn chưa an toàn phổ biến nhất'), h('p', { class: 'muted' }, 'Gợi ý những nội dung cần giảng thêm trên lớp.'),
      common.length ? h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'Thử thách'), h('th', {}, 'Lựa chọn'), h('th', {}, 'Số HS')),
        common.map(x => h('tr', {}, h('td', {}, x.c.icon, ' ', x.c.no), h('td', {}, x.text), h('td', {}, `${x.n}/${x.total}`)))) : h('p', {}, 'Chưa có dữ liệu.')),
    h('div', { class: 'actions' }, h('button', { class: 'btn', onclick: () => exportCSV(cls, students) }, '⬇️ Xuất Excel (CSV)')));
}
const kpi = (label, val) => h('div', { class: 'kpi' }, h('b', {}, val), h('small', {}, label));

function exportCSV(cls, students) {
  const head = ['Mã HS', 'Họ tên', 'Biệt danh', 'Số thử thách đã xong', 'Tổng lượt chơi','Nhập học: số lần an toàn /8', 'Tốt nghiệp: số lần an toàn /8', 'Tự tin trước (1-4)', 'Tự tin sau (1-4)',
    ...CHALLENGES.flatMap(c => [`TT${c.no} khiên`, `TT${c.no} % an toàn lần đầu`, `TT${c.no} phút`, `TT${c.no} lượt chơi`]),
    ...TOPICS.map((t, i) => `Trước: ${t}`), ...TOPICS.map(t => `Sau: ${t}`)];
  const rows = students.map(s => {
    const R = s.results || {};
    const lv = (kind, t) => R[kind]?.answers?.find(a => a.t === t)?.level ?? '';
    const p = progressOf(s);
    return [s.code, s.name || '', s.profile ? nickname(s.profile) : '', p.done, p.plays,
      R.pre ? Math.round(safeShare(R.pre.answers) * 8) : '', R.post ? Math.round(safeShare(R.post.answers) * 8) : '',
      R.pre ? mean(R.pre.self).toFixed(2) : '', R.post ? mean(R.post.self).toFixed(2) : '',
      ...CHALLENGES.flatMap(c => R[c.id] ? [R[c.id].shields, Math.round(R[c.id].safeRate * 100), (R[c.id].ms / 60000).toFixed(1), s.plays?.[c.id] || 1] : ['', '', '', '']),
      ...TOPICS.map((_, t) => lv('pre', t)), ...TOPICS.map((_, t) => lv('post', t))];
  });
  const csv = '﻿' + [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const a = h('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: `lop-${cls.code}.csv` });
  document.body.append(a); a.click(); a.remove();
}

function tabCreations(cls, students, creations) {
  if (!creations.length) return h('div', { class: 'card' }, h('p', { class: 'muted' }, 'Chưa có tình huống nào được gửi.'));
  return h('div', {}, creations.map(c => h('div', { class: `card creation ${c.status}` },
    h('div', { class: 'cr-head' }, h('span', { class: 'big-emo' }, c.char), h('div', {}, h('b', {}, `${c.charName} · ${c.setting}`), h('small', {}, `Tác giả: ${c.nickname} (mã ${c.by})`))),
    h('p', {}, '💬 “', c.message, '”'),
    h('ul', {}, c.options.map(o => h('li', {}, o.safe ? '🌟 ' : '• ', o.text))),
    h('p', {}, '📌 Quy tắc: ', c.rule),
    h('div', { class: 'actions' },
      h('span', { class: `status ${c.status}` }, { pending: '⏳ Chờ duyệt', approved: '✅ Đã duyệt', rejected: '✏️ Cần sửa' }[c.status]),
      c.status !== 'approved' && h('button', { class: 'btn sm', onclick: async () => { await store.setCreationStatus(cls.code, c.id, 'approved'); classView(cls.code, 'sanpham'); } }, '✅ Duyệt'),
      c.status !== 'rejected' && h('button', { class: 'btn ghost sm', onclick: async () => { await store.setCreationStatus(cls.code, c.id, 'rejected'); classView(cls.code, 'sanpham'); } }, '✏️ Trả lại')))));
}

function tabShield(cls, students, creations) {
  const rules = creations.filter(c => c.status === 'approved').map(c => ({ rule: c.rule, by: c.nickname, avatar: c.avatar }));
  return h('div', {},
    h('div', { class: 'class-shield', id: 'print-area' },
      h('h2', {}, `🛡️ LÁ CHẮN AN TOÀN CỦA LỚP ${cls.name.toUpperCase()}`),
      rules.length ? h('div', { class: 'cs-rules' }, rules.map(r => h('div', { class: 'cs-rule' }, h('span', {}, '⭐'), r.rule, h('small', {}, ` – ${r.by}`))))
        : h('p', {}, 'Lá chắn sẽ hiện các quy tắc từ những tình huống sáng tác đã được duyệt.'),
      h('p', { class: 'muted' }, 'Học viện Anh hùng Mạng 🦉')),
    h('div', { class: 'actions no-print' }, h('button', { class: 'btn', onclick: () => window.print() }, '🖨️ In Lá chắn')));
}

function tabSettings(cls, students) {
  const maxOpen = h('select', {}, CHALLENGES.map(c => h('option', { value: c.no, selected: (cls.maxOpen ?? 8) === c.no }, `Mở đến thử thách ${c.no}`)));
  const free = h('input', { type: 'checkbox', checked: !!cls.freeOrder });
  const more = h('input', { type: 'number', min: 1, max: 20, value: 1 });
  return h('div', {},
    h('div', { class: 'card form no-print' }, h('h3', {}, '🔓 Điều khiển tiến độ'),
      h('label', {}, 'Học sinh được làm đến thử thách:'), maxOpen,
      h('label', { class: 'switch' }, free, h('span', {}, ' Cho chơi theo thứ tự tự do (không cần xong phòng trước)')),
      h('button', { class: 'btn', onclick: async () => { await store.updateClass(cls.code, { maxOpen: +maxOpen.value, freeOrder: free.checked }); toast('Đã lưu'); } }, 'Lưu')),
    h('div', { class: 'card no-print' }, h('h3', {}, '🎫 Phiếu mã học viên'), h('p', { class: 'muted' }, 'In và cắt phát cho từng học sinh. Phiếu chỉ có mã, không có tên.'),
      h('button', { class: 'btn', onclick: () => printCodes(cls, students) }, '🖨️ In phiếu mã'),
      h('div', { class: 'row' }, more, h('button', { class: 'btn ghost', onclick: async () => { await store.addStudents(cls.code, Math.min(20, Math.max(1, +more.value))); classView(cls.code, 'caidat'); } }, '➕ Thêm mã học viên'))),
    h('div', { class: 'card danger no-print' }, h('h3', {}, '🗑️ Dữ liệu'),
      h('p', {}, 'Khi kết thúc thực nghiệm, hãy xuất dữ liệu (tab Thống kê) rồi xóa dữ liệu của học sinh.'),
      h('button', { class: 'btn warn', onclick: async () => { if (confirm('Xóa toàn bộ kết quả, biệt danh và sản phẩm của lớp này? Mã học viên vẫn giữ lại.')) { await store.clearClassData(cls.code); toast('Đã xóa dữ liệu học sinh'); classView(cls.code, 'caidat'); } } }, 'Xóa dữ liệu học sinh'),
      h('button', { class: 'btn warn ghost', onclick: async () => { if (confirm('Xóa hẳn lớp này và mọi dữ liệu? Không thể hoàn tác.')) { await store.deleteClass(cls.code); location.hash = '#/teacher'; } } }, 'Xóa lớp')),
    h('div', { id: 'print-area', class: 'print-only' }));
}

function printCodes(cls, students) {
  const area = document.getElementById('print-area');
  area.replaceChildren(h('div', { class: 'code-cards' }, students.map(s => h('div', { class: 'code-card' },
    h('b', {}, '🛡️ Học viện Anh hùng Mạng'), h('div', {}, 'Mã lớp: ', h('span', { class: 'code' }, cls.code)), h('div', {}, 'Mã học viên: ', h('span', { class: 'code big' }, s.code))))));
  setTimeout(() => window.print(), 50);
}

// ---------------------------------------------------------------- So sánh các lớp
export async function compare() {
  mount(spinner());
  if (!(await requireTeacher())) return;
  const classes = await store.listClasses();
  const data = await Promise.all(classes.map(async c => ({ c, st: classStats(await store.listStudents(c.code)) })));
  mount(topbar('📊 So sánh các lớp', { back: '#/teacher' }),
    h('main', { class: 'wrap wide' },
      h('p', { class: 'muted' }, 'Tỉ lệ chọn cách xử lý an toàn trong bài khảo sát trước và sau. Lớp đối chứng có thể chỉ làm khảo sát mà không chơi 8 thử thách.'),
      h('div', { class: 'card scroll-x' }, h('table', { class: 'tbl' },
        h('tr', {}, h('th', {}, 'Lớp'), h('th', {}, 'Loại'), h('th', {}, 'HS (trước/sau)'), h('th', {}, 'An toàn trước'), h('th', {}, 'An toàn sau'), h('th', {}, 'Thay đổi'), h('th', {}, 'Tự tin trước → sau')),
        data.map(({ c, st }) => h('tr', {},
          h('td', {}, h('a', { href: `#/teacher/class/${c.code}/thongke` }, c.name)), h('td', {}, c.type === 'doichung' ? 'Đối chứng' : 'Thực nghiệm'),
          h('td', {}, `${st.nPre}/${st.nPost}`), h('td', {}, st.nPre ? pct(st.preSafe) : '–'), h('td', {}, st.nPost ? pct(st.postSafe) : '–'),
          h('td', {}, st.nPre && st.nPost ? h('b', { class: st.postSafe >= st.preSafe ? 'up' : 'down' }, `${st.postSafe >= st.preSafe ? '▲' : '▼'} ${Math.abs(Math.round((st.postSafe - st.preSafe) * 100))} điểm %`) : '–'),
          h('td', {}, st.nPre ? `${st.preSelf.toFixed(1)} → ${st.nPost ? st.postSelf.toFixed(1) : '…'}` : '–')))))));
}

// ---------------------------------------------------------------- Phiếu đồng ý của phụ huynh
export function consent() {
  mount(topbar('📝 Phiếu đồng ý', { back: '#/teacher' }),
    h('main', { class: 'wrap narrow' },
      h('div', { class: 'card letter', id: 'print-area' },
        h('h2', { class: 'center' }, 'PHIẾU ĐỒNG Ý CỦA CHA MẸ HỌC SINH'),
        h('p', { class: 'center' }, 'V/v cho học sinh tham gia trò chơi “Học viện Anh hùng Mạng”'),
        h('p', {}, 'Kính gửi Quý phụ huynh,'),
        h('p', {}, 'Nhà trường tổ chức cho học sinh lớp 5 tham gia trò chơi giáo dục “Học viện Anh hùng Mạng” nhằm rèn kỹ năng an toàn trên mạng: giữ bí mật thông tin cá nhân, nhận biết người lạ, lừa đảo, tin giả, ứng xử khi bị bình luận ác ý và sử dụng thiết bị hợp lý.'),
        h('p', {}, h('b', {}, 'Dữ liệu được thu thập: '), 'mã học viên do giáo viên cấp, biệt danh hoạt hình, các lựa chọn trong trò chơi và thời gian làm bài. ', h('b', {}, 'Không thu thập '), 'họ tên, ảnh, địa chỉ, số điện thoại của học sinh.'),
        h('p', {}, h('b', {}, 'Mục đích: '), 'theo dõi tiến bộ của học sinh và đánh giá hiệu quả bài học. Dữ liệu sẽ được xóa sau khi kết thúc chương trình.'),
        h('p', {}, 'Mọi tình huống trong trò chơi đều là giả lập; học sinh không trò chuyện với người thật hay AI trong trò chơi.'),
        h('p', {}, 'Tôi là: ……………………………………… cha/mẹ của học sinh lớp ……'),
        h('p', {}, '☐ Đồng ý     ☐ Không đồng ý   cho con tham gia và cho phép xử lý dữ liệu như trên.'),
        h('p', {}, 'Học sinh xác nhận đã được giải thích và đồng ý tham gia: ☐'),
        h('div', { class: 'sign-row' }, h('div', {}, 'Học sinh', h('br'), h('small', {}, '(ký)')), h('div', {}, 'Cha/mẹ học sinh', h('br'), h('small', {}, '(ký, ghi rõ họ tên)')))),
      h('div', { class: 'actions no-print' }, h('button', { class: 'btn', onclick: () => window.print() }, '🖨️ In phiếu'))));
}
