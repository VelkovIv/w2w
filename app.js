'use strict';

const LS_ITEMS = 'cinelist.items';
const LS_KEY = 'cinelist.apikey';
const LS_DISCOVER = 'cinelist.discover';
const LS_TMDB = 'cinelist.tmdbkey';
const LS_CRITERIA = 'cinelist.criteria';
const LS_IMDBMAP = 'cinelist.imdbmap';
const LS_TMDBMAP = 'cinelist.tmdbmap';
const LS_SIDEBAR = 'cinelist.sidebarPinned';

const LS_VIEWERS = 'cinelist.viewers';
// ids of the first three are their original Bulgarian names, so existing marks keep working
const DEFAULT_VIEWERS = [{ id: 'Мариана', name: 'Мариана', color: 0 }, { id: 'Ивайло', name: 'Ивайло', color: 1 }, { id: 'Семейно', name: 'Семейно', color: 2 }];
const MAX_VIEWERS = 8;
const VIEWER_COLORS = 7;

function cleanViewers(list) {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.filter(v => v && typeof v.id === 'string' && v.id && v.id.length <= 40 && typeof v.name === 'string' && v.name.trim() && !seen.has(v.id) && seen.add(v.id))
    .slice(0, MAX_VIEWERS)
    .map((v, i) => ({ id: v.id, name: v.name.trim().slice(0, 20), color: Number.isInteger(v.color) && v.color >= 0 && v.color < VIEWER_COLORS ? v.color : i % VIEWER_COLORS }));
  return out;
}
let VIEWERS_LIST = (() => { try { return cleanViewers(JSON.parse(localStorage.getItem(LS_VIEWERS))); } catch { return null; } })()
  || DEFAULT_VIEWERS.map(v => ({ ...v }));
const viewerIds = () => VIEWERS_LIST.map(v => v.id);
const viewerName = id => {
  const v = VIEWERS_LIST.find(x => x.id === id);
  if (!v) return id;
  // untouched default names get their English label
  return (LANG === 'en' && v.name === v.id && VIEWER_LABELS[v.id]?.en) || v.name;
};

// IMDb genre name -> TMDB genre ids (movie, tv); null = no TV equivalent
const GENRES = [
  ['Action', 28, 10759], ['Adventure', 12, 10759], ['Animation', 16, 16], ['Comedy', 35, 35],
  ['Crime', 80, 80], ['Documentary', 99, 99], ['Drama', 18, 18], ['Family', 10751, 10751],
  ['Fantasy', 14, 10765], ['History', 36, null], ['Horror', 27, null], ['Music', 10402, null],
  ['Mystery', 9648, 9648], ['Romance', 10749, null], ['Sci-Fi', 878, 10765], ['Thriller', 53, null],
  ['War', 10752, 10768], ['Western', 37, 37]
].map(([key, movie, tv]) => ({ key, movie, tv }));
const GENRE_IDS = Object.fromEntries(GENRES.map(g => [g.key, g]));

// q = TMDB company search term; networks = TMDB TV network ids (streaming originals)
const PLATFORMS = {
  'Netflix': { q: 'Netflix', networks: [213] },
  'Apple TV+': { q: 'Apple', networks: [2552] },
  'Disney+': { q: 'Disney', networks: [2739, 54] },
  'Amazon Prime Video': { q: 'Amazon', networks: [1024] },
  'HBO / Max': { q: 'HBO', networks: [49, 3186] },
  'Hulu': { q: 'Hulu', networks: [453] },
  'Paramount+': { q: 'Paramount', networks: [4330] },
  'Peacock': { q: 'Peacock', networks: [3353] },
  'BBC': { q: 'BBC', networks: [4] },
  'AMC': { q: 'AMC', networks: [174] },
  'FX': { q: 'FX', networks: [88] },
  'Marvel Studios': { q: 'Marvel' },
  'Lucasfilm': { q: 'Lucasfilm' },
  'Pixar': { q: 'Pixar' },
  'DreamWorks': { q: 'DreamWorks' },
  'Warner Bros.': { q: 'Warner Bros' },
  'Universal Pictures': { q: 'Universal' },
  'Sony Pictures': { q: 'Sony Pictures' },
  '20th Century Studios': { q: '20th Century' },
  'Studio Ghibli': { q: 'Studio Ghibli' },
  'A24': { q: 'A24' },
  'Legendary': { q: 'Legendary' }
};

// Pool of highly rated IMDb titles used for "discover" suggestions
const SEED = [
  'tt0111161', 'tt0068646', 'tt0468569', 'tt0071562', 'tt0050083', 'tt0108052', 'tt0167260',
  'tt0110912', 'tt0060196', 'tt0120737', 'tt0109830', 'tt0137523', 'tt1375666', 'tt0167261',
  'tt0080684', 'tt0133093', 'tt0099685', 'tt0073486', 'tt0114369', 'tt0816692', 'tt0102926',
  'tt0120815', 'tt0245429', 'tt0110413', 'tt0172495', 'tt0407887', 'tt0482571', 'tt6751668',
  'tt0209144', 'tt1853728', 'tt0903747', 'tt0944947', 'tt0185906', 'tt7366338', 'tt0306414',
  'tt0141842', 'tt2861424', 'tt2356777', 'tt4574334', 'tt0475784', 'tt1475582', 'tt0386676',
  'tt0108778', 'tt2442560', 'tt5753856'
];

const svg = p => `<svg viewBox="0 0 24 24">${p}</svg>`;
const ICON = {
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  like: svg('<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>'),
  dislike: svg('<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>'),
  trash: svg('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  undo: svg('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  play: svg('<path d="M7 4l13 8-13 8z"/>'),
  pause: svg('<path d="M8 5v14M16 5v14"/>')
};

const FLAGS = {
  bg: '<svg class="flag" viewBox="0 0 5 3" preserveAspectRatio="none"><rect width="5" height="1" fill="#fff"/><rect y="1" width="5" height="1" fill="#00966E"/><rect y="2" width="5" height="1" fill="#D62612"/></svg>',
  en: '<svg class="flag" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"><clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="uk-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#uk-s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-t)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>'
};

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isId = id => /^tt\d{6,10}$/.test(id);
const split = s => (!s || s === 'N/A') ? [] :
  [...new Set(s.split(',').map(x => x.replace(/\s*\(.*?\)/g, '').trim()).filter(Boolean))];
const ratingClass = r => r >= 8 ? 'high' : r >= 6.5 ? 'mid' : 'low';
const typeLabel = t2 => t2 === 'series' ? t('type.seriesOne') : t('type.movie');
const yearNum = y => parseInt(y, 10) || 0;
// errors that make further requests pointless (missing/invalid key, daily limit)
const fail = (msg, fatal = false) => Object.assign(new Error(msg), { fatal });

const defaultFilters = () => ({ q: '', actor: '', director: '', genre: '', type: '', progress: '', opinion: '', viewer: '', minRating: 0, sort: 'added' });
const defaultCriteria = () => ({ type: 'both', keyword: '', studio: '', genres: [], actor: '', director: '', minRating: 7, yearFrom: '', yearTo: '', lang: '', sort: 'popularity' });

function loadCriteria() {
  const c = { ...defaultCriteria(), ...load(LS_CRITERIA, {}) };
  c.genres = Array.isArray(c.genres) ? c.genres.filter(g => GENRE_IDS[g]) : [];
  return c;
}

const state = {
  items: load(LS_ITEMS, []),
  discover: load(LS_DISCOVER, {}),
  view: 'towatch',
  f: defaultFilters(),
  detailId: null,
  loadingDiscover: false,
  disc: { criteria: loadCriteria(), results: [], page: 0, more: false, loading: false, tvList: null, error: '' },
  recViewer: '',
  recType: '',
  recs: { items: [], loading: false, sig: '', error: '' }
};
const imdbMap = load(LS_IMDBMAP, {});
const tmdbFromImdb = load(LS_TMDBMAP, {});
const recCache = new Map();
const viewersOf = it => Array.isArray(it.viewers) ? it.viewers : [];
const isLiked = it => it.stars ? it.stars >= 3 : it.opinion === 'like';

const starClass = (v, n) => v >= n ? 'full' : v >= n - 0.5 ? 'half' : '';
const starsHtml = (it, cls = '') => {
  const id = esc(it.imdbID);
  const v = it.stars || 0;
  return `<div class="stars ${cls}" title="${t('stars.title')}" data-value="${v}">${[1, 2, 3, 4, 5].map(n =>
    `<span class="star ${starClass(v, n)}">★<button class="hit l" data-action="rate" data-id="${id}" data-value="${n - 0.5}" title="${t('stars.of', { n: n - 0.5 })}"></button><button class="hit r" data-action="rate" data-id="${id}" data-value="${n}" title="${t('stars.of', { n })}"></button></span>`).join('')}${v ? `<span class="stars-val">${v}</span>` : ''}</div>`;
};

function paintStars(box, v) {
  box.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('full', v >= i + 1);
    s.classList.toggle('half', v < i + 1 && v >= i + 0.5);
  });
}
document.addEventListener('mouseover', e => {
  const hit = e.target.closest('.stars .hit');
  if (hit) paintStars(hit.closest('.stars'), parseFloat(hit.dataset.value));
});
document.addEventListener('mouseout', e => {
  const box = e.target.closest('.stars');
  if (box && !box.contains(e.relatedTarget)) paintStars(box, parseFloat(box.dataset.value) || 0);
});

const statusInfo = it => it.status === 'watched' ? ['watched', t('status.watched')]
  : it.watching ? ['watching', t('status.watching')] : ['towatch', t('status.towatch')];
const statusTag = it => { const [cls, text] = statusInfo(it); return `<span class="tag status ${cls}">${text}</span>`; };

function seasonHtml(it) {
  if (it.type !== 'series' || !it.watching || it.status !== 'towatch') return '';
  const id = esc(it.imdbID);
  return `<div class="season">${t('season')}
    <button class="step" data-action="season" data-id="${id}" data-value="-1" title="${t('season.prev')}">−</button>
    <b>${it.season || 1}</b>${it.totalSeasons ? `<span class="muted">/ ${it.totalSeasons}</span>` : ''}
    <button class="step" data-action="season" data-id="${id}" data-value="1" title="${t('season.next')}">+</button></div>`;
}
const personCache = new Map();
const keywordCache = new Map();
const studioCache = new Map();

const saveLocal = () => localStorage.setItem(LS_ITEMS, JSON.stringify(state.items));
const save = () => { saveLocal(); window.W2W?.onLocalSave?.(); };
const byId = id => state.items.find(i => i.imdbID === id);

function toast(msg, type = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3000);
}

/* ---------- OMDb API ---------- */
async function omdb(params) {
  const key = localStorage.getItem(LS_KEY);
  if (!key) {
    openSettings();
    throw fail(t('err.noOmdb'), true);
  }
  const res = await fetch('https://www.omdbapi.com/?' + new URLSearchParams({ apikey: key, ...params }));
  const d = await res.json().catch(() => ({ Response: 'False', Error: 'HTTP ' + res.status }));
  if (d.Response === 'False') {
    const map = { 'Movie not found!': 'err.notFound', 'Invalid API key!': 'err.badKey', 'Too many results.': 'err.tooMany', 'Request limit reached!': 'err.limit' };
    throw fail(map[d.Error] ? t(map[d.Error]) : (d.Error || t('err.request')), d.Error === 'Invalid API key!' || d.Error === 'Request limit reached!');
  }
  return d;
}

function mapDetails(d) {
  const directors = split(d.Director);
  return {
    imdbID: d.imdbID,
    title: d.Title,
    year: d.Year,
    type: d.Type === 'series' ? 'series' : 'movie',
    genre: split(d.Genre),
    director: directors.length ? directors : split(d.Writer).slice(0, 3),
    actors: split(d.Actors),
    rating: d.imdbRating && d.imdbRating !== 'N/A' ? parseFloat(d.imdbRating) : null,
    votes: d.imdbVotes !== 'N/A' ? d.imdbVotes : '',
    poster: /^https:\/\//.test(d.Poster) ? d.Poster : '',
    plot: d.Plot !== 'N/A' ? d.Plot : '',
    runtime: d.Runtime !== 'N/A' ? d.Runtime : '',
    country: d.Country !== 'N/A' ? d.Country : '',
    totalSeasons: parseInt(d.totalSeasons, 10) || null
  };
}

async function addTitle(id, status = 'towatch') {
  if (byId(id)) { toast(t('toast.already'), 'warn'); return; }
  const details = state.discover[id] || mapDetails(await omdb({ i: id, plot: 'full' }));
  const item = {
    ...details, status, opinion: null, viewers: [], addedAt: Date.now(),
    watchedAt: status === 'watched' ? Date.now() : null,
    seenSeasons: status === 'watched' ? details.totalSeasons ?? null : null
  };
  state.items.unshift(item);
  save();
  render();
  toast(status === 'watched' ? t('toast.addedWatched', { title: item.title }) : t('toast.added', { title: item.title }));
}

/* ---------- Actions ---------- */
async function handleAction(action, el) {
  const id = el.dataset.id;
  const it = id ? byId(id) : null;

  switch (action) {
    case 'open': return openDetail(id);
    case 'open-add': openModal('add'); $('#add-input').focus(); return;
    case 'open-settings': return openSettings();
    case 'save-tmdb': return saveTmdbKey();
    case 'discover-search': return runDiscover(true);
    case 'discover-more': return runDiscover(false);
    case 'discover-reset': state.disc.criteria = defaultCriteria(); saveCriteria(); return syncCriteriaInputs();
    case 'toggle-genre': {
      const g = state.disc.criteria.genres, v = el.dataset.value;
      state.disc.criteria.genres = g.includes(v) ? g.filter(x => x !== v) : [...g, v];
      el.classList.toggle('on');
      return saveCriteria();
    }
    case 'discover-taste': {
      const top = topEntries(buildProfile().genre, 3).filter(g => GENRE_IDS[g]);
      state.disc.criteria = { ...defaultCriteria(), genres: top, minRating: 7.5 };
      saveCriteria();
      syncCriteriaInputs();
      state.view = 'discover';
      render();
      return runDiscover(true);
    }
    case 'add-all': {
      const list = state.disc.results.filter(i => !byId(i.imdbID));
      const now = Date.now();
      list.forEach((it, idx) => state.items.unshift({ ...it, status: 'towatch', opinion: null, viewers: [], addedAt: now - idx, watchedAt: null }));
      save();
      render();
      return toast(t('toast.addedMany', { n: list.length }));
    }
    case 'close-modal': return closeModals();
    case 'reset-filters': state.f = defaultFilters(); syncFilterInputs(); return renderList();
    case 'save-key': return saveKey();
    case 'export': return exportData();
    case 'import': return $('#import-file').click();
    case 'clear-all': return clearAll();
    case 'refresh-ratings': return refreshRatings(el);
    case 'load-discover': return loadDiscover();
    case 'load-recs': return loadRecs(true);
    case 'toggle-sidebar': {
      const pinned = document.body.classList.toggle('sb-pinned');
      localStorage.setItem(LS_SIDEBAR, pinned ? '1' : '0');
      return;
    }
    case 'toggle-filters': return $('.sticky-head').classList.toggle('expanded');
    case 'toggle-lang': return setLang(LANG === 'bg' ? 'en' : 'bg');
    case 'viewer-add': return addViewer();
    case 'viewer-remove': return removeViewer(el.dataset.value);
    case 'check-seasons': return checkNewSeasons(true);
    case 'rec-viewer':
      state.recViewer = viewerIds().includes(el.dataset.value) ? el.dataset.value : '';
      return render();
    case 'rec-type':
      state.recType = ['movie', 'series'].includes(el.dataset.value) ? el.dataset.value : '';
      return render();

    case 'filter': {
      closeModals();
      if (state.view === 'recommend' || state.view === 'discover') state.view = 'towatch';
      state.f = { ...defaultFilters(), sort: state.f.sort, [el.dataset.key]: el.dataset.value };
      syncFilterInputs();
      return render();
    }

    case 'add':
    case 'add-watched': {
      if (!isId(id)) return;
      el.disabled = true;
      try {
        await addTitle(id, action === 'add' ? 'towatch' : 'watched');
        const row = el.closest('.result-actions');
        if (row) row.innerHTML = statusTag(byId(id));
        if (state.detailId === id) openDetail(id);
      } catch (err) {
        toast(err.message, 'error');
        el.disabled = false;
      }
      return;
    }
  }

  if (!it) return;
  switch (action) {
    case 'start':
      it.watching = !it.watching;
      if (it.watching && it.type === 'series' && !it.season) it.season = 1;
      break;
    case 'season': {
      const n = (it.season || 1) + (el.dataset.value === '-1' ? -1 : 1);
      it.season = Math.max(1, it.totalSeasons ? Math.min(it.totalSeasons, n) : n);
      break;
    }
    case 'watched':
      Object.assign(it, { status: 'watched', watching: false, newSeason: false, watchedAt: Date.now(), seenSeasons: it.totalSeasons || it.season || null });
      toast(t('toast.finished', { title: it.title }));
      break;
    case 'unwatch':
      Object.assign(it, { status: 'towatch', watchedAt: null, newSeason: false });
      toast(t('toast.movedBack', { title: it.title }));
      break;
    case 'rate': {
      const n = parseFloat(el.dataset.value);
      if (!(n >= 0.5 && n <= 5 && Number.isInteger(n * 2))) return;
      if (it.stars === n) {
        it.stars = null;
        it.opinion = null;
      } else {
        it.stars = n;
        it.opinion = n >= 3 ? 'like' : 'dislike';
      }
      break;
    }
    case 'toggle-viewer': {
      const v = el.dataset.value;
      if (!viewerIds().includes(v)) return;
      const cur = viewersOf(it);
      it.viewers = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
      break;
    }
    case 'remove':
      if (!confirm(t('confirm.remove', { title: it.title }))) return;
      state.items = state.items.filter(i => i !== it);
      closeModals();
      break;
    default: return;
  }
  save();
  render();
  if (state.detailId === id && !$('#modal-detail').hidden) openDetail(id);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el) { e.preventDefault(); handleAction(el.dataset.action, el); return; }
  if (e.target.classList.contains('modal')) closeModals();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModals();
  if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
    e.preventDefault();
    $('#f-q').focus();
  }
});

$$('.nav-btn[data-view]').forEach(b => b.addEventListener('click', () => {
  state.view = b.dataset.view;
  if (state.view !== 'watched') { state.f.opinion = ''; state.f.viewer = ''; }
  if (state.view !== 'towatch') state.f.progress = '';
  syncFilterInputs();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));

/* ---------- Modals ---------- */
function openModal(name) {
  $('#modal-' + name).hidden = false;
  document.body.classList.add('noscroll');
}
function closeModals() {
  $$('.modal').forEach(m => m.hidden = true);
  document.body.classList.remove('noscroll');
  state.detailId = null;
}

/* ---------- Filters ---------- */
const FILTER_INPUTS = { q: '#f-q', actor: '#f-actor', director: '#f-director', genre: '#f-genre', type: '#f-type', progress: '#f-progress', opinion: '#f-opinion', viewer: '#f-viewer', minRating: '#f-rating', sort: '#f-sort' };

Object.entries(FILTER_INPUTS).forEach(([key, sel]) => {
  $(sel).addEventListener('input', e => {
    state.f[key] = key === 'minRating' ? parseFloat(e.target.value) : e.target.value;
    $('#f-rating-val').textContent = state.f.minRating;
    renderList();
  });
});

function syncFilterInputs() {
  Object.entries(FILTER_INPUTS).forEach(([key, sel]) => { $(sel).value = state.f[key]; });
  $('#f-rating-val').textContent = state.f.minRating;
}

function filtered() {
  const f = state.f;
  const has = (arr, q) => arr.some(x => x.toLowerCase().includes(q));
  const q = f.q.trim().toLowerCase();
  const actor = f.actor.trim().toLowerCase();
  const director = f.director.trim().toLowerCase();

  const list = state.items.filter(i =>
    i.status === state.view &&
    (!q || i.title.toLowerCase().includes(q) || (i.comment || '').toLowerCase().includes(q) || has(i.actors, q) || has(i.director, q) || has(i.genre.map(tg), q) || has(i.genre, q)) &&
    (!actor || has(i.actors, actor)) &&
    (!director || has(i.director, director)) &&
    (!f.genre || i.genre.includes(f.genre)) &&
    (!f.type || i.type === f.type) &&
    (!f.minRating || (i.rating ?? 0) >= f.minRating) &&
    (!f.opinion || (f.opinion === 'none' ? !i.opinion : i.opinion === f.opinion)) &&
    (!f.viewer || (f.viewer === 'none' ? !viewersOf(i).length : viewersOf(i).includes(f.viewer))) &&
    (!f.progress || (f.progress === 'watching' ? i.watching : f.progress === 'new' ? i.newSeason : !i.watching))
  );

  const sorters = {
    added: (a, b) => (b.watchedAt || b.addedAt) - (a.watchedAt || a.addedAt),
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    stars: (a, b) => (b.stars ?? 0) - (a.stars ?? 0) || (b.rating ?? 0) - (a.rating ?? 0),
    year: (a, b) => yearNum(b.year) - yearNum(a.year),
    title: (a, b) => a.title.localeCompare(b.title)
  };
  const sorter = sorters[f.sort] || sorters.added;
  // in progress / new season first
  const pri = i => state.view === 'towatch' ? (i.watching ? 2 : i.newSeason ? 1 : 0) : 0;
  return list.sort((a, b) => pri(b) - pri(a) || sorter(a, b));
}

function populateFilterOptions() {
  const genres = new Set(), actors = new Set(), directors = new Set();
  state.items.forEach(i => {
    i.genre.forEach(g => genres.add(g));
    i.actors.forEach(a => actors.add(a));
    i.director.forEach(d => directors.add(d));
  });
  const sel = $('#f-genre');
  sel.innerHTML = `<option value="">${t('f.allGenres')}</option>` +
    [...genres].sort((a, b) => tg(a).localeCompare(tg(b))).map(g => `<option value="${esc(g)}">${esc(tg(g))}</option>`).join('');
  sel.value = state.f.genre;
  $('#dl-actors').innerHTML = [...actors].sort().map(a => `<option value="${esc(a)}">`).join('');
  $('#dl-directors').innerHTML = [...directors].sort().map(d => `<option value="${esc(d)}">`).join('');
}

/* ---------- Rendering ---------- */
function render() {
  $('#view-title').textContent = t('view.' + state.view);
  $('#view-sub').textContent = t('view.' + state.view + '.sub');
  $$('.nav-btn[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
  $('#filters').hidden = state.view === 'recommend' || state.view === 'discover';
  $('#discover-panel').hidden = state.view !== 'discover';
  $('.sticky-head').classList.toggle('no-filters', state.view === 'recommend');
  updateFilterDot();
  $('#f-opinion').hidden = state.view !== 'watched';
  $('#f-viewer').hidden = state.view !== 'watched';
  $('#f-progress').hidden = state.view !== 'towatch';
  renderStats();
  if (state.view === 'recommend') renderRecommend();
  else if (state.view === 'discover') renderDiscover();
  else { populateFilterOptions(); renderList(); }
}

function renderStats() {
  const towatch = state.items.filter(i => i.status === 'towatch').length;
  const watched = state.items.filter(i => i.status === 'watched');
  const liked = state.items.filter(i => i.opinion === 'like').length;
  const disliked = state.items.filter(i => i.opinion === 'dislike').length;
  $('#count-towatch').textContent = towatch;
  $('#count-watched').textContent = watched.length;
  const pct = liked + disliked ? Math.round(liked / (liked + disliked) * 100) : 0;
  const watching = state.items.filter(i => i.status === 'towatch' && i.watching).length;
  $('#stats').innerHTML = `
    <fieldset class="stat"><legend>${t('stats.watching')}</legend><b>${watching}</b></fieldset>
    <fieldset class="stat"><legend>${t('stats.total')}</legend><b>${state.items.length}</b></fieldset>
    <fieldset class="stat"><legend>${t('stats.liked')}</legend><b>${liked} / ${disliked}</b>
      ${liked + disliked ? `<div class="bar"><i style="width:${pct}%"></i></div>` : ''}</fieldset>`;
}

function emptyState(title, text, withButton = true) {
  return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(text)}</p>
    ${withButton ? `<button class="btn primary" data-action="open-add">${ICON.plus} ${t('addTitle')}</button>` : ''}</div>`;
}

function renderList() {
  updateFilterDot();
  const c = $('#content');
  const total = state.items.filter(i => i.status === state.view).length;
  const list = filtered();
  $('#result-count').textContent = total ? t('shown', { n: list.length, total }) : '';

  if (!localStorage.getItem(LS_KEY) && !state.items.length) {
    c.innerHTML = `<div class="empty"><h3>${t('welcome.h')}</h3>
      <p>${t('welcome.p')}</p>
      <button class="btn primary" data-action="open-settings">${t('welcome.btn')}</button></div>`;
  } else if (!total) {
    c.innerHTML = state.view === 'towatch'
      ? emptyState(t('empty.towatch.h'), t('empty.towatch.p'))
      : emptyState(t('empty.watched.h'), t('empty.watched.p'), false);
  } else if (!list.length) {
    c.innerHTML = `<div class="empty"><h3>${t('noResults.h')}</h3><p>${t('noResults.p')}</p>
      <button class="btn ghost" data-action="reset-filters">${t('clearFilters')}</button></div>`;
  } else {
    c.innerHTML = `<div class="grid">${list.map(i => card(i)).join('')}</div>`;
  }
}

function posterHtml(it) {
  return it.poster
    ? `<img src="${esc(it.poster)}" alt="${esc(it.title)}" loading="lazy">`
    : `<div class="noposter">${esc(it.title.charAt(0))}</div>`;
}

function card(it, { discover = false, reasons = [] } = {}) {
  const own = discover ? byId(it.imdbID) : null;
  if (own) it = own;
  const id = esc(it.imdbID);
  const rating = it.rating != null ? `<span class="badge rating ${ratingClass(it.rating)}">★ ${it.rating.toFixed(1)}</span>` : '';
  const op = it.stars ? `<span class="badge op stars-badge ${it.opinion}" title="${t('stars.title')}">${it.stars}★</span>`
    : it.opinion ? `<span class="badge op ${it.opinion}">${ICON[it.opinion]}</span>` : '';
  const people = it.director.length ? `${t('dir.short')} ${it.director.join(', ')}` : it.actors.slice(0, 2).join(', ');
  const progress = own ? `<span class="badge progress ${statusInfo(own)[0]}">${statusInfo(own)[1]}</span>`
    : discover || it.status !== 'towatch' ? ''
    : it.watching ? `<span class="badge progress">${t('badge.watching')}</span>`
    : it.newSeason ? `<span class="badge progress new">${t('badge.new')}</span>` : '';

  const actions = own ? statusTag(own)
    : discover
    ? `<button class="btn sm primary" data-action="add" data-id="${id}">${ICON.plus} ${t('btn.toWatch')}</button>
       <button class="btn sm ghost" data-action="add-watched" data-id="${id}">${t('btn.watchedIt')}</button>`
    : `${it.status === 'towatch'
         ? `<button class="icon-btn play ${it.watching ? 'on' : ''}" data-action="start" data-id="${id}" title="${it.watching ? t('btn.pauseTitle') : t('btn.startTitle')}">${it.watching ? ICON.pause : ICON.play}</button>
            <button class="icon-btn" data-action="watched" data-id="${id}" title="${t('btn.finishTitle')}">${ICON.check}</button>`
         : `<button class="icon-btn" data-action="unwatch" data-id="${id}" title="${t('btn.moveBack')}">${ICON.undo}</button>`}
       <button class="icon-btn danger" data-action="remove" data-id="${id}" title="${t('btn.delete')}">${ICON.trash}</button>`;

  const viewers = discover ? '' : `<div class="viewers"><span>${t('viewers.label')}</span>${VIEWERS_LIST.map(v =>
    `<button class="viewer v${v.color} ${viewersOf(it).includes(v.id) ? 'on' : ''}" data-action="toggle-viewer" data-id="${id}" data-value="${esc(v.id)}" title="${esc(viewerName(v.id))}">${esc(viewerName(v.id).charAt(0))}</button>`).join('')}</div>`;
  return `<article class="card${own ? ' owned' : ''}" data-action="open" data-id="${id}">
    <div class="poster">${posterHtml(it)}${rating}${op}${progress}<span class="badge type">${typeLabel(it.type)}</span></div>
    <div class="card-body">
      <h3>${esc(it.title)}</h3>
      <div class="meta">${esc(it.year)}${it.runtime ? ' · ' + esc(it.runtime) : ''}</div>
      <div class="chips">${it.genre.slice(0, 3).map(g => `<span class="chip">${esc(tg(g))}</span>`).join('')}</div>
      <div class="people" title="${esc(people)}">${esc(people)}</div>
      ${reasons.length ? `<div class="reasons">${reasons.map(r => `<span>${esc(r)}</span>`).join('')}</div>` : ''}
      ${viewers}
      ${discover ? '' : seasonHtml(it) + starsHtml(it)}
      ${!discover && it.comment ? `<div class="comment-preview" title="${esc(it.comment)}">„${esc(it.comment)}“</div>` : ''}
      <div class="actions">${actions}</div>
    </div>
  </article>`;
}

function openDetail(id) {
  const inList = byId(id);
  const it = inList || state.discover[id];
  if (!it) return;
  const chipList = (arr, key, fn = x => x) => arr.length
    ? `<div class="chips">${arr.map(v => `<button class="chip" data-action="filter" data-key="${key}" data-value="${esc(v)}">${esc(fn(v))}</button>`).join('')}</div>`
    : '<span class="muted">—</span>';
  const eid = esc(id);

  const actions = inList
    ? `${it.status === 'towatch'
         ? `<button class="btn ghost play ${it.watching ? 'on' : ''}" data-action="start" data-id="${eid}">${it.watching ? ICON.pause + ' ' + t('detail.pause') : ICON.play + ' ' + t('detail.start')}</button>
            <button class="btn ghost" data-action="watched" data-id="${eid}">${ICON.check} ${t('detail.finish')}</button>`
         : `<button class="btn ghost" data-action="unwatch" data-id="${eid}">${ICON.undo} ${t('btn.moveBack')}</button>`}
       <button class="btn danger-ghost" data-action="remove" data-id="${eid}" title="${t('btn.delete')}">${ICON.trash}</button>`
    : `<button class="btn primary" data-action="add" data-id="${eid}">${ICON.plus} ${t('btn.toWatch')}</button>
       <button class="btn ghost" data-action="add-watched" data-id="${eid}">${t('btn.watchedIt')}</button>`;

  $('#detail-body').innerHTML = `
    <div class="detail">
      <div class="detail-poster">${posterHtml(it)}</div>
      <div class="detail-info">
        <div class="detail-type">${typeLabel(it.type)} · ${esc(it.year)}${it.runtime ? ' · ' + esc(it.runtime) : ''}${it.country ? ' · ' + esc(it.country) : ''}</div>
        <h2>${esc(it.title)}</h2>
        <div class="big-rating"><b>★ ${it.rating != null ? it.rating.toFixed(1) : '—'}</b><span class="muted">/ 10 IMDb${it.votes ? ' · ' + esc(it.votes) + ' ' + t('detail.votes') : ''}</span></div>
        ${chipList(it.genre, 'genre', tg)}
        <p class="plot">${esc(it.plot || t('detail.noPlot'))}</p>
        <dl>
          <dt>${it.type === 'series' ? t('detail.creators') : t('detail.director')}</dt><dd>${chipList(it.director, 'director')}</dd>
          <dt>${t('detail.actors')}</dt><dd>${chipList(it.actors, 'actor')}</dd>
          ${inList ? `<dt>${t('detail.watchedBy')}</dt><dd><div class="chips">${viewerIds().map(v =>
            `<button class="chip toggle ${viewersOf(it).includes(v) ? 'on' : ''}" data-action="toggle-viewer" data-id="${eid}" data-value="${esc(v)}">${esc(viewerName(v))}</button>`).join('')}</div></dd>` : ''}
        </dl>
        ${inList ? `<div class="my-rating"><span class="muted">${t('detail.myRating')}</span>${starsHtml(it, 'lg')}</div>${seasonHtml(it)}
          <label class="comment-box"><span class="muted">${t('detail.comment')}</span>
            <textarea id="comment-input" data-id="${eid}" maxlength="1000" rows="3" placeholder="${t('detail.commentPh')}">${esc(it.comment || '')}</textarea></label>` : ''}
        <div class="detail-actions">${actions}</div>
        ${isId(id) ? `<a href="https://www.imdb.com/title/${eid}/" target="_blank" rel="noopener noreferrer">${t('detail.imdb')}</a>` : ''}
      </div>
    </div>`;
  state.detailId = id;
  openModal('detail');
}

/* ---------- Recommendations ---------- */
function buildProfile(viewer = state.recViewer) {
  const p = { genre: new Map(), director: new Map(), actors: new Map(), rated: 0 };
  const add = (m, k, w) => m.set(k, (m.get(k) || 0) + w);
  state.items.forEach(it => {
    if (!it.opinion) return;
    if (viewer && !viewersOf(it).includes(viewer)) return;
    const w = it.stars ? (it.stars - 2.5) / 1.5 : (it.opinion === 'like' ? 1 : -1);
    p.rated++;
    it.genre.forEach(g => add(p.genre, g, w));
    it.director.forEach(d => add(p.director, d, 2 * w));
    it.actors.slice(0, 4).forEach(a => add(p.actors, a, 1.5 * w));
  });
  return p;
}

function scoreItem(it, p) {
  const parts = [];
  it.genre.forEach(g => { const v = p.genre.get(g); if (v) parts.push({ v, t: tg(g) }); });
  it.director.forEach(d => { const v = p.director.get(d); if (v) parts.push({ v, t: t('reason.dir', { name: d }) }); });
  it.actors.forEach(a => { const v = p.actors.get(a); if (v) parts.push({ v, t: a }); });
  let s = parts.reduce((sum, x) => sum + x.v, 0);
  if (it.rating != null) s += (it.rating - 7) * 1.5;
  const reasons = parts.filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 3).map(x => x.t);
  if (it.rating >= 8.5) reasons.push(t('reason.top'));
  return { it, s, reasons };
}

function topEntries(map, n = 6) {
  return [...map].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

const likedFor = viewer => state.items
  .filter(i => isLiked(i) && (!viewer || viewersOf(i).includes(viewer)))
  .sort((a, b) => (b.stars || 3) - (a.stars || 3) || (b.watchedAt || 0) - (a.watchedAt || 0))
  .slice(0, 10);
const recSig = liked => state.recViewer + '|' + liked.map(i => i.imdbID + (i.stars || '')).join(',');

async function tmdbRef(imdbID) {
  if (!(imdbID in tmdbFromImdb)) {
    const d = await tmdb(`/find/${imdbID}`, { external_source: 'imdb_id' });
    const m = d.movie_results?.[0], s = d.tv_results?.[0];
    tmdbFromImdb[imdbID] = m ? { id: m.id, t: 'movie' } : s ? { id: s.id, t: 'tv' } : null;
  }
  return tmdbFromImdb[imdbID];
}

async function tmdbRecs(ref) {
  const k = ref.t + ref.id;
  if (!recCache.has(k)) recCache.set(k, (await tmdb(`/${ref.t}/${ref.id}/recommendations`)).results || []);
  return recCache.get(k);
}

// Titles similar to the liked ones (TMDB recommendations), enriched with IMDb data
async function loadRecs(force = false) {
  const r = state.recs;
  const liked = likedFor(state.recViewer);
  if (r.loading || !liked.length || !localStorage.getItem(LS_TMDB) || !localStorage.getItem(LS_KEY)) return;
  if (force) recCache.clear();
  Object.assign(r, { sig: recSig(liked), loading: true, error: '' });
  render();
  try {
    const pool = new Map();
    for (const it of liked) {
      const ref = await tmdbRef(it.imdbID).catch(() => null);
      if (!ref) continue;
      const list = await tmdbRecs(ref).catch(() => []);
      list.slice(0, 15).forEach((x, idx) => {
        const t = x.media_type === 'tv' || x.media_type === 'movie' ? x.media_type : ref.t;
        const e = pool.get(t + x.id) || { id: x.id, t, score: 0, because: [] };
        e.score += (1 + (15 - idx) / 15) * (it.stars ? it.stars / 3 : 1);
        if (!e.because.includes(it.title)) e.because.push(it.title);
        pool.set(t + x.id, e);
      });
    }
    const sorted = [...pool.values()].sort((a, b) => b.score - a.score);
    // keep enough of each type so both the movie and series sections get suggestions
    const top = [...sorted.filter(e => e.t === 'movie').slice(0, 20), ...sorted.filter(e => e.t === 'tv').slice(0, 20)];
    const p = buildProfile();
    const out = [];
    for (let j = 0; j < top.length; j += 6) {
      const batch = top.slice(j, j + 6);
      const res = await Promise.allSettled(batch.map(resolveCandidate));
      const fatal = res.find(x => x.status === 'rejected' && x.reason?.fatal);
      if (fatal) throw fatal.reason;
      res.forEach((x, i) => {
        if (x.status === 'fulfilled' && x.value) out.push({ it: x.value, because: batch[i].because, s: batch[i].score * 2 + scoreItem(x.value, p).s });
      });
    }
    r.items = out.sort((a, b) => b.s - a.s);
  } catch (err) {
    r.error = err.message;
  }
  r.loading = false;
  persistCaches();
  render();
}

function renderRecommend() {
  const p = buildProfile();
  const c = $('#content');
  const liked = likedFor(state.recViewer);
  const r = state.recs;
  const hasTmdb = !!localStorage.getItem(LS_TMDB);
  if (hasTmdb && liked.length && !r.loading && r.sig !== recSig(liked)) setTimeout(loadRecs);

  // a viewer sees titles marked for them or not assigned to anyone yet
  const viewerOk = it => !state.recViewer || !viewersOf(it).length || viewersOf(it).includes(state.recViewer);
  const watchlist = state.items.filter(i => i.status === 'towatch' && viewerOk(i)).map(i => scoreItem(i, p)).sort((a, b) => b.s - a.s);
  const candidates = SEED.filter(id => state.discover[id] && !byId(id)).map(id => scoreItem(state.discover[id], p)).sort((a, b) => b.s - a.s);
  const missing = SEED.some(id => !state.discover[id] && !byId(id));

  const byType = (entries, limit, toCard, emptyText) => [['movie', t('rec.movies')], ['series', t('rec.series')]]
    .filter(([ty]) => !state.recType || state.recType === ty)
    .map(([ty, label]) => {
      const list = entries.filter(e => e.it.type === ty).slice(0, limit);
      return `<div class="subsection"><h3>${label} <span class="muted small">${list.length}</span></h3>
        ${list.length ? `<div class="grid">${list.map(toCard).join('')}</div>` : `<p class="muted small">${emptyText}</p>`}</div>`;
    }).join('');

  const tg2 = topEntries(p.genre), td = topEntries(p.director, 5), ta = topEntries(p.actors, 6);
  const chips = (arr, key, fn = x => x) => arr.length
    ? `<div class="chips">${arr.map(v => `<button class="chip" data-action="filter" data-key="${key}" data-value="${esc(v)}">${esc(fn(v))}</button>`).join('')}</div>`
    : `<span class="muted small">${t('rec.noData')}</span>`;

  let html = `<div class="rec-for"><span class="muted">${t('rec.for')}</span>${['', ...viewerIds()].map(v =>
    `<button class="chip toggle ${state.recViewer === v ? 'on' : ''}" data-action="rec-viewer" data-value="${esc(v)}">${v ? esc(viewerName(v)) : t('rec.everyone')}</button>`).join('')}
    <span class="muted rec-sep">${t('rec.show')}</span>${[['', t('type.both')], ['movie', t('rec.movies')], ['series', t('rec.series')]].map(([v, label]) =>
    `<button class="chip toggle ${state.recType === v ? 'on' : ''}" data-action="rec-type" data-value="${v}">${label}</button>`).join('')}</div>`;
  html += `<div class="section-title"><h2>${t('rec.taste')}</h2></div>`;
  html += p.rated
    ? `<div class="panel taste">
        <div><h4>${t('rec.genres')}</h4>${chips(tg2, 'genre', tg)}</div>
        <div><h4>${t('rec.directors')}</h4>${chips(td, 'director')}</div>
        <div><h4>${t('rec.actors')}</h4>${chips(ta, 'actor')}</div>
      </div>`
    : `<div class="panel muted">${t('rec.rateHint')}</div>`;

  html += `<div class="section-title"><h2>${t('rec.because')}</h2>
    ${hasTmdb && liked.length ? `<button class="btn ghost sm" data-action="load-recs" ${r.loading ? 'disabled' : ''}>${r.loading ? t('loading') : t('refresh')}</button>` : ''}</div>`;
  if (!hasTmdb) {
    html += `<div class="panel muted">${t('rec.needTmdb')}</div>`;
  } else if (!liked.length) {
    html += `<div class="panel muted">${state.recViewer ? esc(t('rec.noLikedFor', { name: viewerName(state.recViewer) })) : t('rec.noLiked')} ${t('rec.onlyLiked')}</div>`;
  } else {
    const recs = r.items.filter(x => !byId(x.it.imdbID));
    if (recs.length || !r.loading) html += byType(recs, 12, x => card(x.it, { discover: true, reasons: x.because.slice(0, 2).map(title => t('reason.like', { title })) }),
      r.loading ? t('loading') : t('rec.noneType'));
    if (r.loading) html += '<div class="loader"></div>';
    else if (r.error) html += `<p class="hint error">${esc(r.error)}</p>`;
  }

  html += `<div class="section-title"><h2>${t('rec.next')}</h2><span class="muted small">${t('rec.fromList')}</span></div>`;
  html += watchlist.length
    ? byType(watchlist, 10, x => card(x.it, { reasons: x.reasons }), t('rec.noneInList'))
    : emptyState(t('rec.emptyList.h'), t('rec.emptyList.p'));

  html += `<div class="section-title"><h2>${t('rec.new')}</h2>
    ${p.rated ? `<button class="btn primary sm" data-action="discover-taste">${t('rec.findTaste')}</button>` : ''}
    ${missing ? `<button class="btn ghost sm" data-action="load-discover" ${state.loadingDiscover ? 'disabled' : ''}>${state.loadingDiscover ? t('loading') : t('rec.loadSeed')}</button>` : ''}</div>`;
  html += state.loadingDiscover && !candidates.length ? '<div class="loader"></div>'
    : candidates.length ? byType(candidates, 8, x => card(x.it, { discover: true, reasons: x.reasons }), t('rec.noneKind'))
    : `<div class="panel muted">${t('rec.seedHint')}</div>`;

  c.innerHTML = html;
}

async function loadDiscover() {
  const ids = SEED.filter(id => !state.discover[id] && !byId(id));
  if (!ids.length || state.loadingDiscover) return;
  if (!localStorage.getItem(LS_KEY)) { openSettings(); return; }
  state.loadingDiscover = true;
  render();
  let failed = 0;
  for (let i = 0; i < ids.length; i += 6) {
    const batch = await Promise.allSettled(ids.slice(i, i + 6).map(id => omdb({ i: id, plot: 'full' })));
    batch.forEach(r => r.status === 'fulfilled' ? (state.discover[r.value.imdbID] = mapDetails(r.value)) : failed++);
  }
  localStorage.setItem(LS_DISCOVER, JSON.stringify(state.discover));
  state.loadingDiscover = false;
  render();
  if (failed) toast(t('toast.notLoaded', { n: failed }), 'warn');
}

/* ---------- Discover by criteria (TMDB lists + IMDb data via OMDb) ---------- */
async function tmdb(path, params = {}) {
  const key = localStorage.getItem(LS_TMDB);
  if (!key) {
    openSettings();
    throw fail(t('err.noTmdb'), true);
  }
  const bearer = key.startsWith('eyJ');
  const qs = new URLSearchParams(bearer ? params : { ...params, api_key: key });
  const res = await fetch(`https://api.themoviedb.org/3${path}?${qs}`,
    bearer ? { headers: { Authorization: 'Bearer ' + key } } : undefined);
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw fail(res.status === 401 ? t('err.badTmdb') : (d.status_message || t('err.tmdb', { code: res.status })), res.status === 401);
  return d;
}

async function personId(name) {
  const key = name.trim().toLowerCase();
  if (personCache.has(key)) return personCache.get(key);
  const d = await tmdb('/search/person', { query: name.trim(), include_adult: 'false' });
  if (!d.results?.length) throw new Error(t('err.person', { name }));
  personCache.set(key, d.results[0].id);
  return d.results[0].id;
}

const validYear = y => /^\d{4}$/.test(String(y)) ? String(y) : '';
const today = () => new Date().toISOString().slice(0, 10);

function discoverParams(t, c, gids, actorId, directorId, page, kwIds = [], studio = null) {
  const date = t === 'movie' ? 'primary_release_date' : 'first_air_date';
  const p = {
    page,
    include_adult: 'false',
    sort_by: { popularity: 'popularity.desc', rating: 'vote_average.desc', newest: date + '.desc' }[c.sort] || 'popularity.desc',
    'vote_count.gte': (c.keyword.trim() || c.studio.trim()) ? (c.sort === 'rating' ? 50 : 5) : (c.sort === 'rating' ? 500 : 100),
    [date + '.lte']: validYear(c.yearTo) ? `${c.yearTo}-12-31` : today()
  };
  if (gids.length) p.with_genres = gids.join('|');
  // TMDB scores differ from IMDb; loosen here, exact IMDb filter is applied afterwards
  if (c.minRating) p['vote_average.gte'] = Math.max(0, c.minRating - 1);
  if (validYear(c.yearFrom)) p[date + '.gte'] = `${c.yearFrom}-01-01`;
  if (c.lang) p.with_original_language = c.lang;
  if (t === 'movie' && actorId) p.with_cast = actorId;
  if (t === 'movie' && directorId) p.with_crew = directorId;
  if (kwIds.length) p.with_keywords = kwIds.join('|');
  if (studio) {
    if (t === 'tv' && studio.networks.length) p.with_networks = studio.networks.join('|');
    else p.with_companies = studio.companies.join('|');
  }
  return p;
}

async function studioIds(name) {
  const key = name.trim().toLowerCase();
  if (studioCache.has(key)) return studioCache.get(key);
  const alias = Object.entries(PLATFORMS).find(([k]) => k.toLowerCase() === key)?.[1];
  const q = alias?.q || name.trim();
  const d = await tmdb('/search/company', { query: q });
  const re = new RegExp('(^|[^a-z0-9])' + q.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const res = {
    companies: (d.results || []).filter(x => re.test(x.name.toLowerCase())).slice(0, 15).map(x => x.id),
    networks: alias?.networks || []
  };
  if (!res.companies.length && !res.networks.length) throw new Error(t('err.studio', { name }));
  studioCache.set(key, res);
  return res;
}

async function keywordIds(q) {
  const key = q.toLowerCase();
  if (keywordCache.has(key)) return keywordCache.get(key);
  const d = await tmdb('/search/keyword', { query: q });
  const ids = (d.results || [])
    .filter(k => { const n = k.name.toLowerCase(); return n === key || n.startsWith(key + ' '); })
    .slice(0, 8).map(k => k.id);
  keywordCache.set(key, ids);
  return ids;
}

const titleOf = r => (r.title || r.name || '').toLowerCase();

function rowMatches(r, c, gids, t) {
  const y = ((t === 'movie' ? r.release_date : r.first_air_date) || '').slice(0, 4);
  const yf = validYear(c.yearFrom), yt = validYear(c.yearTo);
  return (!gids.length || (r.genre_ids || []).some(g => gids.includes(g))) &&
    (!yf || y >= yf) && (!yt || (y && y <= yt)) &&
    (!c.lang || r.original_language === c.lang);
}

// TMDB /discover/tv doesn't support people filters, so use the person's TV credits
async function tvCreditsList(c, gids, actorId, directorId) {
  if (state.disc.tvList) return state.disc.tvList;
  const sets = [];
  if (actorId) sets.push((await tmdb(`/person/${actorId}/tv_credits`)).cast
    .filter(x => !/self|himself|herself|host|narrator/i.test(x.character || '')));
  if (directorId) sets.push((await tmdb(`/person/${directorId}/tv_credits`)).crew
    .filter(x => ['Directing', 'Writing', 'Creator'].includes(x.department) || x.job === 'Creator'));
  const [first, ...rest] = sets;
  const kw = c.keyword.trim().toLowerCase();
  const seen = new Set();
  const list = first.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return rest.every(s => s.some(x => x.id === r.id)) &&
      rowMatches(r, c, gids, 'tv') &&
      (!kw || titleOf(r).includes(kw)) &&
      (!c.minRating || r.vote_average >= c.minRating - 1) &&
      (r.vote_count || 0) >= 10;
  });
  const key = { rating: r => -r.vote_average, newest: r => -(Date.parse(r.first_air_date) || 0) }[c.sort] || (r => -r.popularity);
  list.sort((a, b) => key(a) - key(b));
  return (state.disc.tvList = list.map(r => ({ id: r.id, t: 'tv' })));
}

async function candidatesPage(c, page) {
  const types = c.type === 'both' ? ['movie', 'tv'] : [c.type];
  const [actorId, directorId] = await Promise.all([
    c.actor.trim() ? personId(c.actor) : null,
    c.director.trim() ? personId(c.director) : null
  ]);
  const kw = c.keyword.trim();
  const kwIds = kw ? await keywordIds(kw) : [];
  const hasPerson = actorId || directorId;
  const studio = c.studio.trim() ? await studioIds(c.studio) : null;
  const narrow = hasPerson || studio;
  const out = [];
  let more = false;
  for (const t of types) {
    const gids = [...new Set(c.genres.map(g => GENRE_IDS[g]?.[t]).filter(Boolean))];
    if (c.genres.length && !gids.length) continue;
    if (studio && !studio.companies.length && !(t === 'tv' && studio.networks.length)) continue;
    if (t === 'tv' && hasPerson) {
      const list = await tvCreditsList(c, gids, actorId, directorId);
      out.push(...list.slice((page - 1) * 20, page * 20));
      more ||= list.length > page * 20;
      continue;
    }
    // tagged with the keyword (e.g. all Star Wars films, incl. animated)
    if (!kw || kwIds.length || narrow) {
      const d = await tmdb(`/discover/${t}`, discoverParams(t, c, gids, actorId, directorId, page, kwIds, studio));
      const rows = kw && !kwIds.length ? d.results.filter(r => titleOf(r).includes(kw.toLowerCase())) : d.results;
      out.push(...rows.map(r => ({ id: r.id, t })));
      more ||= page < Math.min(d.total_pages, 500);
    }
    // plus titles containing the keyword
    if (kw && !narrow) {
      const s = await tmdb(`/search/${t}`, { query: kw, page, include_adult: 'false' });
      out.push(...s.results.filter(r => rowMatches(r, c, gids, t)).map(r => ({ id: r.id, t })));
      more ||= page < Math.min(s.total_pages, 500);
    }
  }
  const seen = new Set();
  return { out: out.filter(x => !seen.has(x.t + x.id) && seen.add(x.t + x.id)), more };
}

async function resolveCandidate({ id, t }) {
  const k = t + id;
  if (!(k in imdbMap)) imdbMap[k] = (await tmdb(`/${t}/${id}/external_ids`)).imdb_id || null;
  const imdb = imdbMap[k];
  if (!isId(imdb)) return null;
  if (byId(imdb)) return byId(imdb);
  if (!state.discover[imdb]) state.discover[imdb] = mapDetails(await omdb({ i: imdb, plot: 'full' }));
  return state.discover[imdb];
}

const matchesCriteria = (it, c) =>
  (!c.minRating || (it.rating ?? 0) >= c.minRating) &&
  (!c.genres.length || it.genre.some(g => c.genres.includes(g)));

function persistCaches() {
  try {
    localStorage.setItem(LS_DISCOVER, JSON.stringify(state.discover));
    localStorage.setItem(LS_IMDBMAP, JSON.stringify(imdbMap));
    localStorage.setItem(LS_TMDBMAP, JSON.stringify(tmdbFromImdb));
  } catch {
    // storage full: keep only what is currently shown
    state.discover = Object.fromEntries(state.disc.results.map(i => [i.imdbID, i]));
    try { localStorage.setItem(LS_DISCOVER, JSON.stringify(state.discover)); } catch { /* ignore */ }
  }
}

async function runDiscover(reset) {
  const d = state.disc;
  if (d.loading) return;
  if (!localStorage.getItem(LS_TMDB) || !localStorage.getItem(LS_KEY)) {
    toast(t('toast.needKeys'), 'warn');
    openSettings();
    return;
  }
  if (reset) Object.assign(d, { results: [], page: 0, more: true, tvList: null, error: '' });
  if (reset && isMobile.matches) $('.sticky-head').classList.remove('expanded');
  d.loading = true;
  render();
  const c = d.criteria;
  const byKeyword = !!c.keyword.trim();
  let found = 0;
  try {
    for (let i = 0; i < (byKeyword ? 5 : 3) && d.more && found < (byKeyword ? 40 : 12); i++) {
      const { out, more } = await candidatesPage(c, d.page + 1);
      d.page++;
      d.more = more;
      for (let j = 0; j < out.length; j += 6) {
        const res = await Promise.allSettled(out.slice(j, j + 6).map(resolveCandidate));
        const fatal = res.find(r => r.status === 'rejected' && r.reason?.fatal);
        if (fatal) throw fatal.reason;
        res.forEach(r => {
          const it = r.status === 'fulfilled' && r.value;
          if (it && matchesCriteria(it, c) && !d.results.some(x => x.imdbID === it.imdbID)) { d.results.push(it); found++; }
        });
        if (state.view === 'discover') renderDiscover();
      }
    }
  } catch (err) {
    d.error = err.message;
  }
  d.loading = false;
  persistCaches();
  render();
}

function renderDiscover() {
  const d = state.disc;
  const c = $('#content');
  $('#d-search').disabled = d.loading;
  $('#d-status').textContent = d.loading ? t('d.loading') : '';

  if (!localStorage.getItem(LS_TMDB)) {
    c.innerHTML = `<div class="empty"><h3>${t('d.needTmdb.h')}</h3>
      <p>${t('d.needTmdb.p')}</p>
      <button class="btn primary" data-action="open-settings">${t('d.enterKey')}</button></div>`;
    return;
  }
  if (!d.page && !d.loading) {
    c.innerHTML = d.error ? `<p class="hint error">${esc(d.error)}</p>`
      : emptyState(t('d.criteria.h'), t('d.criteria.p'), false);
    return;
  }
  const votes = i => parseInt(String(i.votes).replace(/\D/g, ''), 10) || 0;
  const sorter = {
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    newest: (a, b) => yearNum(b.year) - yearNum(a.year),
    popularity: (a, b) => votes(b) - votes(a)
  }[d.criteria.sort];
  const list = [...d.results];
  if (sorter) list.sort(sorter);
  const owned = list.filter(i => byId(i.imdbID)).length;
  let html = list.length
    ? `<div class="section-title"><h2>${t('d.found', { n: list.length })}${owned ? ` <span class="muted small">· ${t('d.owned', { n: owned })}</span>` : ''}</h2>
        ${list.length > owned ? `<button class="btn ghost sm" data-action="add-all">${ICON.plus} ${t('d.addAll')}</button>` : ''}</div>
       <div class="grid">${list.map(i => card(i, { discover: true })).join('')}</div>`
    : d.loading ? '' : emptyState(t('noResults.h'), t('d.noResults.p'), false);
  if (d.error) html += `<p class="hint error">${esc(d.error)}</p>`;
  html += d.loading ? '<div class="loader"></div>'
    : d.more ? `<div class="center"><button class="btn ghost" data-action="discover-more">${t('d.more')}</button></div>` : '';
  c.innerHTML = html;
}

const CRIT_INPUTS = { keyword: '#d-keyword', studio: '#d-studio', type: '#d-type', actor: '#d-actor', director: '#d-director', minRating: '#d-rating', yearFrom: '#d-year-from', yearTo: '#d-year-to', lang: '#d-lang', sort: '#d-sort' };
const saveCriteria = () => { localStorage.setItem(LS_CRITERIA, JSON.stringify(state.disc.criteria)); updateFilterDot(); };

function syncCriteriaInputs() {
  const c = state.disc.criteria;
  Object.entries(CRIT_INPUTS).forEach(([k, sel]) => { $(sel).value = c[k]; });
  $('#d-rating-val').textContent = c.minRating;
  $$('#d-genres .chip').forEach(b => b.classList.toggle('on', c.genres.includes(b.dataset.value)));
}

function renderGenreChips() {
  $('#d-genres').innerHTML = GENRES.map(g =>
    `<button class="chip toggle" data-action="toggle-genre" data-value="${esc(g.key)}">${esc(tg(g.key))}</button>`).join('');
  $$('#d-genres .chip').forEach(b => b.classList.toggle('on', state.disc.criteria.genres.includes(b.dataset.value)));
}

function initDiscoverForm() {
  $('#dl-studios').innerHTML = Object.keys(PLATFORMS).map(p => `<option value="${esc(p)}">`).join('');
  renderGenreChips();
  Object.entries(CRIT_INPUTS).forEach(([key, sel]) => $(sel).addEventListener('input', e => {
    state.disc.criteria[key] = key === 'minRating' ? parseFloat(e.target.value) : e.target.value;
    $('#d-rating-val').textContent = state.disc.criteria.minRating;
    saveCriteria();
  }));
  $('#discover-panel').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') runDiscover(true);
  });
  syncCriteriaInputs();
}

/* ---------- Add modal search ---------- */
let searchTimer, searchSeq = 0;
$('#add-input').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(doSearch, 400); });
$('#add-type').addEventListener('change', doSearch);

async function doSearch() {
  const q = $('#add-input').value.trim();
  const box = $('#add-results');
  const seq = ++searchSeq;
  if (q.length < 2) { box.innerHTML = `<p class="hint">${t('add.min2')}</p>`; return; }
  box.innerHTML = '<div class="loader"></div>';
  try {
    const m = q.match(/tt\d{6,10}/);
    let results;
    if (m) {
      const d = await omdb({ i: m[0] });
      results = [d];
    } else {
      const params = { s: q };
      if ($('#add-type').value) params.type = $('#add-type').value;
      results = (await omdb(params)).Search;
    }
    if (seq !== searchSeq) return;
    box.innerHTML = results.filter(r => isId(r.imdbID)).map(resultRow).join('');
  } catch (err) {
    if (seq === searchSeq) box.innerHTML = `<p class="hint error">${esc(err.message)}</p>`;
  }
}

function resultRow(r) {
  const id = esc(r.imdbID);
  const img = /^https:\/\//.test(r.Poster) ? `<img src="${esc(r.Poster)}" alt="" loading="lazy">` : '<div class="thumb"></div>';
  return `<div class="result">${img}
    <div class="result-info"><strong>${esc(r.Title)}</strong><span>${esc(r.Year)} · ${typeLabel(r.Type)}</span></div>
    <div class="result-actions">${byId(r.imdbID)
      ? statusTag(byId(r.imdbID))
      : `<button class="btn sm primary" data-action="add" data-id="${id}">${ICON.plus} ${t('btn.toWatch')}</button>
         <button class="btn sm ghost" data-action="add-watched" data-id="${id}">${t('btn.watchedIt')}</button>`}</div>
  </div>`;
}

/* ---------- Settings ---------- */
function openSettings() {
  $('#api-key').value = localStorage.getItem(LS_KEY) || '';
  $('#tmdb-key').value = localStorage.getItem(LS_TMDB) || '';
  renderViewerList();
  openModal('settings');
}

/* ---------- Viewers (who watched) ---------- */
function renderViewerOptions() {
  const sel = $('#f-viewer');
  sel.innerHTML = `<option value="">${t('viewer.all')}</option>` +
    VIEWERS_LIST.map(v => `<option value="${esc(v.id)}">${esc(viewerName(v.id))}</option>`).join('') +
    `<option value="none">${t('viewer.none')}</option>`;
  sel.value = state.f.viewer;
  if (sel.value !== state.f.viewer) { state.f.viewer = ''; sel.value = ''; }
}

function renderViewerList() {
  const count = id => state.items.filter(i => viewersOf(i).includes(id)).length;
  $('#viewer-list').innerHTML = VIEWERS_LIST.map(v => `
    <div class="viewer-row">
      <span class="viewer on v${v.color}">${esc(viewerName(v.id).charAt(0))}</span>
      <input class="grow" maxlength="20" data-viewer-id="${esc(v.id)}" value="${esc(viewerName(v.id))}">
      <span class="muted small">${t('viewers.count', { n: count(v.id) })}</span>
      <button class="icon-btn danger" data-action="viewer-remove" data-value="${esc(v.id)}" title="${t('viewers.remove')}">${ICON.trash}</button>
    </div>`).join('');
  $('#viewer-add-row').hidden = VIEWERS_LIST.length >= MAX_VIEWERS;
}

function validViewerName(name, exceptId = null) {
  const n = name.trim();
  if (!n) { toast(t('viewers.errEmpty'), 'error'); return null; }
  if (VIEWERS_LIST.some(v => v.id !== exceptId && viewerName(v.id).toLowerCase() === n.toLowerCase())) { toast(t('viewers.errDup'), 'error'); return null; }
  return n.slice(0, 20);
}

function viewersChanged() {
  localStorage.setItem(LS_VIEWERS, JSON.stringify(VIEWERS_LIST));
  window.W2W?.onViewersChanged?.();
  renderViewerList();
  renderViewerOptions();
  render();
}

function addViewer() {
  if (VIEWERS_LIST.length >= MAX_VIEWERS) { toast(t('viewers.errMax', { n: MAX_VIEWERS }), 'error'); return; }
  const input = $('#viewer-new');
  const name = validViewerName(input.value);
  if (!name) return;
  const used = new Set(VIEWERS_LIST.map(v => v.color));
  const color = [...Array(VIEWER_COLORS).keys()].find(c => !used.has(c)) ?? VIEWERS_LIST.length % VIEWER_COLORS;
  VIEWERS_LIST.push({ id: 'v' + Date.now().toString(36), name, color });
  input.value = '';
  viewersChanged();
  toast(t('viewers.added', { name }));
}

function renameViewer(id, value, input) {
  const v = VIEWERS_LIST.find(x => x.id === id);
  if (!v) return;
  const name = validViewerName(value, id);
  if (!name) { input.value = viewerName(id); return; }
  if (name === viewerName(id)) return;
  v.name = name;
  viewersChanged();
}

function removeViewer(id) {
  const v = VIEWERS_LIST.find(x => x.id === id);
  if (!v) return;
  const marked = state.items.filter(i => viewersOf(i).includes(id));
  if (!confirm(t('viewers.confirmRemove', { name: viewerName(id), n: marked.length }))) return;
  VIEWERS_LIST = VIEWERS_LIST.filter(x => x.id !== id);
  marked.forEach(i => { i.viewers = viewersOf(i).filter(x => x !== id); });
  if (marked.length) save();
  if (state.recViewer === id) state.recViewer = '';
  viewersChanged();
}

document.addEventListener('change', e => {
  if (e.target.matches?.('[data-viewer-id]')) renameViewer(e.target.dataset.viewerId, e.target.value, e.target);
});
$('#viewer-new').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addViewer(); } });

function setLang(lang) {
  LANG = lang === 'en' ? 'en' : 'bg';
  localStorage.setItem(LS_LANG, LANG);
  localize();
  render();
  if (state.detailId && !$('#modal-detail').hidden) openDetail(state.detailId);
}

// static texts + labels built from data (genres, viewer names)
function localize() {
  applyI18n();
  renderViewerOptions();
  renderGenreChips();
  $('#lang-flag').innerHTML = FLAGS[LANG];
  $('#lang-name').textContent = LANG === 'en' ? 'English' : 'Български';
  $('#lang-btn').title = t('lang.toggle');
}

async function saveTmdbKey() {
  const key = $('#tmdb-key').value.trim();
  if (!/^[a-f0-9]{32}$/i.test(key) && !/^eyJ[\w.-]+$/.test(key)) { toast(t('key.badTmdbFormat'), 'error'); return; }
  const prev = localStorage.getItem(LS_TMDB);
  localStorage.setItem(LS_TMDB, key);
  try {
    await tmdb('/configuration');
    toast(t('key.tmdbOk'));
    window.W2W?.onKeysChanged?.();
    render();
  } catch (err) {
    if (prev) localStorage.setItem(LS_TMDB, prev); else localStorage.removeItem(LS_TMDB);
    toast(err.message, 'error');
  }
}

async function saveKey() {
  const key = $('#api-key').value.trim();
  if (!/^[A-Za-z0-9]{6,20}$/.test(key)) { toast(t('key.badFormat'), 'error'); return; }
  const prev = localStorage.getItem(LS_KEY);
  localStorage.setItem(LS_KEY, key);
  try {
    await omdb({ i: 'tt0111161' });
    toast(t('key.omdbOk'));
    window.W2W?.onKeysChanged?.();
    render();
  } catch (err) {
    if (prev) localStorage.setItem(LS_KEY, prev); else localStorage.removeItem(LS_KEY);
    toast(err.message, 'error');
  }
}

async function refreshRatings(btn) {
  if (!state.items.length) return;
  btn.disabled = true;
  let ok = 0;
  for (const it of state.items) {
    btn.textContent = t('refreshing', { i: ok + 1, n: state.items.length });
    try { Object.assign(it, mapDetails(await omdb({ i: it.imdbID, plot: 'full' }))); ok++; } catch { /* skip failed */ }
  }
  save();
  render();
  btn.disabled = false;
  btn.textContent = t('settings.refresh');
  toast(t('toast.refreshed', { ok, n: state.items.length }));
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.items, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `w2w-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

$('#import-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error();
    const arr = v => Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
    let added = 0;
    data.forEach(d => {
      if (!d || !isId(d.imdbID) || typeof d.title !== 'string' || byId(d.imdbID)) return;
      state.items.push({
        imdbID: d.imdbID, title: d.title, year: String(d.year ?? ''), type: d.type === 'series' ? 'series' : 'movie',
        genre: arr(d.genre), director: arr(d.director), actors: arr(d.actors),
        rating: typeof d.rating === 'number' ? d.rating : null, votes: String(d.votes ?? ''),
        poster: /^https:\/\//.test(d.poster) ? d.poster : '', plot: String(d.plot ?? ''),
        runtime: String(d.runtime ?? ''), country: String(d.country ?? ''),
        status: d.status === 'watched' ? 'watched' : 'towatch',
        opinion: ['like', 'dislike'].includes(d.opinion) ? d.opinion : null,
        stars: typeof d.stars === 'number' && d.stars >= 0.5 ? Math.min(5, Math.round(d.stars * 2) / 2) : null,
        comment: typeof d.comment === 'string' ? d.comment.slice(0, 1000) : '',
        watching: !!d.watching,
        season: Number.isInteger(d.season) && d.season > 0 ? d.season : null,
        totalSeasons: Number.isInteger(d.totalSeasons) ? d.totalSeasons : null,
        seenSeasons: Number.isInteger(d.seenSeasons) ? d.seenSeasons : null,
        newSeason: !!d.newSeason,
        viewers: arr(d.viewers).filter(v => viewerIds().includes(v)),
        addedAt: Number(d.addedAt) || Date.now(), watchedAt: Number(d.watchedAt) || null
      });
      added++;
    });
    save();
    render();
    toast(t('toast.imported', { n: added }));
  } catch {
    toast(t('toast.badFile'), 'error');
  }
});

function clearAll() {
  if (!confirm(t('confirm.clear'))) return;
  state.items = [];
  save();
  closeModals();
  render();
  toast(t('toast.cleared'), 'warn');
}

/* ---------- New seasons ---------- */
async function checkNewSeasons(manual = false) {
  if (!localStorage.getItem(LS_KEY)) return;
  const DAY = 864e5;
  const list = state.items.filter(i => i.status === 'watched' && i.type === 'series' &&
    (manual || !i.seasonCheckedAt || Date.now() - i.seasonCheckedAt > DAY));
  if (!list.length) { if (manual) toast(t('toast.noSeries')); return; }
  const moved = [];
  for (let j = 0; j < list.length; j += 5) {
    const batch = list.slice(j, j + 5);
    const res = await Promise.allSettled(batch.map(it => omdb({ i: it.imdbID, plot: 'full' })));
    res.forEach((r, k) => {
      if (r.status !== 'fulfilled') return;
      const it = batch[k];
      Object.assign(it, mapDetails(r.value));
      it.seasonCheckedAt = Date.now();
      // first check only records a baseline
      if (!it.seenSeasons) { it.seenSeasons = it.totalSeasons; return; }
      if (it.totalSeasons > it.seenSeasons) {
        Object.assign(it, { status: 'towatch', newSeason: true, watching: false, season: it.seenSeasons + 1, watchedAt: null });
        moved.push(it.title);
      }
    });
  }
  save();
  render();
  if (moved.length) toast(t('toast.newSeason', { list: moved.join(', ') }));
  else if (manual) toast(t('toast.noNewSeasons'));
}

/* ---------- Comments ---------- */
let commentTimer;
document.addEventListener('input', e => {
  if (e.target.id !== 'comment-input') return;
  const id = e.target.dataset.id;
  const text = e.target.value.slice(0, 1000);
  clearTimeout(commentTimer);
  commentTimer = setTimeout(() => {
    const it = byId(id);
    if (!it) return;
    it.comment = text.trim() ? text : '';
    save();
    render();
  }, 600);
});

/* ---------- Compact header on scroll ---------- */
const isMobile = window.matchMedia('(max-width: 860px)');

// dot on the funnel button when any filter differs from the default
function updateFilterDot() {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const active = state.view === 'discover'
    ? Object.entries(defaultCriteria()).some(([k, v]) => !same(state.disc.criteria[k], v))
    : Object.entries(defaultFilters()).some(([k, v]) => k !== 'sort' && !same(state.f[k], v));
  $('.compact-toggle').classList.toggle('has-active', active);
}
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const head = $('.sticky-head');
    const y = window.scrollY;
    // hysteresis + min page length avoid flicker when the header shrinks
    const scrollable = document.documentElement.scrollHeight - window.innerHeight > 300;
    if (y > 80 && scrollable) head.classList.add('compact');
    else if (y < 10) {
      head.classList.remove('compact');
      // on phones the funnel controls the panel, so keep it as the user left it
      if (!isMobile.matches) head.classList.remove('expanded');
    }
    scrollTicking = false;
  });
}, { passive: true });

/* ---------- Init ---------- */
localize();
document.body.classList.toggle('sb-pinned', localStorage.getItem(LS_SIDEBAR) === '1');
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

let started = false;
function start() {
  if (started) return;
  started = true;
  state.items.forEach(i => { if (i.stars > 5) i.stars = 5; });
  syncFilterInputs();
  initDiscoverForm();
  render();
  if (!localStorage.getItem(LS_KEY) || !localStorage.getItem(LS_TMDB)) openSettings();
  else checkNewSeasons().catch(() => {});
}

// Bridge for cloud.js (Firebase auth + sync)
window.W2W = {
  start,
  toast,
  t,
  items: () => state.items,
  keys: () => ({ omdb: localStorage.getItem(LS_KEY) || '', tmdb: localStorage.getItem(LS_TMDB) || '' }),
  viewers: () => VIEWERS_LIST,
  setViewers(list) {
    const clean = cleanViewers(list);
    if (!clean || !clean.length) return;
    VIEWERS_LIST = clean;
    localStorage.setItem(LS_VIEWERS, JSON.stringify(VIEWERS_LIST));
    if (!started) return;
    renderViewerOptions();
    render();
  },
  setKeys({ omdb, tmdb }) {
    if (omdb) localStorage.setItem(LS_KEY, omdb);
    if (tmdb) localStorage.setItem(LS_TMDB, tmdb);
  },
  applyRemote(items) {
    state.items = items.filter(i => i && isId(i.imdbID) && typeof i.title === 'string')
      .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    saveLocal();
    if (!started) return;
    render();
    // don't rebuild the detail while the user is typing a comment
    if (state.detailId && !$('#modal-detail').hidden && document.activeElement?.id !== 'comment-input') openDetail(state.detailId);
  },
  clearLocal() {
    [LS_ITEMS, LS_KEY, LS_TMDB].forEach(k => localStorage.removeItem(k));
  },
  onLocalSave: null,
  onKeysChanged: null,
  onViewersChanged: null
};

// cloud.js sets this flag; if it failed to load at all, run locally
window.addEventListener('load', () => { if (!window.W2W_CLOUD) start(); });
