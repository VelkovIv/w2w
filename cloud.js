// Firebase authentication (Google) + Firestore sync of the shared list.
// Runs only when firebase-config.js is filled in and the app is served over http(s).
import { firebaseConfig, HOUSEHOLD, ALLOWED_EMAILS } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const enabled = !!firebaseConfig.apiKey && /^https?:$/.test(location.protocol);
window.W2W_CLOUD = enabled;

const $ = s => document.querySelector(s);
const app = () => window.W2W;

const AUTH_ERRORS = {
  'auth/unauthorized-domain': 'Този адрес не е разрешен във Firebase (Authentication → Settings → Authorized domains).',
  'auth/network-request-failed': 'Няма интернет връзка.',
  'auth/too-many-requests': 'Твърде много опити — опитайте по-късно.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
  'permission-denied': 'Нямате достъп.'
};

function gate(mode, email = '') {
  $('#auth-gate').hidden = mode === 'off';
  ['loading', 'login', 'denied'].forEach(m => { $('#auth-' + m).hidden = m !== mode; });
  $('#auth-denied-email').textContent = email;
  $('#auth-error').textContent = '';
}

function showError(err) {
  const msg = AUTH_ERRORS[err?.code];
  $('#auth-error').textContent = msg ?? (err?.message || 'Грешка при вход');
}

// Stable key order so local and Firestore copies compare equal
const stable = o => JSON.stringify(o, Object.keys(o).sort());

async function initCloud() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-firestore.js')
  ]);
  const fb = initializeApp(firebaseConfig);
  const auth = A.getAuth(fb);
  const db = F.initializeFirestore(fb, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  const itemsCol = F.collection(db, 'households', HOUSEHOLD, 'items');
  const settingsRef = F.doc(db, 'households', HOUSEHOLD, 'meta', 'settings');

  let synced = new Map();
  let unsub = null;
  let timer = null;

  $('#auth-google').onclick = async () => {
    const provider = new A.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await A.signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
        await A.signInWithRedirect(auth, provider);
      } else {
        showError(err);
      }
    }
  };

  const doSignOut = async () => {
    stopSync();
    app().clearLocal();
    await A.signOut(auth);
    location.reload();
  };
  $('#auth-signout').onclick = doSignOut;
  $('#account-signout').onclick = doSignOut;

  function stopSync() {
    unsub?.();
    unsub = null;
    clearTimeout(timer);
    app().onLocalSave = null;
    app().onKeysChanged = null;
  }

  async function pushChanges() {
    const items = app().items();
    const ids = new Set();
    const ops = [];
    for (const it of items) {
      ids.add(it.imdbID);
      const json = stable(it);
      if (synced.get(it.imdbID) !== json) {
        ops.push(['set', it.imdbID, JSON.parse(json)]);
        synced.set(it.imdbID, json);
      }
    }
    for (const id of [...synced.keys()]) {
      if (!ids.has(id)) { ops.push(['del', id]); synced.delete(id); }
    }
    for (let i = 0; i < ops.length; i += 400) {
      const batch = F.writeBatch(db);
      ops.slice(i, i + 400).forEach(([op, id, data]) =>
        op === 'set' ? batch.set(F.doc(itemsCol, id), data) : batch.delete(F.doc(itemsCol, id)));
      await batch.commit();
    }
  }

  function scheduleSync() {
    clearTimeout(timer);
    timer = setTimeout(() => pushChanges().catch(err => app().toast('Грешка при синхронизация: ' + err.message, 'error')), 400);
  }

  function onRemote(snap, first) {
    const remote = snap.docs.map(d => d.data());
    const local = app().items();
    if (first) {
      if (!remote.length && local.length) {
        // first login on a device with an existing local list: upload it
        synced = new Map();
        scheduleSync();
        return;
      }
      synced = new Map(remote.map(i => [i.imdbID, stable(i)]));
      app().applyRemote(remote);
      return;
    }
    // keep local edits/deletions that are not pushed yet
    const dirty = new Map(local.filter(i => synced.get(i.imdbID) !== stable(i)).map(i => [i.imdbID, i]));
    const deleted = new Set([...synced.keys()].filter(id => !local.some(i => i.imdbID === id)));
    synced = new Map(remote.map(i => [i.imdbID, stable(i)]));
    const merged = remote.filter(i => !deleted.has(i.imdbID)).map(i => dirty.get(i.imdbID) || i);
    dirty.forEach((v, k) => { if (!synced.has(k)) merged.push(v); });
    app().applyRemote(merged);
    if (dirty.size || deleted.size) scheduleSync();
  }

  async function startSync() {
    const s = await F.getDoc(settingsRef);
    if (s.exists()) {
      app().setKeys(s.data());
    } else {
      const k = Object.fromEntries(Object.entries(app().keys()).filter(([, v]) => v));
      if (Object.keys(k).length) await F.setDoc(settingsRef, k, { merge: true });
    }
    app().onKeysChanged = () => {
      const k = Object.fromEntries(Object.entries(app().keys()).filter(([, v]) => v));
      F.setDoc(settingsRef, k, { merge: true }).catch(() => {});
    };
    app().onLocalSave = scheduleSync;

    let first = true;
    await new Promise((resolve, reject) => {
      unsub = F.onSnapshot(itemsCol, snap => {
        onRemote(snap, first);
        if (first) { first = false; resolve(); }
      }, err => {
        if (first) reject(err);
        else app().toast('Синхронизацията спря: ' + err.message, 'error');
      });
    });
  }

  A.onAuthStateChanged(auth, async user => {
    if (!user) { stopSync(); gate('login'); return; }
    const allowed = ALLOWED_EMAILS.map(e => e.toLowerCase());
    if (allowed.length && !allowed.includes((user.email || '').toLowerCase())) { gate('denied', user.email); return; }
    gate('loading');
    try {
      await startSync();
      $('#account-email').textContent = user.email;
      $('#account-box').hidden = false;
      gate('off');
      app().start();
    } catch (err) {
      stopSync();
      if (err.code === 'permission-denied') gate('denied', user.email);
      else { gate('login'); showError(err); }
    }
  });
}

if (enabled) {
  gate('loading');
  try {
    await initCloud();
  } catch (err) {
    console.error(err);
    gate('off');
    app().start();
    app().toast('Облакът е недостъпен — работите локално', 'warn');
  }
}
