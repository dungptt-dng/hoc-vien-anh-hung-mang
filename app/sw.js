// Service worker: lưu sẵn giao diện để app mở nhanh và chạy được khi mạng yếu.
// Đổi VERSION mỗi khi cập nhật app để thiết bị tải bản mới.
const VERSION = 'hvahm-v3';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/main.js', './js/config.js', './js/store.js', './js/content.js', './js/ui.js', './js/player.js', './js/art.js', './js/music.js',
  './js/student.js', './js/live.js', './js/teacher.js', './js/pwa.js', './js/log.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Dữ liệu Firebase luôn đi thẳng lên mạng
  if (/firestore|googleapis\.com\/identitytoolkit|securetoken/.test(url.href)) return;
  const sameOrigin = url.origin === location.origin;
  const cacheable = sameOrigin || /fonts\.(googleapis|gstatic)\.com|gstatic\.com\/firebasejs/.test(url.href);
  if (!cacheable) return;
  // Mạng trước (để luôn có bản mới), mất mạng thì dùng bản đã lưu
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))),
  );
});
