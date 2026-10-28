// Ghi lịch sử đăng nhập của học viên vào Google Form (câu trả lời tự vào Google Trang tính của giáo viên).
// Mất mạng hoặc chưa dán link Form thì giữ lại trên máy, có mạng sẽ gửi bù.
import { loginFormLink } from './config.js';

const QKEY = 'hvahm:logq', LAST = 'hvahm:lastlog';
const GAP = 30 * 60 * 1000; // mở lại app trong vòng 30 phút thì không ghi thêm dòng mới

function target() {
  try {
    const u = new URL(loginFormLink);
    const ids = [...u.searchParams.keys()].filter(k => k.startsWith('entry.'));
    if (ids.length < 2) return null;
    return { action: u.origin + u.pathname.replace(/\/viewform$/, '/formResponse'), ids };
  } catch { return null; }
}

function device() {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? 'iPhone'
    : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iPad'
    : /Android/.test(ua) ? (/Mobile/.test(ua) ? 'Điện thoại Android' : 'Máy tính bảng Android')
    : /CrOS/.test(ua) ? 'Chromebook' : /Windows/.test(ua) ? 'Máy tính Windows' : /Macintosh/.test(ua) ? 'Máy Mac' : 'Thiết bị khác';
  const br = /Zalo/i.test(ua) ? 'Zalo' : /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome'
    : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return br ? `${os} · ${br}` : os;
}

const readQ = () => { try { return JSON.parse(localStorage.getItem(QKEY)) || []; } catch { return []; } };
const saveQ = q => localStorage.setItem(QKEY, JSON.stringify(q.slice(-500)));

let busy = false;
export async function flushLogs() {
  const t = target();
  if (!t || busy || !navigator.onLine) return;
  busy = true;
  try {
    while (readQ().length) {
      const body = new URLSearchParams();
      // Form chỉ có Họ tên, Lớp thì gửi 2 ô đầu (thời gian đã có ở cột Dấu thời gian của Trang tính)
      t.ids.forEach((id, i) => body.append(id, readQ()[0][i] ?? ''));
      await fetch(t.action, { method: 'POST', mode: 'no-cors', body });
      saveQ(readQ().slice(1));
    }
  } catch { /* mất mạng giữa chừng: lần sau gửi tiếp */ }
  busy = false;
}

// force = true khi học viên vừa bấm đăng nhập; false khi mở lại app đã đăng nhập sẵn
export function logLogin(name, cls, force = false) {
  const who = `${cls}|${name}`;
  let last = null;
  try { last = JSON.parse(localStorage.getItem(LAST)); } catch {}
  if (!force && last?.who === who && Date.now() - last.at < GAP) return flushLogs();
  localStorage.setItem(LAST, JSON.stringify({ who, at: Date.now() }));
  saveQ([...readQ(), [name, cls, device(), new Date().toLocaleString('vi-VN')]]);
  flushLogs();
}

window.addEventListener('online', flushLogs);
