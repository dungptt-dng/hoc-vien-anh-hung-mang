// Cài app lên điện thoại / máy tính bảng / laptop (Progressive Web App)
import { h, toast } from './ui.js';

let deferred = null;
const buttons = new Set();
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferred = e;
  buttons.forEach(b => { b.hidden = false; });
});
window.addEventListener('appinstalled', () => { deferred = null; buttons.forEach(b => { b.hidden = true; }); toast('Đã cài app! Tìm biểu tượng 🛡️ trên màn hình nhé.'); });

export function registerSW() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

export function installButton() {
  if (isStandalone()) return null;
  const b = h('button', {
    class: 'btn ghost', hidden: !deferred && !isIOS(),
    onclick: async () => {
      if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; b.hidden = true; return; }
      showIOSHelp();
    },
  }, '📲 Cài app lên thiết bị');
  buttons.add(b);
  return b;
}

function showIOSHelp() {
  const box = h('div', { class: 'modal', onclick: e => { if (e.target === box) box.remove(); } },
    h('div', { class: 'card' },
      h('h3', {}, '📲 Cài app trên iPhone / iPad'),
      h('ol', {}, h('li', {}, 'Mở trang này bằng Safari.'), h('li', {}, 'Bấm nút Chia sẻ ⬆️ ở thanh dưới.'), h('li', {}, 'Chọn “Thêm vào MH chính”.'), h('li', {}, 'Bấm “Thêm”.')),
      h('div', { class: 'actions' }, h('button', { class: 'btn', onclick: () => box.remove() }, 'Đã hiểu'))));
  document.body.append(box);
}
