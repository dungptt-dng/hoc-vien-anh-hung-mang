// Lớp dữ liệu: một giao diện chung cho hai chế độ
//  - LocalStore: lưu trong localStorage, đồng bộ giữa các tab bằng BroadcastChannel (chạy thử)
//  - FirebaseStore: Firestore + Firebase Auth (trực tuyến, nhiều thiết bị)
import { firebaseConfig } from './config.js';

const rand = (n, chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') =>
  Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
  .toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'LOP';
export const studentCodes = n => Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0'));

// ---------------------------------------------------------------- Local
class LocalStore {
  constructor() {
    this.mode = 'local';
    this.key = 'hvahm:db';
    this.listeners = new Set();
    this.chan = 'BroadcastChannel' in window ? new BroadcastChannel('hvahm') : null;
    if (this.chan) this.chan.onmessage = () => this.emit();
    window.addEventListener('storage', e => { if (e.key === this.key) this.emit(); });
  }
  async init() {}
  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { classes: {}, rooms: {} }; }
    catch { return { classes: {}, rooms: {} }; }
  }
  write(fn) {
    const db = this.read();
    fn(db);
    localStorage.setItem(this.key, JSON.stringify(db));
    this.chan?.postMessage('changed');
    this.emit();
  }
  emit() { this.listeners.forEach(l => l()); }
  watch(get, cb) {
    let last;
    const run = () => {
      const v = get(this.read());
      const s = JSON.stringify(v);
      if (s !== last) { last = s; cb(v); }
    };
    this.listeners.add(run);
    run();
    return () => this.listeners.delete(run);
  }

  // Giáo viên
  async teacherSignIn() { localStorage.setItem('hvahm:teacher', 'local'); return { uid: 'local', email: 'Chế độ chạy thử' }; }
  async teacherRegister() { return this.teacherSignIn(); }
  async teacherSignOut() { localStorage.removeItem('hvahm:teacher'); }
  async currentTeacher() { return localStorage.getItem('hvahm:teacher') ? { uid: 'local', email: 'Chế độ chạy thử' } : null; }

  async createClass({ name, type, count }) {
    const code = `${slug(name)}-${rand(4)}`;
    const students = {};
    studentCodes(count).forEach(s => { students[s] = { code: s, results: {}, notebook: [], plays: {} }; });
    this.write(db => {
      db.classes[code] = { code, name, type, teacherUid: 'local', maxOpen: 8, freeOrder: false, createdAt: Date.now(), students, creations: {} };
    });
    return code;
  }
  async listClasses() {
    return Object.values(this.read().classes).map(({ students, creations, ...c }) => c).sort((a, b) => b.createdAt - a.createdAt);
  }
  async getClass(code) {
    const c = this.read().classes[code];
    if (!c) return null;
    const { students, creations, ...rest } = c;
    return rest;
  }
  async updateClass(code, patch) { this.write(db => Object.assign(db.classes[code], patch)); }
  async listStudents(code) { return Object.values(this.read().classes[code]?.students || {}); }
  async addStudents(code, n) {
    this.write(db => {
      const st = db.classes[code].students;
      const start = Object.keys(st).length;
      for (let i = 1; i <= n; i++) { const s = String(start + i).padStart(2, '0'); st[s] = { code: s, results: {}, notebook: [], plays: {} }; }
    });
  }
  async clearClassData(code) {
    this.write(db => {
      const c = db.classes[code];
      Object.values(c.students).forEach(s => { c.students[s.code] = { code: s.code, results: {}, notebook: [], plays: {} }; });
      c.creations = {};
    });
  }
  async deleteClass(code) { this.write(db => { delete db.classes[code]; }); }

  // Học sinh
  // Vào học viện chỉ bằng họ tên + lớp: tự tạo lớp và hồ sơ học viên trên máy này nếu chưa có
  async enterAcademy(name, className) {
    const code = slug(className);
    const sid = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'hv';
    this.write(db => {
      const c = db.classes[code] ??= { code, name: className, type: 'thucnghiem', teacherUid: 'local', maxOpen: 8, freeOrder: false, createdAt: Date.now(), students: {}, creations: {} };
      c.students[sid] ??= { code: sid, name, results: {}, notebook: [], plays: {} };
    });
    return { classCode: code, sid };
  }
  async getStudent(classCode, sid) { return this.read().classes[classCode]?.students?.[sid] || null; }
  async updateStudent(classCode, sid, patch) {
    this.write(db => {
      const s = db.classes[classCode].students[sid];
      for (const [k, v] of Object.entries(patch)) setPath(s, k, v);
    });
  }
  watchStudent(classCode, sid, cb) { return this.watch(db => db.classes[classCode]?.students?.[sid] || null, cb); }

  // Sản phẩm sáng tạo
  async addCreation(classCode, data) {
    const id = rand(8);
    this.write(db => { db.classes[classCode].creations[id] = { id, ...data, status: 'pending', at: Date.now() }; });
  }
  async listCreations(classCode) { return Object.values(this.read().classes[classCode]?.creations || {}).sort((a, b) => b.at - a.at); }
  async setCreationStatus(classCode, id, status) { this.write(db => { db.classes[classCode].creations[id].status = status; }); }

  // Phòng chơi trực tuyến
  async createRoom(data) {
    const pin = rand(6, '0123456789');
    this.write(db => { db.rooms[pin] = { pin, hostUid: 'local', phase: 'lobby', screen: 0, createdAt: Date.now(), ...data, players: {}, answers: {} }; });
    return pin;
  }
  async getRoom(pin) { const r = this.read().rooms[pin]; if (!r) return null; const { players, answers, ...rest } = r; return rest; }
  async updateRoom(pin, patch) { this.write(db => Object.assign(db.rooms[pin], patch)); }
  watchRoom(pin, cb) { return this.watch(db => { const r = db.rooms[pin]; if (!r) return null; const { players, answers, ...rest } = r; return rest; }, cb); }
  async joinRoom(pin, player) {
    const id = rand(10);
    this.write(db => { db.rooms[pin].players[id] = { id, ...player, joinedAt: Date.now() }; });
    return id;
  }
  async updatePlayer(pin, id, patch) { this.write(db => Object.assign(db.rooms[pin].players[id], patch)); }
  watchPlayers(pin, cb) { return this.watch(db => Object.values(db.rooms[pin]?.players || {}), cb); }
  async submitAnswer(pin, playerId, screen, data) {
    this.write(db => { db.rooms[pin].answers[`${playerId}_${screen}`] = { playerId, screen, ...data, at: Date.now() }; });
  }
  watchAnswers(pin, cb) { return this.watch(db => Object.values(db.rooms[pin]?.answers || {}), cb); }
}

function setPath(obj, path, val) {
  const parts = path.split('.');
  let o = obj;
  parts.slice(0, -1).forEach(p => { o[p] = o[p] ?? {}; o = o[p]; });
  o[parts.at(-1)] = val;
}

// ---------------------------------------------------------------- Firebase
const FB = 'https://www.gstatic.com/firebasejs/10.12.2';

class FirebaseStore {
  constructor() { this.mode = 'online'; }
  async init() {
    const [{ initializeApp }, auth, fs] = await Promise.all([
      import(`${FB}/firebase-app.js`), import(`${FB}/firebase-auth.js`), import(`${FB}/firebase-firestore.js`),
    ]);
    this.A = auth; this.F = fs;
    const app = initializeApp(firebaseConfig);
    this.auth = auth.getAuth(app);
    this.db = fs.getFirestore(app);
    await new Promise(res => { const u = auth.onAuthStateChanged(this.auth, () => { u(); res(); }); });
  }
  d(...p) { return this.F.doc(this.db, ...p); }
  c(...p) { return this.F.collection(this.db, ...p); }
  async ensureUser() { if (!this.auth.currentUser) await this.A.signInAnonymously(this.auth); return this.auth.currentUser; }
  isTeacherUser(u) { return u && !u.isAnonymous; }

  async teacherSignIn(email, pw) { const r = await this.A.signInWithEmailAndPassword(this.auth, email, pw); return r.user; }
  async teacherRegister(email, pw) { const r = await this.A.createUserWithEmailAndPassword(this.auth, email, pw); return r.user; }
  async teacherSignOut() { await this.A.signOut(this.auth); }
  async currentTeacher() { const u = this.auth.currentUser; return this.isTeacherUser(u) ? u : null; }

  async createClass({ name, type, count }) {
    const { setDoc, writeBatch } = this.F;
    const code = `${slug(name)}-${rand(4)}`;
    const uid = this.auth.currentUser.uid;
    await setDoc(this.d('classes', code), { code, name, type, teacherUid: uid, maxOpen: 8, freeOrder: false, createdAt: Date.now() });
    const b = writeBatch(this.db);
    studentCodes(count).forEach(s => b.set(this.d('classes', code, 'students', s), { code: s, results: {}, notebook: [], plays: {} }));
    await b.commit();
    return code;
  }
  async listClasses() {
    const { query, where, getDocs } = this.F;
    const snap = await getDocs(query(this.c('classes'), where('teacherUid', '==', this.auth.currentUser.uid)));
    return snap.docs.map(x => x.data()).sort((a, b) => b.createdAt - a.createdAt);
  }
  async getClass(code) { await this.ensureUser(); const s = await this.F.getDoc(this.d('classes', code)); return s.exists() ? s.data() : null; }
  async updateClass(code, patch) { await this.F.updateDoc(this.d('classes', code), patch); }
  async listStudents(code) { const s = await this.F.getDocs(this.c('classes', code, 'students')); return s.docs.map(x => x.data()); }
  async addStudents(code, n) {
    const start = (await this.listStudents(code)).length;
    const b = this.F.writeBatch(this.db);
    for (let i = 1; i <= n; i++) { const s = String(start + i).padStart(2, '0'); b.set(this.d('classes', code, 'students', s), { code: s, results: {}, notebook: [], plays: {} }); }
    await b.commit();
  }
  async clearClassData(code) {
    const b = this.F.writeBatch(this.db);
    (await this.listStudents(code)).forEach(s => b.set(this.d('classes', code, 'students', s.code), { code: s.code, results: {}, notebook: [], plays: {} }));
    (await this.F.getDocs(this.c('classes', code, 'creations'))).docs.forEach(x => b.delete(x.ref));
    await b.commit();
  }
  async deleteClass(code) {
    await this.clearClassData(code);
    const b = this.F.writeBatch(this.db);
    (await this.listStudents(code)).forEach(s => b.delete(this.d('classes', code, 'students', s.code)));
    b.delete(this.d('classes', code));
    await b.commit();
  }

  async getStudent(classCode, sid) { await this.ensureUser(); const s = await this.F.getDoc(this.d('classes', classCode, 'students', sid)); return s.exists() ? s.data() : null; }
  async updateStudent(classCode, sid, patch) { await this.F.updateDoc(this.d('classes', classCode, 'students', sid), patch); }
  watchStudent(classCode, sid, cb) { return this.F.onSnapshot(this.d('classes', classCode, 'students', sid), s => cb(s.exists() ? s.data() : null)); }

  async addCreation(classCode, data) {
    const ref = this.F.doc(this.c('classes', classCode, 'creations'));
    await this.F.setDoc(ref, { id: ref.id, ...data, status: 'pending', at: Date.now() });
  }
  async listCreations(classCode) { const s = await this.F.getDocs(this.c('classes', classCode, 'creations')); return s.docs.map(x => x.data()).sort((a, b) => b.at - a.at); }
  async setCreationStatus(classCode, id, status) { await this.F.updateDoc(this.d('classes', classCode, 'creations', id), { status }); }

  async createRoom(data) {
    const pin = rand(6, '0123456789');
    await this.F.setDoc(this.d('rooms', pin), { pin, hostUid: this.auth.currentUser.uid, phase: 'lobby', screen: 0, createdAt: Date.now(), ...data });
    return pin;
  }
  async getRoom(pin) { await this.ensureUser(); const s = await this.F.getDoc(this.d('rooms', pin)); return s.exists() ? s.data() : null; }
  async updateRoom(pin, patch) { await this.F.updateDoc(this.d('rooms', pin), patch); }
  watchRoom(pin, cb) { return this.F.onSnapshot(this.d('rooms', pin), s => cb(s.exists() ? s.data() : null)); }
  async joinRoom(pin, player) {
    await this.ensureUser();
    const ref = this.F.doc(this.c('rooms', pin, 'players'));
    await this.F.setDoc(ref, { id: ref.id, uid: this.auth.currentUser.uid, ...player, joinedAt: Date.now() });
    return ref.id;
  }
  async updatePlayer(pin, id, patch) { await this.F.updateDoc(this.d('rooms', pin, 'players', id), patch); }
  watchPlayers(pin, cb) { return this.F.onSnapshot(this.c('rooms', pin, 'players'), s => cb(s.docs.map(x => x.data()))); }
  async submitAnswer(pin, playerId, screen, data) {
    await this.F.setDoc(this.d('rooms', pin, 'answers', `${playerId}_${screen}`), { playerId, screen, ...data, at: Date.now() });
  }
  watchAnswers(pin, cb) { return this.F.onSnapshot(this.c('rooms', pin, 'answers'), s => cb(s.docs.map(x => x.data()))); }
}

export const store = firebaseConfig.apiKey ? new FirebaseStore() : new LocalStore();
