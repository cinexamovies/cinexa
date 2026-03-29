/* ── STATE ── */
let watchlist   = JSON.parse(localStorage.getItem('watchlist') || '[]');
let allCache    = {};
let detailCache = JSON.parse(localStorage.getItem('detailCache') || '{}');
let continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '{}');
// { [id]: { id, season, episode, watchedAt, sourceIdx } }

/* ── DOM ── */
const navbar           = document.getElementById('navbar');
const heroBg           = document.getElementById('heroBg');
const heroContent      = document.getElementById('heroContent');
const trendingRow      = document.getElementById('trendingRow');
const moviesRow        = document.getElementById('moviesRow');
const showsRow         = document.getElementById('showsRow');
const newRow           = document.getElementById('newRow');
const topShowsRow      = document.getElementById('topShowsRow');
const homeRows         = document.getElementById('homeRows');
const searchSection    = document.getElementById('searchSection');
const searchGrid       = document.getElementById('searchGrid');
const filteredSection  = document.getElementById('filteredSection');
const filteredGrid     = document.getElementById('filteredGrid');
const filteredTitle    = document.getElementById('filteredTitle');
const watchlistSection = document.getElementById('watchlistSection');
const watchlistGrid    = document.getElementById('watchlistGrid');
const watchlistEmpty   = document.getElementById('watchlistEmpty');
const clearWatchlist   = document.getElementById('clearWatchlist');
const modalOverlay     = document.getElementById('modalOverlay');
const modalBanner      = document.getElementById('modalBanner');
const modalBody        = document.getElementById('modalBody');
const modalClose       = document.getElementById('modalClose');
const searchInput      = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');
const searchTitle      = document.getElementById('searchTitle');
const toast            = document.getElementById('toast');
const hamburger        = document.getElementById('hamburger');
const navLinks         = document.getElementById('navLinks');
const heroSection      = document.getElementById('hero');
const loadingScreen    = document.getElementById('loadingScreen');
const mainContent      = document.getElementById('mainContent');
const playerOverlay    = document.getElementById('playerOverlay');
const playerFrame      = document.getElementById('playerFrame');
const playerClose      = document.getElementById('playerClose');
const playerTitle      = document.getElementById('playerTitle');
const srcBtns          = document.getElementById('srcBtns');
const playerFullscreen = document.getElementById('playerFullscreen');
const episodePicker    = document.getElementById('episodePicker');
const seasonSelect     = document.getElementById('seasonSelect');
const episodeSelect    = document.getElementById('episodeSelect');
const continueRow      = document.getElementById('continueRow');
const continueSection  = document.getElementById('continueSection');

/* ── INIT ── */
async function init() {
  showLoading(true);
  try {
    const [trending, movies, shows, nowPlaying, topShows] = await Promise.all([
      fetchTrending(),
      fetchPopularMovies(),
      fetchPopularShows(),
      fetchNowPlaying(),
      fetchTopRatedShows(),
    ]);
    allCache = { trending, movies, shows, nowPlaying, topShows };

    const heroPool = trending.filter(i => i.banner);
    renderHero(heroPool[Math.floor(Math.random() * Math.min(5, heroPool.length))]);
    renderRow(trendingRow, trending.slice(0, 20));
    renderRow(moviesRow,   movies.slice(0, 20));
    renderRow(newRow,      nowPlaying.slice(0, 20));
    renderRow(showsRow,    shows.slice(0, 20));
    renderRow(topShowsRow, topShows.slice(0, 20));

    showLoading(false);
    mainContent.classList.remove('hidden');
    updateWatchlistBadge();
    renderContinueWatching();
    await restoreFromHash();
  } catch (err) {
    showLoading(false);
    showToast('Failed to load. Check your internet connection.');
    console.error(err);
  }
}

function showLoading(on) {
  loadingScreen.classList.toggle('hidden', !on);
}

/* ── HERO ── */
function renderHero(item) {
  if (!item) return;
  heroBg.style.backgroundImage = `url('${item.banner}')`;
  heroContent.innerHTML = `
    <div class="hero-badge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Now Streaming
    </div>
    <h1 class="hero-title">${item.title}</h1>
    <div class="hero-meta">
      <span class="score">&#9733; ${item.score}</span>
      <span>${item.year}</span>
      <span class="type-badge">${item.type === 'show' ? 'TV Show' : 'Movie'}</span>
    </div>
    <p class="hero-desc">${item.description}</p>
    <div class="hero-genres">
      ${item.genre.slice(0,4).map(g => `<span class="genre-tag">${g}</span>`).join('')}
    </div>
    <div class="hero-actions">
      <button class="btn btn-primary" onclick="playContent('${item.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Watch Now
      </button>
      <button class="btn btn-secondary" onclick="openModal('${item.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
        More Info
      </button>
    </div>
  `;
}

/* ── CARD ── */
function createCard(item) {
  const div = document.createElement('div');
  div.className = 'card';
  const inWL = watchlist.includes(item.id);
  const thumb = item.thumb || `https://placehold.co/342x513/13131a/888?text=${encodeURIComponent(item.title)}`;
  div.innerHTML = `
    <img src="${thumb}" alt="${item.title}" loading="lazy"
         onerror="this.src='https://placehold.co/342x513/13131a/888?text=No+Image'" />
    <div class="card-overlay">
      <button class="play-btn" aria-label="Play">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <button class="wl-mini ${inWL ? 'in-wl' : ''}" aria-label="Watchlist">${inWL ? '&#10003;' : '+'}</button>
    </div>
    <div class="card-info">
      <div class="card-title">${item.title}</div>
      <div class="card-meta">
        <span>${item.year} &bull; ${item.type === 'show' ? 'TV' : 'Movie'}</span>
        <span class="card-score">&#9733; ${item.score}</span>
      </div>
    </div>
  `;
  div.querySelector('.play-btn').addEventListener('click', e => { e.stopPropagation(); playContent(item.id); });
  div.querySelector('.wl-mini').addEventListener('click', e => { e.stopPropagation(); toggleWatchlist(item.id, e.currentTarget); });
  div.addEventListener('click', () => openModal(item.id));
  return div;
}

function renderRow(container, items) {
  container.innerHTML = '';
  items.forEach(i => container.appendChild(createCard(i)));
}

function renderGrid(container, items, append = false) {
  if (!append) container.innerHTML = '';
  if (!items.length && !append) {
    container.innerHTML = '<p class="empty-msg">No results found.</p>';
    return;
  }
  items.forEach(i => container.appendChild(createCard(i)));
}

/* ── PLAYER ── */
const SOURCES = [
  { label: 'VidSrc CC',    tag: 'HD',  movie: id => `https://vidsrc.cc/embed/movie?tmdb=${id}`,                show: (id,s,e) => `https://vidsrc.cc/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { label: 'VidSrc ICU',   tag: 'HD',  movie: id => `https://vidsrc.icu/embed/movie/${id}`,                    show: (id,s,e) => `https://vidsrc.icu/embed/tv/${id}/${s}/${e}` },
  { label: 'VidSrc XYZ',   tag: 'HD',  movie: id => `https://vidsrc.xyz/embed/movie/${id}`,                    show: (id,s,e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },
  { label: 'VidSrc TO',    tag: 'HD',  movie: id => `https://vidsrc.to/embed/movie/${id}`,                     show: (id,s,e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
  { label: 'VidSrc ME',    tag: 'HD',  movie: id => `https://vidsrc.me/embed/movie?tmdb=${id}`,                show: (id,s,e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { label: 'Embed SU',     tag: 'HD',  movie: id => `https://embed.su/embed/movie/${id}`,                      show: (id,s,e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
  { label: 'SuperEmbed',   tag: 'HD',  movie: id => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`, show: (id,s,e) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { label: 'AutoEmbed',    tag: 'HD',  movie: id => `https://autoembed.co/movie/tmdb/${id}`,                   show: (id,s,e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
  { label: 'VidSrc LOL',   tag: '4K',  movie: id => `https://vidsrc.lol/embed/movie/${id}`,                    show: (id,s,e) => `https://vidsrc.lol/embed/tv/${id}/${s}/${e}` },
  { label: 'VidSrc Store', tag: 'HD',  movie: id => `https://vidsrc.store/embed/movie/${id}`,                  show: (id,s,e) => `https://vidsrc.store/embed/tv/${id}/${s}/${e}` },
  { label: 'CineSrc',      tag: 'HD',  movie: id => `https://cinesrc.st/embed/movie/${id}`,                    show: (id,s,e) => `https://cinesrc.st/embed/tv/${id}/${s}/${e}` },
  { label: 'NontonGo',     tag: 'HD',  movie: id => `https://www.NontonGo.net/embed/movie/${id}`,              show: (id,s,e) => `https://www.NontonGo.net/embed/tv/${id}/${s}/${e}` },
];

let currentItem      = null;
let currentSourceIdx = 0;
let currentSeason    = 1;
let currentEpisode   = 1;

function playContent(id, season, episode) {
  const item = findById(id);
  if (!item) return;

  const saved = continueWatching[id];
  if (season === undefined) season  = saved?.season  ?? 1;
  if (episode === undefined) episode = saved?.episode ?? 1;

  currentItem      = item;
  currentSourceIdx = saved?.sourceIdx ?? 0;
  currentSeason    = season;
  currentEpisode   = episode;

  saveProgress();
  loadSource();
  playerOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  location.hash = `#play/${id}/${season}/${episode}`;

  if (item.type === 'show') {
    episodePicker.classList.remove('hidden');
    populateEpisodePicker(item);
  } else {
    episodePicker.classList.add('hidden');
  }
}

function loadSource() {
  const item = currentItem;
  const src  = SOURCES[currentSourceIdx];
  playerTitle.textContent = item.type === 'show'
    ? `${item.title} — S${String(currentSeason).padStart(2,'0')}E${String(currentEpisode).padStart(2,'0')} — ${src.label}`
    : `${item.title} — ${src.label}`;
  playerFrame.src = item.type === 'movie'
    ? src.movie(item.tmdbId)
    : src.show(item.tmdbId, currentSeason, currentEpisode);
  document.querySelectorAll('.server-card').forEach((card, i) => {
    card.classList.toggle('active-server', i === currentSourceIdx);
  });
  saveProgress();
}

async function populateEpisodePicker(item) {
  seasonSelect.innerHTML = '<option>Loading...</option>';
  episodeSelect.innerHTML = '';
  try {
    // Get season count from detail cache or fetch it
    let detail = detailCache[item.id];
    if (!detail) {
      detail = await fetchDetail({ ...item });
      detailCache[item.id] = detail;
      persistDetailCache();
    }
    const numSeasons = parseInt(detail.duration) || 1; // duration stores "X Seasons"

    seasonSelect.innerHTML = '';
    for (let s = 1; s <= numSeasons; s++) {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = `Season ${s}`;
      if (s === currentSeason) opt.selected = true;
      seasonSelect.appendChild(opt);
    }
    await loadEpisodes(item.tmdbId, currentSeason);
  } catch (_) {
    seasonSelect.innerHTML = '<option value="1">Season 1</option>';
    buildEpisodeOptions(12);
  }
}

async function loadEpisodes(tmdbId, season) {
  episodeSelect.innerHTML = '<option>Loading...</option>';
  try {
    const data = await tmdbFetch(`/tv/${tmdbId}/season/${season}`);
    const count = data.episodes?.length || 12;
    buildEpisodeOptions(count);
  } catch (_) {
    buildEpisodeOptions(12);
  }
}

function buildEpisodeOptions(count) {
  episodeSelect.innerHTML = '';
  for (let e = 1; e <= count; e++) {
    const opt = document.createElement('option');
    opt.value = e; opt.textContent = `Episode ${e}`;
    if (e === currentEpisode) opt.selected = true;
    episodeSelect.appendChild(opt);
  }
}

function closePlayer() {
  if (currentItem) saveProgress();
  playerOverlay.classList.add('hidden');
  playerFrame.src = '';
  episodePicker.classList.add('hidden');
  document.body.style.overflow = '';
  renderContinueWatching();
  currentItem = null;
  if (location.hash.startsWith('#play/')) location.hash = '#home';
}

/* ── CONTINUE WATCHING ── */
function saveProgress() {
  if (!currentItem) return;
  continueWatching[currentItem.id] = {
    id:        currentItem.id,
    season:    currentSeason,
    episode:   currentEpisode,
    sourceIdx: currentSourceIdx,
    watchedAt: Date.now(),
  };
  localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
}

async function renderContinueWatching() {
  const entries = Object.values(continueWatching)
    .sort((a, b) => b.watchedAt - a.watchedAt)
    .slice(0, 20);

  if (!entries.length) {
    continueSection.classList.add('hidden');
    return;
  }

  // Resolve items — fetch any not in cache
  const items = await Promise.all(entries.map(async entry => {
    let item = findById(entry.id);
    if (!item) {
      try {
        const tmdbId   = entry.id.slice(1);
        const type     = entry.id.startsWith('m') ? 'movie' : 'show';
        const endpoint = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
        const data     = await tmdbFetch(endpoint);
        item = type === 'movie' ? normalizeMovie(data) : normalizeShow(data);
        if (!allCache.watchlistFetched) allCache.watchlistFetched = [];
        allCache.watchlistFetched.push(item);
      } catch (_) { return null; }
    }
    return item ? { ...item, _progress: entry } : null;
  }));

  const valid = items.filter(Boolean);
  if (!valid.length) { continueSection.classList.add('hidden'); return; }

  continueSection.classList.remove('hidden');
  continueRow.innerHTML = '';
  valid.forEach(item => continueRow.appendChild(createContinueCard(item)));
}

function createContinueCard(item) {
  const p     = item._progress;
  const label = item.type === 'show'
    ? `S${String(p.season).padStart(2,'0')}E${String(p.episode).padStart(2,'0')}`
    : timeAgo(p.watchedAt);
  const thumb = item.thumb || `https://placehold.co/342x513/13131a/888?text=${encodeURIComponent(item.title)}`;

  const div = document.createElement('div');
  div.className = 'card continue-card';
  div.innerHTML = `
    <img src="${thumb}" alt="${item.title}" loading="lazy"
         onerror="this.src='https://placehold.co/342x513/13131a/888?text=No+Image'" />
    <div class="continue-badge">${label}</div>
    <div class="card-overlay">
      <button class="play-btn" aria-label="Resume">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <button class="remove-continue" aria-label="Remove" title="Remove from continue watching">&times;</button>
    </div>
    <div class="card-info">
      <div class="card-title">${item.title}</div>
      <div class="card-meta">
        <span>${item.year} &bull; ${item.type === 'show' ? 'TV' : 'Movie'}</span>
        <span class="card-score">&#9733; ${item.score}</span>
      </div>
    </div>
  `;
  div.querySelector('.play-btn').addEventListener('click', e => {
    e.stopPropagation();
    playContent(item.id, p.season, p.episode);
  });
  div.querySelector('.remove-continue').addEventListener('click', e => {
    e.stopPropagation();
    delete continueWatching[item.id];
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
    renderContinueWatching();
  });
  div.addEventListener('click', () => openModal(item.id));
  return div;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'Just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ── MODAL ── */
async function openModal(id) {
  let item = findById(id);
  if (!item) return;

  modalBanner.style.backgroundImage = item.banner ? `url('${item.banner}')` : 'none';
  modalBody.innerHTML = `<div class="modal-loading"><div class="spinner"></div></div>`;
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (!detailCache[id]) {
    detailCache[id] = await fetchDetail({ ...item });
    persistDetailCache();
  }
  item = detailCache[id];

  const inWL = watchlist.includes(item.id);
  modalBody.innerHTML = `
    <h2 class="modal-title">${item.title}</h2>
    <div class="modal-meta">
      <span class="score">&#9733; ${item.score}</span>
      <span>${item.year}</span>
      ${item.rating   ? `<span class="rating-badge">${item.rating}</span>` : ''}
      ${item.duration ? `<span>${item.duration}</span>` : ''}
      <span class="type-badge">${item.type === 'show' ? 'TV Show' : 'Movie'}</span>
    </div>
    <p class="modal-desc">${item.description || 'No description available.'}</p>
    <div class="modal-genres">
      ${item.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="closeModal();playContent('${item.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Watch Now
      </button>
      ${item.trailerKey ? `<button class="btn btn-secondary" onclick="openTrailer('${item.trailerKey}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Trailer
      </button>` : ''}
      <button class="btn btn-secondary" id="modalWlBtn" onclick="toggleWatchlist('${item.id}', this)">
        ${inWL ? '&#10003; In Watchlist' : '+ Watchlist'}
      </button>
    </div>
    <a class="tmdb-link" href="https://www.themoviedb.org/${item.type === 'show' ? 'tv' : 'movie'}/${item.tmdbId}"
       target="_blank" rel="noopener">View on TMDB</a>
  `;
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ── TRAILER ── */
function openTrailer(key) {
  let wrap = document.getElementById('trailerWrap');
  if (wrap) wrap.remove();
  wrap = document.createElement('div');
  wrap.id = 'trailerWrap';
  wrap.innerHTML = `
    <div class="trailer-overlay" onclick="this.parentElement.remove()"></div>
    <div class="trailer-box">
      <button class="trailer-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <iframe src="https://www.youtube.com/embed/${key}?autoplay=1" frameborder="0"
        allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>
  `;
  document.body.appendChild(wrap);
}

/* ── WATCHLIST ── */
function toggleWatchlist(id, btn) {
  const item = findById(id);
  const title = item?.title || 'Item';
  const isMini = btn?.classList.contains('wl-mini');
  if (watchlist.includes(id)) {
    watchlist = watchlist.filter(w => w !== id);
    if (btn) { btn.innerHTML = isMini ? '+' : '+ Watchlist'; btn.classList.remove('in-wl'); }
    showToast(`Removed "${title}" from watchlist`);
  } else {
    watchlist.push(id);
    if (btn) { btn.innerHTML = isMini ? '&#10003;' : '&#10003; In Watchlist'; btn.classList.add('in-wl'); }
    showToast(`Added "${title}" to watchlist`);
  }
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  updateWatchlistBadge();
  if (!watchlistSection.classList.contains('hidden')) renderWatchlistGrid();
}

function showWatchlistPage() {
  homeRows.classList.add('hidden');
  heroSection.classList.add('hidden');
  searchSection.classList.add('hidden');
  filteredSection.classList.add('hidden');
  watchlistSection.classList.remove('hidden');
  renderWatchlistGrid();
  setHash('#watchlist');
}

async function renderWatchlistGrid() {
  watchlistGrid.innerHTML = '';
  if (!watchlist.length) {
    watchlistEmpty.classList.remove('hidden');
    watchlistGrid.classList.add('hidden');
    updateWatchlistBadge();
    return;
  }
  watchlistEmpty.classList.add('hidden');
  watchlistGrid.classList.remove('hidden');

  // Items may not be in allCache if they were added in a previous session — fetch them
  const items = await Promise.all(watchlist.map(async id => {
    const cached = findById(id);
    if (cached) return cached;
    // Try to fetch from TMDB by parsing the id prefix
    try {
      const tmdbId = id.slice(1); // strip 'm' or 't'
      const type   = id.startsWith('m') ? 'movie' : 'show';
      const endpoint = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
      const data = await tmdbFetch(endpoint);
      const item = type === 'movie' ? normalizeMovie(data) : normalizeShow(data);
      // store so future lookups work
      if (!allCache.watchlistFetched) allCache.watchlistFetched = [];
      allCache.watchlistFetched.push(item);
      return item;
    } catch (_) { return null; }
  }));

  const valid = items.filter(Boolean);
  if (!valid.length) {
    watchlistEmpty.classList.remove('hidden');
    watchlistGrid.classList.add('hidden');
  } else {
    valid.forEach(item => watchlistGrid.appendChild(createCard(item)));
  }
  updateWatchlistBadge();
}

function updateWatchlistBadge() {
  // no-op: avatar element removed
}

/* ── SEARCH ── */
let searchTimeout;
let searchPage    = 1;
let lastQuery     = '';
let searchTypeFilter = 'all'; // 'all' | 'movie' | 'show'
let allSearchResults = [];

function handleSearch(query) {
  const q = query.trim();
  if (!q) {
    hideSuggestions();
    if (!searchSection.classList.contains('hidden')) showHome();
    return;
  }
  showSuggestions(q);
}

let suggestTimeout;
async function showSuggestions(q) {
  // show instantly from cache first
  const pool = [
    ...(allCache.trending   || []),
    ...(allCache.movies     || []),
    ...(allCache.shows      || []),
    ...(allCache.nowPlaying || []),
    ...(allCache.search     || []),
  ];
  const cacheHits = pool.filter(i => i.title.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  renderSuggestions(cacheHits, q, true);

  // then fetch live from TMDB
  clearTimeout(suggestTimeout);
  suggestTimeout = setTimeout(async () => {
    try {
      const results = await searchTMDB(q, 1);
      // merge: live results first, then any cache-only hits not already in results
      const ids = new Set(results.map(r => r.id));
      const merged = [...results, ...cacheHits.filter(c => !ids.has(c.id))].slice(0, 8);
      // store so findById works
      allCache.search = results;
      renderSuggestions(merged, q, false);
    } catch (_) { /* keep showing cache hits */ }
  }, 300);
}

function renderSuggestions(items, q, loading) {
  if (!items.length && !loading) {
    searchSuggestions.innerHTML = `<div class="suggestion-hint">No results for "<strong>${q}</strong>"</div>`;
    searchSuggestions.classList.remove('hidden');
    return;
  }

  const pool = [
    ...(allCache.trending || []), ...(allCache.movies || []),
    ...(allCache.shows || []),    ...(allCache.nowPlaying || []),
    ...(allCache.search || []),
  ];

  searchSuggestions.innerHTML = items.map(i => `
    <div class="suggestion-item" data-id="${i.id}">
      <img src="${i.thumb}" alt="" onerror="this.style.display='none'" />
      <div class="suggestion-info">
        <span class="suggestion-title">${highlight(i.title, q)}</span>
        <span class="suggestion-meta">${i.year} &bull; ${i.type === 'show' ? 'TV Show' : 'Movie'} &bull; &#9733; ${i.score}</span>
      </div>
    </div>
  `).join('') + (loading
    ? `<div class="suggestion-hint suggestion-loading">Searching TMDB...</div>`
    : `<div class="suggestion-hint">Press Enter for all results</div>`);

  searchSuggestions.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('mousedown', e => {
      e.preventDefault();
      // find in merged pool including freshly fetched search results
      const all = [...pool, ...(allCache.search || [])];
      const item = all.find(i => i.id === el.dataset.id);
      if (item) { hideSuggestions(); searchInput.value = item.title; openModal(item.id); }
    });
  });

  searchSuggestions.classList.remove('hidden');
}

function highlight(title, q) {
  const idx = title.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return title;
  return title.slice(0, idx)
    + `<mark>${title.slice(idx, idx + q.length)}</mark>`
    + title.slice(idx + q.length);
}

async function runSearch(q) {
  clearTimeout(searchTimeout);
  lastQuery        = q;
  searchPage       = 1;
  searchTypeFilter = 'all';
  hideSuggestions();
  homeRows.classList.add('hidden');
  heroSection.classList.add('hidden');
  filteredSection.classList.add('hidden');
  watchlistSection.classList.add('hidden');
  searchSection.classList.remove('hidden');
  searchTitle.textContent = `Results for "${q}"`;
  searchGrid.innerHTML = '<div class="row-loader">Searching...</div>';
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.type === 'all'));
  setHash(`#search/${encodeURIComponent(q)}`);
  try {
    const results = await searchTMDB(q, 1);
    allSearchResults = results;
    allCache.search  = results;
    renderGrid(searchGrid, results);
    updateLoadMoreBtn('searchLoadMore', results.length, searchGrid, loadMoreSearch);
  } catch (_) {
    searchGrid.innerHTML = '<p class="empty-msg">Search failed. Try again.</p>';
  }
}

function applySearchTypeFilter() {
  const filtered = searchTypeFilter === 'all'
    ? allSearchResults
    : allSearchResults.filter(i => i.type === searchTypeFilter);
  renderGrid(searchGrid, filtered);
  // update pill active state
  document.querySelectorAll('.filter-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.type === searchTypeFilter);
  });
}

function showSuggestionsFromCache(q) {
  const pool = [
    ...(allCache.trending   || []),
    ...(allCache.movies     || []),
    ...(allCache.shows      || []),
    ...(allCache.nowPlaying || []),
  ];
  const matches = pool
    .filter(i => i.title.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 6);

  if (!matches.length) {
    // still show the panel with a hint instead of hiding it
    searchSuggestions.innerHTML = `
      <div class="suggestion-hint">Press Enter to search for "<strong>${q}</strong>"</div>
    `;
    searchSuggestions.classList.remove('hidden');
    return;
  }

  searchSuggestions.innerHTML = matches.map(i => `
    <div class="suggestion-item" data-id="${i.id}">
      <img src="${i.thumb}" alt="" onerror="this.style.display='none'" />
      <div class="suggestion-info">
        <span class="suggestion-title">${i.title}</span>
        <span class="suggestion-meta">${i.year} &bull; ${i.type === 'show' ? 'TV' : 'Movie'} &bull; &#9733; ${i.score}</span>
      </div>
    </div>
  `).join('') + `<div class="suggestion-hint">Press Enter to search all results</div>`;

  searchSuggestions.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('mousedown', e => {
      e.preventDefault();
      const item = pool.find(i => i.id === el.dataset.id);
      if (item) {
        hideSuggestions();
        searchInput.value = item.title;
        openModal(item.id);
      }
    });
  });

  searchSuggestions.classList.remove('hidden');
}

function hideSuggestions() {
  searchSuggestions.classList.add('hidden');
  searchSuggestions.innerHTML = '';
}

async function loadMoreSearch() {
  searchPage++;
  const results = await searchTMDB(lastQuery, searchPage);
  allSearchResults = [...allSearchResults, ...results];
  allCache.search  = allSearchResults;
  applySearchTypeFilter();
  updateLoadMoreBtn('searchLoadMore', results.length, searchGrid, loadMoreSearch);
}

/* ── FILTER ── */
let filteredPage      = 1;
let currentFilterKey  = '';
let currentGenreId    = '';
let currentGenreLabel = '';

async function handleFilter(filter, label, genreId = '', genreLabel = '') {
  searchInput.value = '';
  hideSuggestions();
  if (filter === 'all') { showHome(); return; }
  currentFilterKey  = filter;
  currentGenreId    = genreId;
  currentGenreLabel = genreLabel;
  filteredPage = 1;
  homeRows.classList.add('hidden');
  searchSection.classList.add('hidden');
  watchlistSection.classList.add('hidden');
  filteredSection.classList.remove('hidden');
  filteredTitle.textContent = genreLabel ? `${label} — ${genreLabel}` : label;
  filteredGrid.innerHTML = '<div class="row-loader">Loading...</div>';
  heroSection.classList.remove('hidden');
  setHash(`#filter/${filter}/${genreId}/${encodeURIComponent(label)}/${encodeURIComponent(genreLabel)}`);

  try {
    const items = await getFilteredItems(filter, 1, genreId);
    allCache.filtered = items;
    renderGrid(filteredGrid, items);
    updateLoadMoreBtn('filteredLoadMore', items.length, filteredGrid, loadMoreFiltered);
    // update hero to a random item from this genre that has a banner
    const heroPool = items.filter(i => i.banner);
    if (heroPool.length) renderHero(heroPool[Math.floor(Math.random() * Math.min(5, heroPool.length))]);
  } catch (_) {
    filteredGrid.innerHTML = '<p class="empty-msg">Failed to load.</p>';
  }
}

async function loadMoreFiltered() {
  filteredPage++;
  const items = await getFilteredItems(currentFilterKey, filteredPage, currentGenreId);
  allCache.filtered = [...(allCache.filtered || []), ...items];
  renderGrid(filteredGrid, items, true);
  updateLoadMoreBtn('filteredLoadMore', items.length, filteredGrid, loadMoreFiltered);
}

async function getFilteredItems(filter, page, genreId = '') {
  if (filter === 'trending') return page === 1 ? (allCache.trending || await fetchTrending()) : [];
  if (filter === 'movie')    return fetchByGenre('movie', page, genreId);
  if (filter === 'show')     return fetchByGenre('tv',    page, genreId);
  return [];
}

function updateLoadMoreBtn(btnId, resultCount, container, handler) {
  let btn = document.getElementById(btnId);
  if (!btn) {
    btn = document.createElement('button');
    btn.id = btnId;
    btn.className = 'btn btn-secondary load-more-btn';
    btn.textContent = 'Load More';
    container.after(btn);
  }
  btn.style.display = resultCount >= 20 ? 'flex' : 'none';
  btn.onclick = handler;
}

function saveNavState(state) {
  // replaced by hash routing — no-op kept for safety
}

/* ── HASH ROUTING ── */
function setHash(hash) {
  location.hash = hash || '#';
}

let _restoring = false;

async function restoreFromHash() {
  if (_restoring) return;
  _restoring = true;
  const hash = decodeURIComponent(location.hash);
  if (!hash || hash === '#' || hash === '#home') {
    heroSection.classList.remove('hidden');
    _restoring = false;
    return;
  }
  homeRows.classList.add('hidden');
  heroSection.classList.add('hidden');
  if (hash === '#watchlist') {
    showWatchlistPage();
  } else if (hash.startsWith('#play/')) {
    const parts = hash.slice(6).split('/');
    const id      = parts[0];
    const season  = parseInt(parts[1]) || 1;
    const episode = parseInt(parts[2]) || 1;
    heroSection.classList.remove('hidden');
    homeRows.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 100)); // let cache settle
    playContent(id, season, episode);
  } else if (hash.startsWith('#search/')) {
    const q = hash.slice(8);
    searchInput.value = q;
    await runSearch(q);
  } else if (hash.startsWith('#filter/')) {
    const parts = hash.slice(8).split('/');
    const filter     = parts[0] || '';
    const genreId    = parts[1] || '';
    const label      = parts[2] ? decodeURIComponent(parts[2]) : filter;
    const genreLabel = parts[3] ? decodeURIComponent(parts[3]) : '';
    await handleFilter(filter, label, genreId, genreLabel);
  } else {
    heroSection.classList.remove('hidden');
    homeRows.classList.remove('hidden');
  }
  _restoring = false;
}

window.addEventListener('hashchange', restoreFromHash);

function showHome() {
  homeRows.classList.remove('hidden');
  heroSection.classList.remove('hidden');
  searchSection.classList.add('hidden');
  filteredSection.classList.add('hidden');
  watchlistSection.classList.add('hidden');
  ['searchLoadMore','filteredLoadMore'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  setHash('#home');
}

/* ── HELPERS ── */
function findById(id) {
  if (detailCache[id]) return detailCache[id];
  const pool = [
    ...(allCache.trending        || []),
    ...(allCache.movies          || []),
    ...(allCache.shows           || []),
    ...(allCache.nowPlaying      || []),
    ...(allCache.topShows        || []),
    ...(allCache.search          || []),
    ...(allCache.filtered        || []),
    ...(allCache.watchlistFetched|| []),
  ];
  return pool.find(c => c.id === id) || null;
}

function persistDetailCache() {
  // Only persist lightweight fields to avoid quota issues
  const slim = {};
  Object.entries(detailCache).forEach(([k, v]) => {
    slim[k] = { id: v.id, tmdbId: v.tmdbId, title: v.title, type: v.type,
      year: v.year, score: v.score, genre: v.genre, description: v.description,
      thumb: v.thumb, banner: v.banner, rating: v.rating, duration: v.duration,
      trailerKey: v.trailerKey };
  });
  try { localStorage.setItem('detailCache', JSON.stringify(slim)); } catch (_) {}
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

/* ── EVENTS ── */
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20));

document.querySelectorAll('.nav-links > li > a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    if (link.closest('.has-dropdown')) return; // handled by dropdown toggle below
    const filter = link.dataset.filter;
    const labels = { all: 'Home', trending: 'Trending', watchlist: 'My Watchlist' };
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    if (filter === 'watchlist') showWatchlistPage();
    else handleFilter(filter, labels[filter] || filter);
    navLinks.classList.remove('open');
  });
});

// Dropdown toggle — parent link ONLY opens/closes dropdown, never navigates
document.querySelectorAll('.has-dropdown > a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const li = link.parentElement;
    const dropdown = link.nextElementSibling;
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.has-dropdown').forEach(l => l.classList.remove('open'));
    if (!isOpen) {
      dropdown.classList.add('open');
      li.classList.add('open');
    }
  });
});

// Dropdown items — these actually navigate
document.querySelectorAll('.nav-dropdown a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const filter     = link.dataset.filter;
    const genreId    = link.dataset.genre ?? '';
    const genreLabel = link.textContent.trim();
    const labels     = { movie: 'Movies', show: 'TV Shows' };

    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.has-dropdown').forEach(l => l.classList.remove('open'));
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    link.closest('.has-dropdown').querySelector('a').classList.add('active');

    handleFilter(filter, labels[filter] || genreLabel, genreId, genreId ? genreLabel : '');
    navLinks.classList.remove('open');
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.has-dropdown')) {
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.has-dropdown').forEach(l => l.classList.remove('open'));
  }
});

document.querySelector('.logo').addEventListener('click', () => {
  searchInput.value = '';
  document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
  document.querySelector('[data-filter="all"]').classList.add('active');
  showHome();
});



clearWatchlist.addEventListener('click', () => {
  if (!watchlist.length) return;
  watchlist = [];
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  updateWatchlistBadge();
  renderWatchlistGrid();
  showToast('Watchlist cleared');
});

searchInput.addEventListener('input', e => {
  const q = e.target.value.trim();
  if (!q) { hideSuggestions(); return; }
  showSuggestions(q);
});
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) runSearch(q);
  }
});
searchInput.addEventListener('blur', () => setTimeout(hideSuggestions, 150));
searchInput.addEventListener('focus', e => { if (e.target.value.trim()) showSuggestions(e.target.value.trim()); });

// Make search icon tap-to-focus on mobile
document.querySelector('.search-icon').addEventListener('click', () => searchInput.focus());

document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    searchTypeFilter = pill.dataset.type;
    applySearchTypeFilter();
  });
});
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
playerClose.addEventListener('click', closePlayer);
playerOverlay.addEventListener('click', e => { if (e.target === playerOverlay) closePlayer(); });

playerFullscreen.addEventListener('click', () => {
  const box = document.querySelector('.player-wrap');
  if (box.requestFullscreen) box.requestFullscreen();
  else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
});

// Season/episode selectors
seasonSelect.addEventListener('change', async () => {
  currentSeason  = parseInt(seasonSelect.value);
  currentEpisode = 1;
  await loadEpisodes(currentItem.tmdbId, currentSeason);
  episodeSelect.value = 1;
  loadSource();
  location.hash = `#play/${currentItem.id}/${currentSeason}/${currentEpisode}`;
});
episodeSelect.addEventListener('change', () => {
  currentEpisode = parseInt(episodeSelect.value);
  loadSource();
  location.hash = `#play/${currentItem.id}/${currentSeason}/${currentEpisode}`;
});

// Build server panel
const serverGrid = document.getElementById('serverGrid');
const serverPanel = document.getElementById('serverPanel');
const serverPanelBtn = document.getElementById('serverPanelBtn');
const serverBackdrop = document.getElementById('serverBackdrop');

function openServerPanel() {
  serverPanel.classList.remove('hidden');
  serverBackdrop.classList.remove('hidden');
}
function closeServerPanel() {
  serverPanel.classList.add('hidden');
  serverBackdrop.classList.add('hidden');
}

SOURCES.forEach((src, i) => {
  const card = document.createElement('button');
  card.className = 'server-card' + (i === 0 ? ' active-server' : '');
  card.dataset.idx = i;
  card.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
    <span class="server-card-name">${src.label}</span>
    <span class="server-card-tag">${src.tag}</span>
  `;
  card.addEventListener('click', () => {
    currentSourceIdx = i;
    loadSource();
    document.querySelectorAll('.server-card').forEach(c => c.classList.remove('active-server'));
    card.classList.add('active-server');
    closeServerPanel();
  });
  serverGrid.appendChild(card);
});

serverPanelBtn.addEventListener('click', e => {
  e.stopPropagation();
  serverPanel.classList.contains('hidden') ? openServerPanel() : closeServerPanel();
});

document.addEventListener('click', e => {
  if (!e.target.closest('#serverPanel') && !e.target.closest('#serverPanelBtn')) {
    closeServerPanel();
  }
});

serverBackdrop.addEventListener('click', closeServerPanel);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closePlayer(); }
});
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

// Mobile bottom nav
const bottomNav = document.getElementById('bottomNav');
function initBottomNav() {
  if (window.innerWidth <= 480) bottomNav.style.display = 'flex';
  else bottomNav.style.display = 'none';
}
window.addEventListener('resize', initBottomNav);
initBottomNav();

bottomNav.querySelectorAll('.bottom-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    bottomNav.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    const labels = { all: 'Home', movie: 'Movies', show: 'TV Shows', trending: 'Trending', watchlist: 'My Watchlist' };
    if (filter === 'watchlist') showWatchlistPage();
    else if (filter === 'all') { showHome(); }
    else handleFilter(filter, labels[filter]);
  });
});

// Save progress when tab is closed/refreshed
window.addEventListener('beforeunload', () => { if (currentItem) saveProgress(); });

/* ── DRAG SCROLL ROWS ── */
document.querySelectorAll('.row').forEach(row => {
  let isDown = false, startX, scrollLeft;
  row.addEventListener('mousedown', e => {
    isDown = true; row.classList.add('dragging');
    startX = e.pageX - row.offsetLeft; scrollLeft = row.scrollLeft;
  });
  row.addEventListener('mouseleave', () => { isDown = false; row.classList.remove('dragging'); });
  row.addEventListener('mouseup', () => { isDown = false; row.classList.remove('dragging'); });
  row.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    row.scrollLeft = scrollLeft - (e.pageX - row.offsetLeft - startX);
  });
});

init();
