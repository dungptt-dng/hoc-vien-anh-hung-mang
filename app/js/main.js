// Điều hướng theo #/đường-dẫn
import { store } from './store.js';
import { h, mount, mentor, spinner } from './ui.js';
import * as S from './student.js';
import * as L from './live.js';
import * as T from './teacher.js';
import { registerSW } from './pwa.js';

const routes = [
  [/^#?\/?$/, () => S.welcome()],
  [/^#\/login$/, () => S.login()],
  [/^#\/profile$/, () => S.profile()],
  [/^#\/map$/, () => S.map()],
  [/^#\/c\/(c\d)$/, m => S.challenge(m[1])],
  [/^#\/survey\/(pre|post)$/, m => S.survey(m[1])],
  [/^#\/graduate$/, () => S.graduate()],
  [/^#\/notebook$/, () => S.notebook()],
  [/^#\/studio$/, () => S.studio()],
  [/^#\/library$/, () => S.library()],
  [/^#\/join$/, () => L.join()],
  [/^#\/play\/(\d{6})$/, m => L.play(m[1])],
  [/^#\/host-new$/, () => L.hostNew()],
  [/^#\/host\/(\d{6})$/, m => L.host(m[1])],
  [/^#\/teacher$/, () => T.teacherHome()],
  [/^#\/teacher\/compare$/, () => T.compare()],
  [/^#\/teacher\/consent$/, () => T.consent()],
  [/^#\/teacher\/class\/([A-Z0-9-]+)(?:\/(\w+))?$/, m => T.classView(m[1], m[2])],
];

async function route() {
  const hash = location.hash || '#/';
  for (const [re, fn] of routes) {
    const m = hash.match(re);
    if (m) {
      try { await fn(m); }
      catch (ex) {
        console.error(ex);
        mount(h('main', { class: 'wrap narrow' }, mentor('Ôi, có lỗi rồi! Em thử tải lại trang hoặc nhờ thầy cô giúp nhé.'), h('p', { class: 'error' }, ex.message), h('div', { class: 'actions' }, h('a', { class: 'btn', href: '#/' }, 'Về trang đầu'))));
      }
      return;
    }
  }
  location.hash = '#/';
}

(async () => {
  mount(spinner('Đang mở Học viện…'));
  try { await store.init(); }
  catch (ex) {
    console.error(ex);
    mount(h('main', { class: 'wrap narrow' }, mentor('Không kết nối được máy chủ. Hãy kiểm tra mạng Internet rồi tải lại trang.'), h('p', { class: 'error' }, ex.message)));
    return;
  }
  window.addEventListener('hashchange', route);
  route();
  registerSW();
})();
