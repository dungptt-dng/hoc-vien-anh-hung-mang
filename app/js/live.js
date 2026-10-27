// Chế độ Lớp học trực tuyến: giáo viên mở phòng, nhiều học sinh vào bằng mã PIN và chơi cùng lúc
import { store } from './store.js';
import { AVATARS, ADJECTIVES, COLORS, CHALLENGES, TEAMS } from './content.js';
import { h, mount, fill, mentor, phone, speakBtn, sound, toast, confetti, topbar, avatarEl, shuffle, spinner, LEVEL } from './ui.js';
import { session, nickname } from './student.js';

const liveScreens = ch => ch.screens.filter(s => s.type === 'choice');
const pKey = pin => `hvahm:live:${pin}`;
const teamOf = id => TEAMS.find(t => t.id === id);

// Điểm đội = trung bình điểm mỗi thành viên (công bằng khi các đội đông ít khác nhau)
function teamScores(players, answers) {
  return TEAMS.map(t => {
    const members = players.filter(p => p.team === t.id);
    const pts = answers.filter(a => members.some(m => m.id === a.playerId)).reduce((s, a) => s + a.level, 0);
    return { ...t, members: members.length, score: members.length ? Math.round((pts / members.length) * 10) / 10 : 0 };
  }).filter(t => t.members > 0).sort((a, b) => b.score - a.score);
}
const teamBoard = ts => h('div', { class: 'teamboard' }, ts.map((t, i) =>
  h('div', { class: 'team-row', style: { '--c': t.color } }, h('span', {}, i === 0 ? '🏆' : t.emoji), h('b', {}, t.name), h('small', {}, `${t.members} bạn`), h('span', { class: 'pts' }, `${t.score} điểm`))));

// ================================================================ Học sinh vào phòng
export function join() {
  const err = h('p', { class: 'error', hidden: true });
  const pin = h('input', { id: 'pin', inputmode: 'numeric', maxlength: 6, placeholder: '6 chữ số', autocomplete: 'off', class: 'pin-input' });
  async function next(e) {
    e.preventDefault();
    err.hidden = true;
    const p = pin.value.trim();
    const room = await store.getRoom(p);
    if (!room) { err.textContent = 'Không tìm thấy phòng. Em kiểm tra lại mã PIN nhé!'; err.hidden = false; sound('bad'); return; }
    if (room.phase === 'end') { err.textContent = 'Phòng này đã kết thúc.'; err.hidden = false; return; }
    const saved = sessionStorage.getItem(pKey(p));
    if (saved) { location.hash = `#/play/${p}`; return; }
    chooseIdentity(p, room);
  }
  mount(topbar('🎮 Vào phòng chơi', { back: '#/' }),
    h('main', { class: 'wrap narrow' },
      mentor('Nhập mã PIN thầy cô chiếu trên bảng để cùng chơi với cả lớp nhé!'),
      h('form', { class: 'card form center', onsubmit: next }, h('label', { for: 'pin' }, '🔢 Mã PIN phòng'), pin, err, h('button', { class: 'btn big', type: 'submit' }, 'Tiếp tục ▶'))));
}

async function chooseIdentity(pin, room) {
  const s = session.get();
  let me = null;
  if (s) me = await store.getStudent(s.classCode, s.sid).catch(() => null);
  const p = me?.profile ? { ...me.profile } : { avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)].id, adj: ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)], color: COLORS[Math.floor(Math.random() * COLORS.length)] };
  let team = null;
  const preview = h('div', { class: 'preview' });
  const draw = () => preview.replaceChildren(avatarEl(p, 'lg'), h('h3', {}, nickname(p)));
  draw();
  const go = h('button', { class: 'btn big', disabled: room.teamMode, onclick: enter }, 'Vào phòng 🚀');
  async function enter() {
    go.disabled = true;
    const id = await store.joinRoom(pin, { nickname: nickname(p), avatar: p.avatar, color: p.color, team });
    sessionStorage.setItem(pKey(pin), id);
    sound('good');
    location.hash = `#/play/${pin}`;
  }
  mount(topbar('🎮 Vào phòng chơi', { back: '#/join' }),
    h('main', { class: 'wrap narrow' },
      h('div', { class: 'card center' }, preview,
        !me?.profile && h('div', { class: 'pick-grid small' }, AVATARS.map(a => h('button', { class: `pick ${p.avatar === a.id ? 'on' : ''}`, onclick: e => { p.avatar = a.id; e.currentTarget.parentElement.querySelectorAll('.pick').forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); draw(); } }, h('span', { class: 'emo' }, a.emoji)))),
        !me?.profile && h('div', { class: 'chips' }, ADJECTIVES.map(a => h('button', { class: `chip ${p.adj === a ? 'on' : ''}`, onclick: e => { p.adj = a; e.currentTarget.parentElement.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); draw(); } }, a)))),
      room.teamMode && h('div', { class: 'card' }, h('h3', {}, 'Chọn đội của em'), h('div', { class: 'teams' }, TEAMS.map(t => h('button', {
        class: 'team-btn', style: { '--c': t.color }, onclick: e => { team = t.id; e.currentTarget.parentElement.querySelectorAll('.team-btn').forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); go.disabled = false; sound('tap'); },
      }, t.emoji, ' ', t.name)))),
      h('div', { class: 'actions' }, go)));
}

// ================================================================ Học sinh trong phòng
export function play(pin) {
  const playerId = sessionStorage.getItem(pKey(pin));
  if (!playerId) { location.hash = '#/join'; return; }
  const mine = {};
  let room = null, myInfo = null, players = [], answers = [];
  let shownKey = '';
  mount(spinner('Đang vào phòng…'));
  const offs = [
    store.watchRoom(pin, r => { room = r; render(); }),
    store.watchPlayers(pin, ps => { players = ps; myInfo = ps.find(p => p.id === playerId); if (room?.phase === 'lobby' || room?.phase === 'end') render(true); }),
    store.watchAnswers(pin, as => { answers = as; as.filter(a => a.playerId === playerId).forEach(a => { mine[a.screen] = a; }); if (room?.phase === 'end') render(true); }),
  ];
  const stop = () => offs.forEach(o => o && o());
  window.addEventListener('hashchange', stop, { once: true });

  function render(force) {
    if (!room) { mount(topbar('🎮 Phòng chơi', { back: '#/' }), h('main', { class: 'wrap narrow' }, mentor('Phòng đã đóng. Cảm ơn em đã tham gia!'))); return; }
    const key = `${room.phase}:${room.screen}`;
    if (key === shownKey && !force) return;
    shownKey = key;
    const ch = CHALLENGES.find(c => c.id === room.challengeId);
    const screens = liveScreens(ch);
    const s = screens[room.screen];
    const ctx = { name: myInfo ? myInfo.nickname.split(' ').slice(0, -2).join(' ') || myInfo.nickname : 'Học viên', avatar: '🙂' };
    if (myInfo) { const a = AVATARS.find(x => x.id === myInfo.avatar); if (a) { ctx.name = a.name; ctx.avatar = a.emoji; } }
    const head = topbar(`${ch.icon} ${ch.room}`, { back: '#/', backLabel: 'Rời phòng', right: myInfo && h('span', { class: 'who' }, avatarEl(myInfo, 'sm'), myInfo.team && h('span', {}, teamOf(myInfo.team)?.emoji)) });

    if (room.phase === 'lobby') {
      return mount(head, h('main', { class: 'wrap narrow center' },
        h('div', { class: 'waiting' }, h('div', { class: 'spin' }, '🦉'), h('h2', {}, 'Em đã vào phòng!'), h('p', {}, 'Chờ thầy cô bắt đầu nhé…'), h('p', { class: 'muted' }, `${players.length} bạn đã vào phòng`)),
        myInfo && h('div', { class: 'card' }, avatarEl(myInfo, 'lg'), h('h3', {}, myInfo.nickname), myInfo.team && h('p', {}, teamOf(myInfo.team).emoji, ' ', teamOf(myInfo.team).name))));
    }
    if (room.phase === 'end') {
      confetti();
      const ts = room.teamMode ? teamScores(players, answers) : [];
      const myAns = Object.values(mine);
      const safe = myAns.filter(a => a.level === 3).length;
      return mount(head, h('main', { class: 'wrap narrow' },
        mentor(`Hoàn thành! Em đã chọn cách an toàn ${safe}/${screens.length} lần. Cảm ơn em đã chơi cùng lớp!`),
        room.teamMode && h('div', { class: 'card' }, h('h3', {}, '🏆 Bảng điểm các đội'), teamBoard(ts)),
        h('div', { class: 'actions' }, h('a', { class: 'btn', href: '#/' }, 'Về trang đầu'))));
    }
    if (room.phase === 'play') {
      if (mine[room.screen]) return waitPanel(head, s, ctx);
      const order = shuffle(s.choices.map((c, idx) => ({ ...c, idx })));
      return mount(head, h('main', { class: 'wrap play', style: { '--accent': ch.color } },
        s.station && h('div', { class: 'station' }, s.station),
        h('div', { class: 'stage' }, phone(s, ctx),
          h('div', { class: 'side' }, h('div', { class: 'ask' }, fill(s.ask, ctx), speakBtn(fill(s.ask, ctx) + '. ' + order.map(c => fill(c.text, ctx)).join('. '))),
            h('div', { class: 'choices' }, order.map(c => h('button', {
              class: 'choice', onclick: async e => {
                e.currentTarget.parentElement.querySelectorAll('button').forEach(b => { b.disabled = true; });
                const a = { choice: c.idx, level: c.level, team: myInfo?.team || null };
                mine[room.screen] = a;
                sound('tap');
                await store.submitAnswer(pin, playerId, room.screen, a);
                waitPanel(head, s, ctx);
              },
            }, fill(c.text, ctx))))))));
    }
    if (room.phase === 'reveal') {
      const a = mine[room.screen];
      const c = a ? s.choices[a.choice] : null;
      const lv = c ? LEVEL[c.level] : null;
      if (c) sound(c.level === 3 ? 'good' : c.level === 2 ? 'ok' : 'bad');
      return mount(head, h('main', { class: 'wrap narrow' },
        h('div', { class: `result-panel ${lv ? lv.cls : ''}` },
          c ? [h('div', { class: 'lv-tag' }, lv.icon, ' ', lv.label), h('p', {}, 'Em đã chọn: ', h('b', {}, fill(c.text, ctx))), h('p', { class: 'consequence' }, fill(c.result, ctx))]
            : h('p', {}, '⏰ Em chưa chọn kịp ở lượt này.'),
          h('div', { class: 'explain' }, h('b', {}, '🦉 Cú Thông Thái: '), fill(s.explain, ctx), speakBtn(fill(s.explain, ctx)))),
        h('p', { class: 'muted center' }, 'Nhìn lên bảng để cùng thảo luận nhé!')));
    }
  }
  function waitPanel(head, s, ctx) {
    mount(head, h('main', { class: 'wrap narrow center' }, h('div', { class: 'waiting' }, h('div', { class: 'spin' }, '✅'), h('h2', {}, 'Em đã chọn xong!'), h('p', {}, 'Chờ các bạn khác và thầy cô nhé…'))));
  }
}

// ================================================================ Giáo viên mở phòng
export async function hostNew() {
  const t = await store.currentTeacher();
  if (!t) { location.hash = '#/teacher'; return; }
  let chId = 'c1', teamMode = false;
  const go = h('button', {
    class: 'btn big', onclick: async () => {
      go.disabled = true;
      const pin = await store.createRoom({ challengeId: chId, teamMode });
      location.hash = `#/host/${pin}`;
    },
  }, 'Mở phòng 🚀');
  mount(topbar('🎮 Mở phòng chơi trực tuyến', { back: '#/teacher' }),
    h('main', { class: 'wrap narrow' },
      h('div', { class: 'card' }, h('h3', {}, '1. Chọn thử thách'), h('div', { class: 'pick-list' }, CHALLENGES.map(c => h('button', {
        class: `pick-row ${c.id === chId ? 'on' : ''}`, style: { '--c': c.color },
        onclick: e => { chId = c.id; e.currentTarget.parentElement.querySelectorAll('.pick-row').forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); },
      }, h('span', {}, c.icon), h('b', {}, `${c.no}. ${c.title}`), h('small', {}, `${liveScreens(c).length} tình huống`))))),
      h('div', { class: 'card' }, h('h3', {}, '2. Hình thức'),
        h('label', { class: 'switch' }, h('input', { type: 'checkbox', onchange: e => { teamMode = e.target.checked; } }), h('span', {}, ' Thi theo đội (Đỏ, Xanh, Vàng, Lục). Chỉ xếp hạng đội, không xếp hạng từng học sinh.'))),
      h('div', { class: 'actions' }, go)));
}

export function host(pin) {
  let room = null, players = [], answers = [];
  const set = patch => store.updateRoom(pin, patch);
  const joinUrl = `${location.origin}${location.pathname}#/join`;
  mount(spinner());
  const offs = [
    store.watchRoom(pin, r => { room = r; render(); }),
    store.watchPlayers(pin, p => { players = p; render(); }),
    store.watchAnswers(pin, a => { answers = a; render(); }),
  ];
  window.addEventListener('hashchange', () => offs.forEach(o => o && o()), { once: true });

  function render() {
    if (!room) return mount(topbar('Phòng chơi', { back: '#/teacher' }), h('main', { class: 'wrap' }, mentor('Không tìm thấy phòng này.')));
    const ch = CHALLENGES.find(c => c.id === room.challengeId);
    const screens = liveScreens(ch);
    const s = screens[room.screen];
    const cur = answers.filter(a => a.screen === room.screen);
    const head = topbar(`${ch.icon} Phòng ${pin}`, { back: '#/teacher', backLabel: 'Trang GV' });
    const ctx = { name: 'Học viên', avatar: '🙂' };

    if (room.phase === 'lobby') {
      return mount(head, h('main', { class: 'wrap host' },
        h('div', { class: 'pin-box' }, h('p', {}, 'Vào trang ', h('b', {}, joinUrl), ' và nhập mã PIN:'), h('div', { class: 'pin' }, pin.replace(/(\d{3})(\d{3})/, '$1 $2')), h('p', { class: 'muted' }, `Thử thách ${ch.no}: ${ch.title}${room.teamMode ? ' · Thi theo đội' : ''}`)),
        h('div', { class: 'card' }, h('h3', {}, `👥 ${players.length} học sinh đã vào`),
          h('div', { class: 'players' }, players.map(p => h('div', { class: 'player' }, avatarEl(p, 'md'), h('small', {}, p.nickname), p.team && h('span', {}, teamOf(p.team)?.emoji))))),
        h('div', { class: 'actions' }, h('button', { class: 'btn big', disabled: !players.length, onclick: () => set({ phase: 'play', screen: 0 }) }, 'Bắt đầu ▶'))));
    }

    if (room.phase === 'play' || room.phase === 'reveal') {
      const reveal = room.phase === 'reveal';
      const counts = s.choices.map((_, i) => cur.filter(a => a.choice === i).length);
      const max = Math.max(1, ...counts);
      const last = room.screen >= screens.length - 1;
      return mount(head, h('main', { class: 'wrap host' },
        h('div', { class: 'progress' }, screens.map((_, k) => h('span', { class: k < room.screen ? 'done' : k === room.screen ? 'now' : '' }))),
        s.station && h('div', { class: 'station' }, s.station),
        h('div', { class: 'stage' }, phone(s, ctx),
          h('div', { class: 'side' },
            h('div', { class: 'ask' }, fill(s.ask, ctx)),
            h('div', { class: 'bars' }, s.choices.map((c, i) => h('div', { class: `bar-row ${reveal ? LEVEL[c.level].cls : ''}` },
              h('div', { class: 'bar-label' }, reveal && h('span', {}, LEVEL[c.level].icon, ' '), fill(c.text, ctx)),
              h('div', { class: 'bar' }, h('span', { style: { width: reveal ? `${(counts[i] / max) * 100}%` : '0%' } })),
              h('b', {}, reveal ? counts[i] : '?')))),
            h('p', { class: 'answered' }, `✋ Đã chọn: ${cur.length}/${players.length}`),
            reveal && h('div', { class: 'explain' }, h('b', {}, '🦉 '), fill(s.explain, ctx)),
            reveal && room.teamMode && teamBoard(teamScores(players, answers)),
            h('div', { class: 'actions' },
              !reveal && h('button', { class: 'btn big', onclick: () => set({ phase: 'reveal' }) }, 'Xem kết quả 📊'),
              reveal && !last && h('button', { class: 'btn big', onclick: () => set({ phase: 'play', screen: room.screen + 1 }) }, 'Tình huống tiếp ▶'),
              reveal && last && h('button', { class: 'btn big', onclick: () => set({ phase: 'end' }) }, 'Kết thúc 🏁'))))));
    }

    if (room.phase === 'end') {
      const rows = screens.map((sc, i) => {
        const as = answers.filter(a => a.screen === i);
        return { ask: sc.station || `Tình huống ${i + 1}`, n: as.length, safe: as.length ? Math.round(as.filter(a => a.level === 3).length / as.length * 100) : 0 };
      });
      return mount(head, h('main', { class: 'wrap host' },
        mentor('Buổi chơi đã kết thúc! Dưới đây là tỉ lệ học sinh chọn cách an toàn ở mỗi tình huống.'),
        h('div', { class: 'card' }, h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'Tình huống'), h('th', {}, 'Số lượt chọn'), h('th', {}, 'Chọn an toàn')),
          rows.map(r => h('tr', {}, h('td', {}, r.ask), h('td', {}, r.n), h('td', {}, h('div', { class: 'mini-bar' }, h('span', { style: { width: r.safe + '%' } })), ` ${r.safe}%`))))),
        room.teamMode && h('div', { class: 'card' }, h('h3', {}, '🏆 Bảng điểm các đội'), teamBoard(teamScores(players, answers))),
        h('div', { class: 'actions' }, h('a', { class: 'btn', href: '#/host-new' }, '🎮 Mở phòng mới'), h('a', { class: 'btn ghost', href: '#/teacher' }, 'Về trang giáo viên'))));
    }
  }
}
