// Trình chơi một thử thách (chế độ tự học): Bối cảnh → Tình huống → Hệ quả → Giải thích → Quy tắc
import { h, mount, fill, mentor, phone, speakBtn, sound, shields, LEVEL, shuffle, confetti, topbar } from './ui.js';

export function scoreOf(first) {
  if (!first?.length) return { avg: 0, shields: 0, safeRate: 0 };
  const avg = first.reduce((s, x) => s + x.level, 0) / first.length;
  return {
    avg,
    shields: avg >= 2.75 ? 3 : avg >= 2 ? 2 : 1,
    safeRate: first.filter(x => x.level === 3).length / first.length,
  };
}

export function sortLevel(correct, total) {
  const r = correct / total;
  return r === 1 ? 3 : r >= 0.6 ? 2 : 1;
}

export function playChallenge(ch, ctx, { onDone, onExit }) {
  const f = t => fill(t, ctx);
  const started = Date.now();
  const first = [];
  let wrongStreak = 0;
  let plan = null;

  const frame = (...kids) => mount(
    topbar(`${ch.icon} ${ch.room}`, { back: '#/map', backLabel: 'Bản đồ' }),
    h('main', { class: 'wrap play', style: { '--accent': ch.color } }, kids));

  const progress = i => h('div', { class: 'progress' },
    ch.screens.map((_, k) => h('span', { class: k < i ? 'done' : k === i ? 'now' : '' })));

  function intro() {
    frame(
      h('div', { class: 'room-hero' },
        h('div', { class: 'rays-wrap' }, h('div', { class: 'rays' }), h('div', { class: 'room-icon' }, ch.icon)),
        h('div', { class: 'ribbon' }, `Thử thách ${ch.no}`), h('h2', {}, ch.room), h('p', { class: 'muted' }, ch.title)),
      mentor(f(ch.intro)),
      h('div', { class: 'actions' }, h('button', { class: 'btn big', onclick: () => screen(0) }, 'Bắt đầu ▶')));
  }

  function screen(i) {
    if (i >= ch.screens.length) return wrapUp();
    const s = ch.screens[i];
    if (s.type === 'choice') return choiceScreen(s, i);
    if (s.type === 'sort') return sortScreen(s, i);
    if (s.type === 'plan') return planScreen(s, i);
  }

  function choiceScreen(s, i, retry = false) {
    const order = shuffle(s.choices.map((c, idx) => ({ ...c, idx })));
    const hintBox = h('div', { class: 'hint', hidden: !(retry && wrongStreak >= 2) }, '🦉 Gợi ý: ', f(s.hint));
    const panel = h('div', { class: 'result-panel', hidden: true });
    const choicesEl = h('div', { class: 'choices' }, order.map(c =>
      h('button', { class: 'choice', onclick: e => pick(c, e.currentTarget) }, f(c.text))));

    function pick(c, btn) {
      choicesEl.querySelectorAll('button').forEach(b => { b.disabled = true; });
      btn.classList.add('picked', LEVEL[c.level].cls);
      if (!retry) first.push({ s: i, level: c.level, choice: c.idx });
      wrongStreak = c.level === 3 ? 0 : wrongStreak + 1;
      sound(c.level === 3 ? 'good' : c.level === 2 ? 'ok' : 'bad');
      const lv = LEVEL[c.level];
      panel.hidden = false;
      panel.className = `result-panel ${lv.cls}`;
      panel.replaceChildren(
        h('div', { class: 'result-head' }, h('span', { class: 'result-ic' }, lv.icon), h('span', { class: 'lv-tag' }, lv.label)),
        h('p', { class: 'consequence' }, f(c.result), speakBtn(f(c.result) + '. ' + f(s.explain))),
        h('div', { class: 'explain' }, h('b', {}, '🦉 Cú Thông Thái: '), f(s.explain)),
        h('div', { class: 'actions' },
          c.level < 3 && h('button', { class: 'btn ghost', onclick: () => choiceScreen(s, i, true) }, '🔁 Thử lại'),
          h('button', { class: 'btn', onclick: () => screen(i + 1) }, 'Tiếp tục ▶')));
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    frame(
      progress(i),
      s.station && h('div', { class: 'station' }, s.station),
      h('div', { class: 'stage' },
        phone(s, ctx),
        h('div', { class: 'side' },
          h('div', { class: 'ask' }, f(s.ask), speakBtn(() => [...(s.blocks || []).map(b => f(b.text || b.title || '')), f(s.ask), ...order.map(c => f(c.text))].join('. '))),
          choicesEl,
          h('button', { class: 'btn ghost sm', onclick: () => { hintBox.hidden = false; } }, '🦉 Hỏi Cú Thông Thái'),
          hintBox, panel)));
  }

  function sortScreen(s, i) {
    const pickd = new Array(s.items.length).fill(null);
    const items = shuffle(s.items.map((it, idx) => ({ ...it, idx })));
    const check = h('button', { class: 'btn', disabled: true, onclick: grade }, 'Kiểm tra ✔');
    const panel = h('div', { class: 'result-panel', hidden: true });
    const rows = items.map(it => {
      const btns = s.baskets.map((bk, bi) => h('button', {
        class: 'basket-btn', onclick: e => {
          pickd[it.idx] = bi;
          e.currentTarget.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('on'));
          e.currentTarget.classList.add('on');
          sound('tap');
          check.disabled = pickd.some(x => x === null);
        },
      }, bk));
      return h('div', { class: 'sort-row', 'data-idx': it.idx }, h('span', { class: 'sort-item' }, it.text), h('span', { class: 'sort-btns' }, btns));
    });

    function grade() {
      let ok = 0;
      rows.forEach(r => {
        const idx = +r.dataset.idx;
        const right = pickd[idx] === s.items[idx].answer;
        if (right) ok++;
        r.classList.add(right ? 'right' : 'wrong');
        r.querySelectorAll('button').forEach(b => { b.disabled = true; });
        if (!right) r.append(h('small', { class: 'fix' }, '➜ ', s.baskets[s.items[idx].answer]));
      });
      const level = sortLevel(ok, s.items.length);
      first.push({ s: i, level, correct: ok, total: s.items.length });
      sound(level === 3 ? 'good' : 'ok');
      check.hidden = true;
      panel.hidden = false;
      panel.className = `result-panel ${LEVEL[level].cls}`;
      panel.replaceChildren(
        h('div', { class: 'lv-tag' }, `Đúng ${ok}/${s.items.length}`),
        h('div', { class: 'explain' }, h('b', {}, '🦉 Cú Thông Thái: '), s.explain, speakBtn(s.explain)),
        h('div', { class: 'actions' }, h('button', { class: 'btn', onclick: () => screen(i + 1) }, 'Tiếp tục ▶')));
    }

    frame(progress(i),
      h('div', { class: 'card' }, h('h3', {}, s.title, speakBtn(s.title)), h('p', { class: 'muted' }, 'Bấm vào giỏ phù hợp cho từng thẻ.'),
        h('div', { class: 'sort' }, rows), h('div', { class: 'actions' }, check), panel));
  }

  function planScreen(s, i) {
    let minutes = null;
    const acts = new Set();
    const save = h('button', { class: 'btn', disabled: true, onclick: () => { plan = { minutes, activities: [...acts] }; sound('good'); screen(i + 1); } }, 'Lưu kế hoạch 💾');
    const upd = () => { save.disabled = !(minutes && acts.size); };
    frame(progress(i),
      h('div', { class: 'card' }, h('h3', {}, '📝 ', s.title),
        h('p', {}, 'Mỗi ngày em dùng thiết bị để giải trí tối đa:'),
        h('div', { class: 'chips' }, s.minutes.map(m => h('button', { class: 'chip', onclick: e => { minutes = m; e.currentTarget.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); upd(); } }, `${m} phút`))),
        h('p', {}, 'Khi hết giờ, em sẽ làm (chọn nhiều):'),
        h('div', { class: 'chips' }, s.activities.map(a => h('button', { class: 'chip', onclick: e => { acts.has(a) ? acts.delete(a) : acts.add(a); e.currentTarget.classList.toggle('on'); upd(); } }, a))),
        h('div', { class: 'actions' }, save)));
  }

  function wrapUp() {
    const chosen = new Set();
    const done = h('button', { class: 'btn big', disabled: true, onclick: () => finish([...chosen]) }, 'Lưu vào Sổ tay Anh hùng 📒');
    frame(
      h('div', { class: 'card' }, h('h3', {}, '🚩 Dấu hiệu cần nhớ'), h('ul', { class: 'signs' }, ch.signs.map(x => h('li', {}, x))), speakBtn(ch.signs.join('. '))),
      h('div', { class: 'card' }, h('h3', {}, '✍️ Rút ra quy tắc của em'), h('p', { class: 'muted' }, 'Chọn những quy tắc em muốn ghi vào Sổ tay Anh hùng:'),
        h('div', { class: 'rules' }, ch.rules.map(r => h('button', { class: 'rule', onclick: e => { chosen.has(r) ? chosen.delete(r) : chosen.add(r); e.currentTarget.classList.toggle('on'); done.disabled = !chosen.size; sound('tap'); } }, '📌 ', r))),
        h('div', { class: 'actions' }, done)));
  }

  function finish(rules) {
    const sc = scoreOf(first);
    const result = { first, shields: sc.shields, safeRate: sc.safeRate, avg: sc.avg, ms: Date.now() - started, at: Date.now() };
    Promise.resolve(onDone(result, rules, plan)).then(() => {
      sound('win'); confetti();
      frame(
        h('div', { class: 'badge-win' },
          h('div', { class: 'rays-wrap big' }, h('div', { class: 'rays gold' }), h('div', { class: 'medal', style: { '--c': ch.color } }, h('span', { class: 'badge-icon' }, ch.icon))),
          h('h2', {}, 'Huy hiệu: ', ch.badge),
          shields(sc.shields),
          h('p', {}, sc.shields === 3 ? 'Xuất sắc! Em xử lý rất an toàn.' : sc.shields === 2 ? 'Tốt lắm! Em đã gần như hoàn hảo.' : 'Em đã hoàn thành! Chơi lại để luyện thêm nhé.'),
          h('p', { class: 'muted' }, `Mảnh lá chắn số ${ch.no} đã được ghép vào Lá chắn Anh hùng!`)),
        h('div', { class: 'actions' },
          h('button', { class: 'btn ghost', onclick: () => playChallenge(ch, ctx, { onDone, onExit }) }, '🔁 Chơi lại'),
          h('button', { class: 'btn big', onclick: onExit }, 'Về bản đồ 🗺️')));
    });
  }

  intro();
}
