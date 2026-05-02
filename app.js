
let watchlist   = JSON.parse(localStorage.getItem('watchlist') || '[]');
let allCache    = {};
let detailCache = JSON.parse(localStorage.getItem('detailCache') || '{}');
let continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '{}');

const navbar           = document.getElementById('navbar');
const heroBg           = document.getElementById('heroBg');
const heroContent      = document.getElementById('heroContent');
const trendingRow      = document.getElementById('trendingRow');
const moviesRow        = document.getElementById('moviesRow');
const showsRow         = document.getElementById('showsRow');
const newRow           = document.getElementById('newRow');
const topShowsRow      = document.getElementById('topShowsRow');
const topMoviesRow     = document.getElementById('topMoviesRow');
const upcomingRow      = document.getElementById('upcomingRow');
const airingTodayRow   = document.getElementById('airingTodayRow');
const actionMoviesRow  = document.getElementById('actionMoviesRow');
const comedyMoviesRow  = document.getElementById('comedyMoviesRow');
const horrorMoviesRow  = document.getElementById('horrorMoviesRow');
const scifiMoviesRow   = document.getElementById('scifiMoviesRow');
const dramaShowsRow    = document.getElementById('dramaShowsRow');
const comedyShowsRow   = document.getElementById('comedyShowsRow');
const crimeShowsRow    = document.getElementById('crimeShowsRow');
const animationRow     = document.getElementById('animationRow');
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
const watchlistHeart   = document.getElementById('watchlistHeart');
const heroSection      = document.getElementById('hero');
const loadingScreen    = document.getElementById('loadingScreen');
const mainContent      = document.getElementById('mainContent');
const playerOverlay    = document.getElementById('playerOverlay');
const playerFrame      = document.getElementById('playerFrame');
const playerClose      = document.getElementById('playerClose');
const playerTitle      = document.getElementById('playerTitle');
const playerSubtitle   = document.getElementById('playerSubtitle');

const episodePicker    = document.getElementById('episodePicker');
const seasonSelect     = document.getElementById('seasonSelect');
const episodeSelect    = document.getElementById('episodeSelect');

const continueRow      = document.getElementById('continueRow');
const continueSection  = document.getElementById('continueSection');
const genreBrowserSection = document.getElementById('genreBrowserSection');

async function init() {
  showLoading(true);

  ['searchLoadMore', 'filteredLoadMore'].forEach(id => {
    clearInfiniteScroll(id);
  });

  document.querySelectorAll('.load-more-btn').forEach(btn => btn.remove());
  
  try {

    const [
      trending, 
      movies, 
      shows, 
      nowPlaying, 
      topShows,
      topMovies,
      upcoming,
      airingToday,
      actionMovies,
      comedyMovies,
      horrorMovies,
      scifiMovies,
      dramaShows,
      comedyShows,
      crimeShows,
      animation
    ] = await Promise.all([
      fetchTrending(),
      fetchPopularMovies(),
      fetchPopularShows(),
      fetchNowPlaying(),
      fetchTopRatedShows(),
      fetchTopRatedMovies(),
      fetchUpcoming(),
      fetchAiringToday(),
      fetchByGenre('movie', 1, '28'), // Action
      fetchByGenre('movie', 1, '35'), // Comedy
      fetchByGenre('movie', 1, '27'), // Horror
      fetchByGenre('movie', 1, '878'), // Sci-Fi
      fetchByGenre('show', 1, '18'), // Drama
      fetchByGenre('show', 1, '35'), // Comedy
      fetchByGenre('show', 1, '80'), // Crime
      fetchByGenre('movie', 1, '16').then(movies => 
        fetchByGenre('show', 1, '16').then(shows => [...movies, ...shows])
      ) // Animation (both movies and shows)
    ]);

    allCache = { 
      trending, movies, shows, nowPlaying, topShows, topMovies, upcoming, airingToday,
      actionMovies, comedyMovies, horrorMovies, scifiMovies, 
      dramaShows, comedyShows, crimeShows, animation
    };

    const heroPool = trending.filter(i => i.banner);
    renderHero(heroPool[Math.floor(Math.random() * Math.min(5, heroPool.length))]);

    renderRow(trendingRow, trending.slice(0, 20));
    renderRow(moviesRow, movies.slice(0, 20));
    renderRow(newRow, nowPlaying.slice(0, 20));
    renderRow(showsRow, shows.slice(0, 20));
    renderRow(topShowsRow, topShows.slice(0, 20));
    renderRow(topMoviesRow, topMovies.slice(0, 20));
    renderRow(upcomingRow, upcoming.slice(0, 20));
    renderRow(airingTodayRow, airingToday.slice(0, 20));
    renderRow(actionMoviesRow, actionMovies.slice(0, 20));
    renderRow(comedyMoviesRow, comedyMovies.slice(0, 20));
    renderRow(horrorMoviesRow, horrorMovies.slice(0, 20));
    renderRow(scifiMoviesRow, scifiMovies.slice(0, 20));
    renderRow(dramaShowsRow, dramaShows.slice(0, 20));
    renderRow(comedyShowsRow, comedyShows.slice(0, 20));
    renderRow(crimeShowsRow, crimeShows.slice(0, 20));
    renderRow(animationRow, animation.slice(0, 20));

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
  setupNewPlayer(item);
  playerOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  location.hash = `#play/${id}/${season}/${episode}`;

  if (item.type === 'show') {
    populateEpisodePicker(item);
    setupEpisodeSection(item);
  } else {
    document.getElementById('episodeSection').classList.add('hidden');
  }
  
  setupRecommendations(item);
}

function loadSource() {
  const item = currentItem;
  const src  = SOURCES[currentSourceIdx];
  playerTitle.textContent = item.title;
  if (playerSubtitle) {
    if (item.type === 'show') {
      const episodeData = window.currentEpisodeData || [];
      const episode = episodeData[currentEpisode - 1];
      const episodeName = episode?.name || `Episode ${currentEpisode}`;
      playerSubtitle.textContent = `S${String(currentSeason).padStart(2,'0')}E${String(currentEpisode).padStart(2,'0')}: ${episodeName} — ${src.label}`;
    } else {
      playerSubtitle.textContent = src.label;
    }
  }
  playerFrame.src = item.type === 'movie'
    ? src.movie(item.tmdbId)
    : src.show(item.tmdbId, currentSeason, currentEpisode);
  document.querySelectorAll('.server-card').forEach((card, i) => {
    card.classList.toggle('active-server', i === currentSourceIdx);
  });
  saveProgress();
  updateNextBtn();
  renderSidebarEpisodes();
}

async function populateEpisodePicker(item) {
  seasonSelect.innerHTML = '<option>Loading...</option>';
  episodeSelect.innerHTML = '';
  try {

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
    const episodes = data.episodes || [];

    window.currentEpisodeData = episodes;
    
    const count = episodes.length || 12;
    buildEpisodeOptions(count);
  } catch (_) {
    window.currentEpisodeData = [];
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
  updateNextBtn();
  renderSidebarEpisodes();
}

function renderSidebarEpisodes() {

  console.log('renderSidebarEpisodes called but not implemented in new layout');
}

function renderSidebarServers() {

  console.log('renderSidebarServers called but not implemented in new layout');
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
  `;
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

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

  const items = await Promise.all(watchlist.map(async id => {
    const cached = findById(id);
    if (cached) return cached;

    try {
      const tmdbId = id.slice(1); // strip 'm' or 't'
      const type   = id.startsWith('m') ? 'movie' : 'show';
      const endpoint = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
      const data = await tmdbFetch(endpoint);
      const item = type === 'movie' ? normalizeMovie(data) : normalizeShow(data);

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
  const count = watchlist.length;
  let badge = watchlistHeart.querySelector('.wl-badge');
  if (count > 0) {
    watchlistHeart.classList.add('has-items');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'wl-badge';
      watchlistHeart.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : count;
  } else {
    watchlistHeart.classList.remove('has-items');
    if (badge) badge.remove();
  }
}

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

  const pool = [
    ...(allCache.trending   || []),
    ...(allCache.movies     || []),
    ...(allCache.shows      || []),
    ...(allCache.nowPlaying || []),
    ...(allCache.search     || []),
  ];
  const cacheHits = pool.filter(i => i.title.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  renderSuggestions(cacheHits, q, true);

  clearTimeout(suggestTimeout);
  suggestTimeout = setTimeout(async () => {
    try {
      const results = await searchTMDB(q, 1);

      const ids = new Set(results.map(r => r.id));
      const merged = [...results, ...cacheHits.filter(c => !ids.has(c.id))].slice(0, 8);

      allCache.search = results;
      renderSuggestions(merged, q, false);
    } catch (_) {  }
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

  clearInfiniteScroll('searchLoadMore');
  
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
  try {
    const results = await searchTMDB(lastQuery, searchPage);
    if (!results.length) { clearInfiniteScroll('searchLoadMore'); return; }
    allSearchResults = [...allSearchResults, ...results];
    allCache.search  = allSearchResults;
    applySearchTypeFilter();
    updateLoadMoreBtn('searchLoadMore', results.length, searchGrid, loadMoreSearch);
  } catch (error) {
    clearInfiniteScroll('searchLoadMore');
  }
}

let filteredPage      = 1;
let currentFilterKey  = '';
let currentGenreId    = '';
let currentGenreLabel = '';

async function handleFilter(filter, label, genreId = '', genreLabel = '') {
  console.log(`handleFilter called with: filter=${filter}, label=${label}, genreId=${genreId}, genreLabel=${genreLabel}`);
  
  searchInput.value = '';
  hideSuggestions();
  if (filter === 'all') { showHome(); return; }

  if (filter === 'browse_genres') {
    showGenreBrowser();
    return;
  }

  clearInfiniteScroll('filteredLoadMore');
  
  currentFilterKey  = filter;
  currentGenreId    = genreId;
  currentGenreLabel = genreLabel;
  filteredPage = 1;

  homeRows.classList.add('hidden');
  searchSection.classList.add('hidden');
  watchlistSection.classList.add('hidden');
  genreBrowserSection.classList.add('hidden');

  filteredSection.classList.remove('hidden');
  filteredTitle.textContent = genreLabel ? `${label} — ${genreLabel}` : label;
  filteredGrid.innerHTML = '<div class="row-loader">Loading...</div>';
  heroSection.classList.remove('hidden');
  setHash(`#filter/${filter}/${genreId}/${encodeURIComponent(label)}/${encodeURIComponent(genreLabel)}`);

  try {
    console.log('Fetching items...');
    const items = await getFilteredItems(filter, 1, genreId);
    console.log(`Received ${items.length} items`);
    
    if (items.length === 0) {
      filteredGrid.innerHTML = '<p class="empty-msg">No content found for this genre.</p>';
      return;
    }
    
    allCache.filtered = items;
    renderGrid(filteredGrid, items);
    updateLoadMoreBtn('filteredLoadMore', items.length, filteredGrid, loadMoreFiltered);

    const heroPool = items.filter(i => i.banner);
    if (heroPool.length) {
      renderHero(heroPool[Math.floor(Math.random() * Math.min(5, heroPool.length))]);
    }
  } catch (error) {
    console.error('Error in handleFilter:', error);
    filteredGrid.innerHTML = '<p class="empty-msg">Failed to load content. Please try again.</p>';
  }
}

async function loadMoreFiltered() {
  filteredPage++;
  try {
    const items = await getFilteredItems(currentFilterKey, filteredPage, currentGenreId);
    if (!items.length) { clearInfiniteScroll('filteredLoadMore'); return; }
    allCache.filtered = [...(allCache.filtered || []), ...items];
    renderGrid(filteredGrid, items, true);
    updateLoadMoreBtn('filteredLoadMore', items.length, filteredGrid, loadMoreFiltered);
  } catch (error) {
    clearInfiniteScroll('filteredLoadMore');
  }
}

async function getFilteredItems(filter, page, genreId = '') {
  if (filter === 'trending')         return page === 1 ? (allCache.trending || await fetchTrending()) : [];
  if (filter === 'movie')            return await fetchByGenre('movie', page, genreId);
  if (filter === 'show')             return await fetchByGenre('show', page, genreId);
  if (filter === 'new')              return page === 1 ? await fetchNowPlaying() : [];
  if (filter === 'browse')           return page === 1 ? (allCache.trending || await fetchTrending()) : [];
  if (filter === 'browse_genres')    return [];
  if (filter === 'top_rated')        return await fetchTopRatedShows(page);
  if (filter === 'top_rated_movies') return await fetchTopRatedMovies(page);
  if (filter === 'collections')      return await fetchByGenre('movie', page, '');
  if (filter === 'countries')        return await fetchByGenre('movie', page, '');
  if (filter === 'networks')         return await fetchByGenre('show', page, '');
  if (filter === 'movies_2026')      return await fetchMovies2026(page);
  if (filter === 'now_playing')      return page === 1 ? await fetchNowPlaying() : [];
  if (filter === 'upcoming')         return await fetchUpcoming(page);
  if (filter === 'airing_today')     return await fetchAiringToday(page);
  return [];
}

function updateLoadMoreBtn(btnId, resultCount, container, handler) {
  clearInfiniteScroll(btnId);
  if (resultCount >= 20) {
    setupInfiniteScroll(container, handler, btnId);
  }
}

const scrollObservers = new Map();

function setupInfiniteScroll(container, loadMoreHandler, observerId) {

  if (scrollObservers.has(observerId)) {
    scrollObservers.get(observerId).disconnect();
  }

  let sentinel = document.getElementById(`${observerId}-sentinel`);
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = `${observerId}-sentinel`;
    sentinel.className = 'scroll-sentinel';
    sentinel.innerHTML = '<div class="loading-indicator hidden"><div class="spinner"></div><p>Loading more...</p></div>';
    container.after(sentinel);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.loading) {
          entry.target.dataset.loading = 'true';

          const indicator = entry.target.querySelector('.loading-indicator');
          if (indicator) indicator.classList.remove('hidden');
          
          loadMoreHandler().finally(() => {
            entry.target.dataset.loading = 'false';

            if (indicator) indicator.classList.add('hidden');
          });
        }
      });
    },
    {
      rootMargin: '100px' // Trigger 100px before the sentinel comes into view
    }
  );
  
  observer.observe(sentinel);
  scrollObservers.set(observerId, observer);
}

function clearInfiniteScroll(observerId) {
  if (scrollObservers.has(observerId)) {
    scrollObservers.get(observerId).disconnect();
    scrollObservers.delete(observerId);
  }
  
  const sentinel = document.getElementById(`${observerId}-sentinel`);
  if (sentinel) {
    sentinel.remove();
  }

  const oldBtn = document.getElementById(observerId);
  if (oldBtn) {
    oldBtn.remove();
  }
}

function saveNavState(state) {

}

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

window.addEventListener('hashchange', () => {
  if (!playerOverlay.classList.contains('hidden')) return;
  restoreFromHash();
});

function showHome() {
  homeRows.classList.remove('hidden');
  heroSection.classList.remove('hidden');
  searchSection.classList.add('hidden');
  filteredSection.classList.add('hidden');
  watchlistSection.classList.add('hidden');
  genreBrowserSection.classList.add('hidden');

  ['searchLoadMore','filteredLoadMore'].forEach(id => {
    clearInfiniteScroll(id);
  });
  
  setHash('#home');
}

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

  const slim = {};
  Object.entries(detailCache).forEach(([k, v]) => {
    slim[k] = { id: v.id, tmdbId: v.tmdbId, title: v.title, type: v.type,
      year: v.year, score: v.score, genre: v.genre, description: v.description,
      thumb: v.thumb, banner: v.banner, rating: v.rating, duration: v.duration,
      trailerKey: v.trailerKey };
  });
  try { localStorage.setItem('detailCache', JSON.stringify(slim)); } catch (_) {}
}

let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20));

document.querySelectorAll('.nav-center > li > a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    if (link.closest('.has-dropdown')) return; // handled by dropdown toggle below
    const filter = link.dataset.filter;
    const labels = { all: 'Home', trending: 'Trending', watchlist: 'My Watchlist', new: 'New', browse: 'Browse',
      genres: 'Genres', top_rated: 'Top Rated', collections: 'Collections', countries: 'Countries',
      networks: 'Networks', movies_2026: '2026 Movies', now_playing: 'Now Playing',
      upcoming: 'Upcoming', airing_today: 'Airing Today' };
    document.querySelectorAll('.nav-center a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    if (filter === 'watchlist') showWatchlistPage();
    else handleFilter(filter, labels[filter] || filter);
    navLinks.classList.remove('open');
  });
});

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

document.querySelectorAll('.nav-dropdown a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const filter     = link.dataset.filter;
    const genreId    = link.dataset.genre ?? '';
    const genreLabel = link.textContent.trim();
    const labels = {
      movie: 'Movies', show: 'TV Shows',
      trending: 'Trending', genres: 'Genres', top_rated: 'Top Rated',
      collections: 'Collections', countries: 'Countries', networks: 'Networks',
      movies_2026: '2026 Movies', now_playing: 'Now Playing',
      upcoming: 'Upcoming', airing_today: 'Airing Today',
    };

    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.has-dropdown').forEach(l => l.classList.remove('open'));
    document.querySelectorAll('.nav-center a').forEach(l => l.classList.remove('active'));
    link.closest('.has-dropdown').querySelector('a').classList.add('active');

    handleFilter(filter, labels[filter] || genreLabel, genreId, genreId ? genreLabel : '');
    navLinks.classList.remove('open');
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.has-dropdown')) {
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.has-dropdown').forEach(l => l.classList.remove('open'));
  }
});

document.querySelector('.logo').addEventListener('click', () => {
  searchInput.value = '';
  document.querySelectorAll('.nav-center a').forEach(l => l.classList.remove('active'));
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

const serverGrid = document.getElementById('serverGrid');
const serverPanel = document.getElementById('serverPanel');
const serverPanelBtn = document.getElementById('serverPanelBtn');
const serverBackdrop = document.getElementById('serverBackdrop');

function openServerPanel() {
  serverPanel?.classList.remove('hidden');
  serverBackdrop?.classList.remove('hidden');
}
function closeServerPanel() {
  serverPanel?.classList.add('hidden');
  serverBackdrop?.classList.add('hidden');
}

if (serverGrid) {
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
}

document.addEventListener('click', e => {
  if (!e.target.closest('#serverPanel') && !e.target.closest('#serverPanelBtn')) {
    closeServerPanel();
  }
});

if (serverBackdrop) serverBackdrop.addEventListener('click', closeServerPanel);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closePlayer(); }
});
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

watchlistHeart.addEventListener('click', () => {
  document.querySelectorAll('.nav-center a').forEach(l => l.classList.remove('active'));
  showWatchlistPage();
});

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

window.addEventListener('beforeunload', () => { if (currentItem) saveProgress(); });

function applyDragScroll(el) {
  let isDown = false, startX, scrollLeft, hasDragged = false;

  el.addEventListener('mousedown', e => {
    isDown = true;
    hasDragged = false;
    el.classList.add('dragging');
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    e.preventDefault();
  });

  el.addEventListener('mouseleave', () => {
    isDown = false;
    el.classList.remove('dragging');
  });

  el.addEventListener('mouseup', () => {
    isDown = false;
    el.classList.remove('dragging');
    if (hasDragged) {
      setTimeout(() => { hasDragged = false; }, 100);
    }
  });

  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 5) hasDragged = true;
    el.scrollLeft = Math.max(0, scrollLeft - walk);
  });

  el.addEventListener('click', e => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

document.querySelectorAll('.row').forEach(applyDragScroll);

const recommendationsGrid = document.getElementById('recommendationsGrid');
if (recommendationsGrid) applyDragScroll(recommendationsGrid);

let autoplayTimer = null;
const AUTOPLAY_SECS = 10;
const RING_CIRC = 94.2; // 2π×15

async function goNextEpisode() {
  const totalEps     = episodeSelect.options.length;
  const totalSeasons = seasonSelect.options.length;
  const nextEp       = currentEpisode + 1;
  const nextSeason   = currentSeason + 1;

  if (nextEp <= totalEps) {
    currentEpisode = nextEp;
    episodeSelect.value = currentEpisode;
  } else if (nextSeason <= totalSeasons) {
    currentSeason = nextSeason;
    currentEpisode = 1;
    seasonSelect.value = currentSeason;
    await loadEpisodes(currentItem.tmdbId, currentSeason);
    episodeSelect.value = 1;
  } else {
    showToast('No more episodes');
    return;
  }
  loadSource();
  location.hash = `#play/${currentItem.id}/${currentSeason}/${currentEpisode}`;
}

function updateNextBtn() {
  if (!currentItem || currentItem.type !== 'show') {

    return;
  }
  const totalEps     = episodeSelect.options.length;
  const totalSeasons = seasonSelect.options.length;
  const hasNext = (currentEpisode + 1 <= totalEps) || (currentSeason + 1 <= totalSeasons);

}

init();

document.addEventListener('click', (e) => {
  if (e.target.closest('.row-arrow')) {
    const btn = e.target.closest('.row-arrow');
    const filter = btn.dataset.filter;
    const genre = btn.dataset.genre || '';
    const label = btn.dataset.label || '';
    const genreLabel = btn.dataset.genreLabel || '';

    if (filter === 'trending') {
      handleFilter('trending', 'Trending This Week');
    } else if (filter === 'top_rated_movies') {
      handleFilter('top_rated_movies', 'Top Rated Movies');
    } else if (genre) {

      handleFilter(filter, label, genre, genreLabel);
    } else {

      handleFilter(filter, label);
    }
  }
});

const diceBtn = document.getElementById('diceBtn');
const luckyOverlay = document.getElementById('luckyOverlay');
const luckyClose = document.getElementById('luckyClose');

function openLuckyModal() {
  luckyOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLuckyModal() {
  luckyOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function getRandomItem(type = 'any') {
  let pool = [];

  console.log('allCache contents:', Object.keys(allCache));
  
  if (type === 'movie') {

    pool = [
      ...(allCache.movies || []),
      ...(allCache.nowPlaying || []),
      ...(allCache.topMovies || []),
      ...(allCache.actionMovies || []),
      ...(allCache.comedyMovies || []),
      ...(allCache.horrorMovies || []),
      ...(allCache.scifiMovies || [])
    ].filter(item => item && item.type === 'movie');
  } else if (type === 'show') {

    pool = [
      ...(allCache.shows || []),
      ...(allCache.topShows || []),
      ...(allCache.dramaShows || []),
      ...(allCache.comedyShows || []),
      ...(allCache.crimeShows || [])
    ].filter(item => item && item.type === 'show');
  } else {

    pool = [
      ...(allCache.trending || []),
      ...(allCache.movies || []),
      ...(allCache.shows || []),
      ...(allCache.nowPlaying || []),
      ...(allCache.topShows || [])
    ].filter(item => item);
  }

  const uniquePool = pool.filter((item, index, self) => 
    index === self.findIndex(i => i.id === item.id)
  );
  
  console.log(`Pool for type "${type}":`, uniquePool.length, 'items');
  
  if (uniquePool.length === 0) {
    console.log('No items found in pool');
    return null;
  }
  
  const randomItem = uniquePool[Math.floor(Math.random() * uniquePool.length)];
  console.log('Selected random item:', randomItem);
  return randomItem;
}

async function feelingLucky(type) {
  closeLuckyModal();

  showToast('Finding something awesome...');

  setTimeout(() => {
    try {
      let randomItem = getRandomItem(type);

      if (!randomItem && type !== 'any') {
        console.log(`No ${type} found, trying any type...`);
        randomItem = getRandomItem('any');
      }

      if (!randomItem) {
        console.log('No cached items, trying to get from DOM...');
        const cards = document.querySelectorAll('.card');
        if (cards.length > 0) {
          const randomCard = cards[Math.floor(Math.random() * cards.length)];
          const cardTitle = randomCard.querySelector('.card-title')?.textContent;
          if (cardTitle) {
            randomCard.click(); // Simulate clicking the card
            return;
          }
        }
      }
      
      if (randomItem) {
        console.log('Opening modal for:', randomItem.title);

        openModal(randomItem.id);
      } else {
        console.log('No content found anywhere');
        showToast('Oops! No content available. Try refreshing the page.');
      }
    } catch (error) {
      console.error('Error in feelingLucky:', error);
      showToast('Something went wrong. Please try again.');
    }
  }, 800);
}

diceBtn.addEventListener('click', openLuckyModal);

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') document.body.classList.add('light-mode');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

document.addEventListener('contextmenu', e => e.preventDefault());

luckyClose.addEventListener('click', closeLuckyModal);

luckyOverlay.addEventListener('click', (e) => {
  if (e.target === luckyOverlay) {
    closeLuckyModal();
  }
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.lucky-btn')) {
    const btn = e.target.closest('.lucky-btn');
    const type = btn.dataset.type;
    feelingLucky(type);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !luckyOverlay.classList.contains('hidden')) {
    closeLuckyModal();
  }
});

let modalStartY = 0;
let modalCurrentY = 0;
let modalIsDragging = false;
let modalInitialTransform = 0;

function initModalSwipe() {
  const modal = document.querySelector('.modal');
  const dragHandle = document.querySelector('.modal-drag-handle');
  
  if (!modal || !dragHandle) return;

  dragHandle.addEventListener('touchstart', handleModalTouchStart, { passive: false });
  modal.addEventListener('touchstart', handleModalTouchStart, { passive: false });
  document.addEventListener('touchmove', handleModalTouchMove, { passive: false });
  document.addEventListener('touchend', handleModalTouchEnd);

  dragHandle.addEventListener('mousedown', handleModalMouseStart);
  modal.addEventListener('mousedown', handleModalMouseStart);
  document.addEventListener('mousemove', handleModalMouseMove);
  document.addEventListener('mouseup', handleModalMouseEnd);
}

function handleModalTouchStart(e) {
  if (window.innerWidth > 540) return; // Only on mobile
  
  modalStartY = e.touches[0].clientY;
  modalIsDragging = true;
  modalInitialTransform = 0;
  
  const modal = document.querySelector('.modal');
  modal.style.transition = 'none';
}

function handleModalMouseStart(e) {
  if (window.innerWidth > 540) return; // Only on mobile
  
  modalStartY = e.clientY;
  modalIsDragging = true;
  modalInitialTransform = 0;
  
  const modal = document.querySelector('.modal');
  modal.style.transition = 'none';
  e.preventDefault();
}

function handleModalTouchMove(e) {
  if (!modalIsDragging || window.innerWidth > 540) return;
  
  modalCurrentY = e.touches[0].clientY;
  const deltaY = modalCurrentY - modalStartY;

  if (deltaY > 0) {
    const modal = document.querySelector('.modal');
    modal.style.transform = `translateY(${deltaY}px)`;

    const overlay = document.querySelector('.modal-overlay');
    const opacity = Math.max(0.3, 1 - (deltaY / 300));
    overlay.style.background = `rgba(0,0,0,${0.88 * opacity})`;
  }
}

function handleModalMouseMove(e) {
  if (!modalIsDragging || window.innerWidth > 540) return;
  
  modalCurrentY = e.clientY;
  const deltaY = modalCurrentY - modalStartY;

  if (deltaY > 0) {
    const modal = document.querySelector('.modal');
    modal.style.transform = `translateY(${deltaY}px)`;

    const overlay = document.querySelector('.modal-overlay');
    const opacity = Math.max(0.3, 1 - (deltaY / 300));
    overlay.style.background = `rgba(0,0,0,${0.88 * opacity})`;
  }
}

function handleModalTouchEnd(e) {
  if (!modalIsDragging || window.innerWidth > 540) return;
  
  const deltaY = modalCurrentY - modalStartY;
  const modal = document.querySelector('.modal');
  const overlay = document.querySelector('.modal-overlay');
  
  modal.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  overlay.style.transition = 'background 0.3s ease';

  if (deltaY > 100) {
    modal.style.transform = 'translateY(100%)';
    overlay.style.background = 'rgba(0,0,0,0)';
    setTimeout(() => {
      closeModal();

      modal.style.transform = '';
      modal.style.transition = '';
      overlay.style.background = '';
      overlay.style.transition = '';
    }, 300);
  } else {

    modal.style.transform = 'translateY(0)';
    overlay.style.background = 'rgba(0,0,0,0.88)';
    setTimeout(() => {
      modal.style.transition = '';
      overlay.style.transition = '';
    }, 300);
  }
  
  modalIsDragging = false;
}

function handleModalMouseEnd(e) {
  handleModalTouchEnd(e);
}

const originalOpenModal = window.openModal;
if (typeof originalOpenModal === 'function') {
  window.openModal = function(...args) {
    originalOpenModal.apply(this, args);
    setTimeout(initModalSwipe, 100); // Small delay to ensure modal is rendered
  };
} else {

  document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (!modalOverlay.classList.contains('hidden')) {
              setTimeout(initModalSwipe, 100);
            }
          }
        });
      });
      observer.observe(modalOverlay, { attributes: true });
    }
  });
}

function showGenreBrowser() {
  homeRows.classList.add('hidden');
  heroSection.classList.add('hidden');
  searchSection.classList.add('hidden');
  filteredSection.classList.add('hidden');
  watchlistSection.classList.add('hidden');
  genreBrowserSection.classList.remove('hidden');

  ['searchLoadMore','filteredLoadMore'].forEach(id => {
    clearInfiniteScroll(id);
  });
  
  setHash('#browse/genres');
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.genre-card')) {
    e.preventDefault();
    e.stopPropagation();
    
    const card = e.target.closest('.genre-card');
    const type = card.dataset.type;
    const genreId = card.dataset.genre;
    const genreName = card.dataset.name;

    card.style.transform = 'translateY(-2px) scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);

    setTimeout(() => {
      handleFilter(type, `${genreName} ${type === 'movie' ? 'Movies' : 'TV Shows'}`, genreId, genreName);
    }, 100);
  }
});

const logoBtn = document.getElementById('logoBtn');

logoBtn.addEventListener('click', () => {

  if (window.location.hash === '#home' || window.location.hash === '' || window.location.hash === '#') {
    window.location.reload();
  } else {

    showHome();
  }
});

function setupNewPlayer(item) {

  const posterImg = document.getElementById('playerPoster');
  const movieTitle = document.getElementById('playerMovieTitle');
  const movieMeta = document.getElementById('playerMovieMeta');
  const movieDesc = document.getElementById('playerMovieDesc');
  const movieGenres = document.getElementById('playerMovieGenres');
  const watchlistBtn = document.getElementById('playerWatchlistBtn');
  const trailerBtn = document.getElementById('playerTrailerBtn');
  
  posterImg.src = item.thumb || 'https://placehold.co/342x513/13131a/888?text=No+Image';
  movieTitle.textContent = item.title;
  
  movieMeta.innerHTML = `
    <span class="score">★ ${item.score}</span>
    <span>${item.year}</span>
    ${item.rating ? `<span class="rating-badge">${item.rating}</span>` : ''}
    ${item.duration ? `<span>${item.duration}</span>` : ''}
    <span class="type-badge">${item.type === 'show' ? 'TV Show' : 'Movie'}</span>
  `;
  
  movieDesc.textContent = item.description || 'No description available.';
  
  movieGenres.innerHTML = item.genre.map(g => `<span class="genre-tag">${g}</span>`).join('');

  const inWL = watchlist.includes(item.id);
  watchlistBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
    ${inWL ? 'In Watchlist' : 'Add to Watchlist'}
  `;
  watchlistBtn.onclick = () => toggleWatchlist(item.id, watchlistBtn);

  if (item.trailerKey) {
    trailerBtn.style.display = 'flex';
    trailerBtn.onclick = () => openTrailer(item.trailerKey);
  } else {
    trailerBtn.style.display = 'none';
  }

  setupServerList();
}

function setupServerList() {
  const serverList = document.getElementById('serverList');
  if (!serverList) return;
  serverList.innerHTML = '';
  
  SOURCES.forEach((src, index) => {
    const serverItem = document.createElement('button');
    serverItem.className = `server-item ${index === currentSourceIdx ? 'active' : ''}`;
    serverItem.textContent = `${src.label} ${src.tag}`;
    serverItem.onclick = () => {
      currentSourceIdx = index;
      loadSource();
      setupServerList(); // Refresh to update active state
    };
    serverList.appendChild(serverItem);
  });
}

async function setupEpisodeSection(item) {
  const episodeSection = document.getElementById('episodeSection');
  const seasonSelect = document.getElementById('seasonSelect');
  const episodeSelect = document.getElementById('episodeSelect');
  const episodeGrid = document.getElementById('episodeGrid');
  
  episodeSection.classList.remove('hidden');

  seasonSelect.innerHTML = '';
  for (let s = 1; s <= (item.seasons || 5); s++) {
    const option = document.createElement('option');
    option.value = s;
    option.textContent = `Season ${s}`;
    option.selected = s === currentSeason;
    seasonSelect.appendChild(option);
  }
  
  seasonSelect.onchange = async () => {
    currentSeason = parseInt(seasonSelect.value);
    currentEpisode = 1;
    await loadEpisodes(item.tmdbId, currentSeason);
    setupEpisodeGrid();
    loadSource();
  };

  await loadEpisodes(item.tmdbId, currentSeason);
  setupEpisodeGrid();
}

function setupEpisodeGrid() {
  const episodeGrid = document.getElementById('episodeGrid');
  const episodeData = window.currentEpisodeData || [];
  
  episodeGrid.innerHTML = '';
  
  const numEps = episodeData.length || episodeSelect.options.length || 1;
  
  for (let e = 1; e <= numEps; e++) {
    const episode = episodeData[e - 1];
    const episodeCard = document.createElement('div');
    episodeCard.className = `episode-card ${e === currentEpisode ? 'active' : ''}`;
    episodeCard.onclick = () => {
      currentEpisode = e;
      episodeSelect.value = e;
      loadSource();
      setupEpisodeGrid(); // Refresh active state
    };
    
    episodeCard.innerHTML = `
      <div class="episode-number">Episode ${e}</div>
      <div class="episode-title">${episode?.name || `Episode ${e}`}</div>
      <div class="episode-overview">${episode?.overview || 'No description available.'}</div>
    `;
    
    episodeGrid.appendChild(episodeCard);
  }

  const activeCard = episodeGrid.querySelector('.episode-card.active');
  if (activeCard) activeCard.scrollIntoView({ block: 'nearest' });

}

async function setupRecommendations(item) {
  const recommendationsGrid = document.getElementById('recommendationsGrid');
  recommendationsGrid.innerHTML = '<div class="row-loader">Loading recommendations...</div>';
  
  try {

    const genre = item.genre[0];
    const genreId = Object.keys(GENRE_MAP).find(key => GENRE_MAP[key] === genre);
    
    let recommendations = [];
    if (genreId) {
      recommendations = await fetchByGenre(item.type, 1, genreId);
    } else {

      recommendations = await fetchTrending();
    }

    recommendations = recommendations
      .filter(rec => rec.id !== item.id)
      .slice(0, 12);
    
    recommendationsGrid.innerHTML = '';
    recommendations.forEach(rec => {
      recommendationsGrid.appendChild(createCard(rec));
    });
    
  } catch (error) {
    recommendationsGrid.innerHTML = '<p class="empty-msg">Failed to load recommendations.</p>';
  }
}


/* ── GAMES HUB ── */
(function() {
  const gameTrigger   = document.getElementById('gameTrigger');
  const gamesHub      = document.getElementById('gamesHub');
  const gamesHubClose = document.getElementById('gamesHubClose');

  gameTrigger.addEventListener('click', () => gamesHub.classList.remove('hidden'));
  gamesHubClose.addEventListener('click', () => gamesHub.classList.add('hidden'));
  gamesHub.addEventListener('click', e => { if (e.target === gamesHub) gamesHub.classList.add('hidden'); });

  const games = { openSnake: startSnake, openMines: startMines, openTetris: startTetris, openPong: startPong, openBreakout: startBreakout, openTrivia: startTrivia };
  Object.entries(games).forEach(([id, fn]) => {
    document.getElementById(id).addEventListener('click', () => { gamesHub.classList.add('hidden'); fn(); });
  });
})();

/* ── SNAKE GAME ── */
function startSnake() {
  (function() {
    const GRID = 16;
    const CELL = 20;
    const SPEEDS = { slow: 180, normal: 120, fast: 65 };
    const COLORS = { bg: '#0f0f17', grid: '#16161f', snake: '#e50914', head: '#ff4455', apple: '#4ade80' };

    const overlay   = document.getElementById('snakeOverlay');
    const closeBtn  = document.getElementById('snakeClose');
    const canvas    = document.getElementById('snakeCanvas');
    const scoreEl   = document.getElementById('snakeScore');
    const bestEl    = document.getElementById('snakeBest');
    const msgEl     = document.getElementById('snakeMsg');
    const speedBtns = document.querySelectorAll('#snakeSpeeds .mines-diff-btn');
    const ctx       = canvas.getContext('2d');

    let snake, dir, apple, score, loop, running;
    let inputQueue = [];
    let speed = 'slow';
    let best = parseInt(localStorage.getItem('snakeBest') || '0');
    bestEl.textContent = best;

    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        speed = btn.dataset.speed;
        clearInterval(loop);
        running = false;
        reset();
      });
    });

    function rand(n) { return Math.floor(Math.random() * n); }
    function spawnApple() {
      let pos;
      do { pos = { x: rand(GRID), y: rand(GRID) }; }
      while (snake.some(s => s.x === pos.x && s.y === pos.y));
      return pos;
    }

    function reset() {
      const mid = Math.floor(GRID / 2);
      snake = [{ x: mid, y: mid }, { x: mid-1, y: mid }, { x: mid-2, y: mid }];
      dir = { x: 1, y: 0 };
      apple = spawnApple();
      score = 0; running = false; inputQueue = [];
      scoreEl.textContent = 0;
      msgEl.textContent = 'Press any arrow key to start';
      draw();
    }

    function draw() {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = COLORS.grid; ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,GRID*CELL); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(GRID*CELL,i*CELL); ctx.stroke();
      }
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? COLORS.head : COLORS.snake;
        ctx.beginPath(); ctx.roundRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2, 3); ctx.fill();
      });
      ctx.fillStyle = COLORS.apple;
      ctx.beginPath(); ctx.arc(apple.x*CELL+CELL/2, apple.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2); ctx.fill();
    }

    function step() {
      if (inputQueue.length) {
        const c = inputQueue.shift();
        if (c.x !== -dir.x || c.y !== -dir.y) dir = c;
      }
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || snake.some(s => s.x===head.x && s.y===head.y)) {
        running = false; clearInterval(loop);
        if (score > best) { best = score; localStorage.setItem('snakeBest', best); bestEl.textContent = best; }
        msgEl.textContent = `Game over! Score: ${score} — press arrow to restart`;
        return;
      }
      snake.unshift(head);
      if (head.x === apple.x && head.y === apple.y) { score++; scoreEl.textContent = score; apple = spawnApple(); }
      else snake.pop();
      draw();
    }

    function start() {
      if (running) return;
      reset(); running = true; msgEl.textContent = '';
      loop = setInterval(step, SPEEDS[speed]);
    }

    function onKey(e) {
      if (overlay.classList.contains('hidden')) return;
      const map = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
      if (map[e.key]) {
        e.preventDefault();
        const d = map[e.key];
        const last = inputQueue.length ? inputQueue[inputQueue.length-1] : dir;
        if ((d.x !== -last.x || d.y !== -last.y) && (d.x !== last.x || d.y !== last.y))
          if (inputQueue.length < 3) inputQueue.push(d);
        if (!running) start();
      }
    }

    function close() {
      overlay.classList.add('hidden');
      clearInterval(loop); running = false;
      document.removeEventListener('keydown', onKey);
    }

    document.addEventListener('keydown', onKey);
    closeBtn.onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.classList.remove('hidden');
    reset();
  })();
}

/* ── MINESWEEPER ── */
function startMines() {
  (function() {
    const DIFFS = {
      easy:   { rows: 9,  cols: 9,  mines: 10 },
      medium: { rows: 12, cols: 12, mines: 25 },
      hard:   { rows: 14, cols: 14, mines: 40 },
    };

    const overlay   = document.getElementById('minesOverlay');
    const closeBtn  = document.getElementById('minesClose');
    const gridEl    = document.getElementById('minesGrid');
    const leftEl    = document.getElementById('minesLeft');
    const timeEl    = document.getElementById('minesTime');
    const msgEl     = document.getElementById('minesMsg');
    const diffBtns  = document.querySelectorAll('.mines-diff-btn');

    let board, rows, cols, mineCount, flagCount, revealed, gameOver, started, timerLoop, elapsed, diff = 'easy';

    function newGame() {
      const d = DIFFS[diff];
      rows = d.rows; cols = d.cols; mineCount = d.mines;
      flagCount = 0; revealed = 0; gameOver = false; started = false; elapsed = 0;
      clearInterval(timerLoop);
      leftEl.textContent = mineCount;
      timeEl.textContent = 0;
      msgEl.textContent = 'Click to reveal · Right-click to flag';
      board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, n: 0 })));
      gridEl.style.gridTemplateColumns = `repeat(${cols}, 28px)`;
      render();
    }

    function placeMines(safeR, safeC) {
      let placed = 0;
      while (placed < mineCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!board[r][c].mine && !(r === safeR && c === safeC)) {
          board[r][c].mine = true; placed++;
        }
      }
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (!board[r][c].mine)
            board[r][c].n = neighbors(r, c).filter(([nr,nc]) => board[nr][nc].mine).length;
    }

    function neighbors(r, c) {
      const res = [];
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if ((dr||dc) && r+dr>=0 && r+dr<rows && c+dc>=0 && c+dc<cols)
            res.push([r+dr, c+dc]);
      return res;
    }

    function reveal(r, c) {
      const cell = board[r][c];
      if (cell.revealed || cell.flagged) return;
      cell.revealed = true; revealed++;
      if (cell.n === 0 && !cell.mine)
        neighbors(r, c).forEach(([nr,nc]) => reveal(nr, nc));
    }

    function render() {
      gridEl.innerHTML = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = board[r][c];
          const el = document.createElement('button');
          el.className = 'mines-cell';
          if (cell.revealed) {
            el.classList.add('revealed');
            if (cell.mine) { el.classList.add('mine-hit'); el.textContent = '💣'; }
            else if (cell.n > 0) { el.textContent = cell.n; el.dataset.n = cell.n; }
          } else if (cell.flagged) {
            el.classList.add('flagged'); el.textContent = '🚩';
          }
          el.addEventListener('click', () => onClick(r, c));
          el.addEventListener('contextmenu', e => { e.preventDefault(); onFlag(r, c); });
          gridEl.appendChild(el);
        }
      }
    }

    function onClick(r, c) {
      if (gameOver || board[r][c].flagged || board[r][c].revealed) return;
      if (!started) {
        started = true;
        placeMines(r, c);
        timerLoop = setInterval(() => { elapsed++; timeEl.textContent = elapsed; }, 1000);
      }
      if (board[r][c].mine) {
        board[r][c].revealed = true;
        gameOver = true; clearInterval(timerLoop);
        board.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
        render();
        msgEl.textContent = '💥 Boom! Right-click a diff to restart';
        return;
      }
      reveal(r, c);
      if (revealed === rows * cols - mineCount) {
        gameOver = true; clearInterval(timerLoop);
        msgEl.textContent = `🎉 You win! ${elapsed}s`;
      }
      render();
    }

    function onFlag(r, c) {
      if (gameOver || board[r][c].revealed) return;
      board[r][c].flagged = !board[r][c].flagged;
      flagCount += board[r][c].flagged ? 1 : -1;
      leftEl.textContent = mineCount - flagCount;
      render();
    }

    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        diff = btn.dataset.diff;
        newGame();
      });
    });

    function close() {
      overlay.classList.add('hidden');
      clearInterval(timerLoop);
    }

    closeBtn.onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.classList.remove('hidden');
    newGame();
  })();
}

/* ── TETRIS ── */
function startTetris() {
  (function() {
    const COLS = 10, ROWS = 20, CELL = 20;
    const COLORS = ['#e50914','#ff6b35','#f5c518','#4ade80','#60a5fa','#818cf8','#e879f9'];
    const PIECES = [
      [[1,1,1,1]],
      [[1,1],[1,1]],
      [[0,1,0],[1,1,1]],
      [[1,0,0],[1,1,1]],
      [[0,0,1],[1,1,1]],
      [[0,1,1],[1,1,0]],
      [[1,1,0],[0,1,1]],
    ];

    const overlay  = document.getElementById('tetrisOverlay');
    const closeBtn = document.getElementById('tetrisClose');
    const canvas   = document.getElementById('tetrisCanvas');
    const nextCvs  = document.getElementById('tetrisNext');
    const scoreEl  = document.getElementById('tetrisScore');
    const linesEl  = document.getElementById('tetrisLines');
    const levelEl  = document.getElementById('tetrisLevel');
    const msgEl    = document.getElementById('tetrisMsg');
    const ctx      = canvas.getContext('2d');
    const nctx     = nextCvs.getContext('2d');

    let board, piece, next, score, lines, level, loop, running, colorIdx, nextColorIdx;

    function newPiece(shape, ci) {
      return { shape, ci, x: Math.floor(COLS/2) - Math.floor(shape[0].length/2), y: 0 };
    }

    function randPiece() {
      const i = Math.floor(Math.random() * PIECES.length);
      const ci = Math.floor(Math.random() * COLORS.length);
      return { shape: PIECES[i], ci, x: Math.floor(COLS/2) - Math.floor(PIECES[i][0].length/2), y: 0 };
    }

    function reset() {
      board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
      score = 0; lines = 0; level = 1; running = false;
      scoreEl.textContent = 0; linesEl.textContent = 0; levelEl.textContent = 1;
      piece = randPiece(); next = randPiece();
      msgEl.textContent = 'Press any key to start';
      draw();
    }

    function valid(p, dx=0, dy=0, shape=p.shape) {
      return shape.every((row, r) => row.every((v, c) => {
        if (!v) return true;
        const nx = p.x+c+dx, ny = p.y+r+dy;
        return nx>=0 && nx<COLS && ny<ROWS && !board[ny]?.[nx];
      }));
    }

    function rotate(shape) {
      return shape[0].map((_, c) => shape.map(r => r[c]).reverse());
    }

    function lock() {
      piece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (v) board[piece.y+r][piece.x+c] = piece.ci+1;
      }));
      let cleared = 0;
      for (let r = ROWS-1; r >= 0; r--) {
        if (board[r].every(v => v)) { board.splice(r,1); board.unshift(Array(COLS).fill(0)); cleared++; r++; }
      }
      if (cleared) {
        const pts = [0,100,300,500,800][cleared] * level;
        score += pts; lines += cleared;
        level = Math.floor(lines/10)+1;
        scoreEl.textContent = score; linesEl.textContent = lines; levelEl.textContent = level;
      }
      piece = next; next = randPiece();
      if (!valid(piece)) { running = false; clearInterval(loop); msgEl.textContent = `Game over! Score: ${score}`; }
    }

    function draw() {
      ctx.fillStyle = '#0f0f17'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = '#16161f'; ctx.lineWidth = 0.5;
      for (let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*CELL);ctx.lineTo(COLS*CELL,r*CELL);ctx.stroke();}
      for (let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,ROWS*CELL);ctx.stroke();}
      board.forEach((row,r) => row.forEach((v,c) => {
        if (v) { ctx.fillStyle=COLORS[v-1]; ctx.beginPath(); ctx.roundRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2,2); ctx.fill(); }
      }));
      if (piece) {
        ctx.fillStyle = COLORS[piece.ci];
        piece.shape.forEach((row,r) => row.forEach((v,c) => {
          if (v) { ctx.beginPath(); ctx.roundRect((piece.x+c)*CELL+1,(piece.y+r)*CELL+1,CELL-2,CELL-2,2); ctx.fill(); }
        }));
      }
      nctx.fillStyle = '#0f0f17'; nctx.fillRect(0,0,80,80);
      if (next) {
        nctx.fillStyle = COLORS[next.ci];
        const ox = Math.floor((4-next.shape[0].length)/2)*CELL;
        const oy = Math.floor((4-next.shape.length)/2)*CELL;
        next.shape.forEach((row,r) => row.forEach((v,c) => {
          if (v) { nctx.beginPath(); nctx.roundRect(ox+c*CELL+1,oy+r*CELL+1,CELL-2,CELL-2,2); nctx.fill(); }
        }));
      }
    }

    function drop() {
      if (valid(piece,0,1)) { piece.y++; } else { lock(); }
      draw();
    }

    function start() {
      if (running) return;
      running = true; msgEl.textContent = '';
      loop = setInterval(() => { drop(); }, Math.max(100, 800 - (level-1)*70));
    }

    function onKey(e) {
      if (overlay.classList.contains('hidden') || !running) { if (!running && !overlay.classList.contains('hidden')) start(); return; }
      if (e.key==='ArrowLeft'  && valid(piece,-1,0)) { piece.x--; draw(); }
      if (e.key==='ArrowRight' && valid(piece,1,0))  { piece.x++; draw(); }
      if (e.key==='ArrowDown')  { drop(); }
      if (e.key==='ArrowUp') {
        const r = rotate(piece.shape);
        if (valid(piece,0,0,r)) { piece.shape=r; draw(); }
      }
      if (e.key===' ') { while(valid(piece,0,1)) piece.y++; lock(); draw(); }
      e.preventDefault();
    }

    function close() {
      overlay.classList.add('hidden'); clearInterval(loop); running=false;
      document.removeEventListener('keydown', onKey);
    }

    document.addEventListener('keydown', onKey);
    closeBtn.onclick = close;
    overlay.addEventListener('click', e => { if(e.target===overlay) close(); });
    overlay.classList.remove('hidden');
    reset();
  })();
}

/* ── PONG ── */
function startPong() {
  (function() {
    const W=480, H=280, PAD_H=60, PAD_W=10, BALL_R=7, PAD_SPEED=5;
    const overlay  = document.getElementById('pongOverlay');
    const closeBtn = document.getElementById('pongClose');
    const canvas   = document.getElementById('pongCanvas');
    const scoreL   = document.getElementById('pongScoreL');
    const scoreR   = document.getElementById('pongScoreR');
    const msgEl    = document.getElementById('pongMsg');
    const ctx      = canvas.getContext('2d');

    let lY, rY, bx, by, vx, vy, sl, sr, running, raf;
    const keys = {};

    function reset(serve=0) {
      lY = rY = H/2 - PAD_H/2;
      bx = W/2; by = H/2;
      const angle = (Math.random()*0.6-0.3);
      const dir = serve===0 ? (Math.random()<0.5?1:-1) : (serve>0?1:-1);
      vx = dir * 4; vy = Math.sin(angle)*4;
    }

    function init() {
      sl=0; sr=0; scoreL.textContent=0; scoreR.textContent=0;
      reset(); running=false; msgEl.textContent='Press Space to start';
      draw();
    }

    function draw() {
      ctx.fillStyle='#0f0f17'; ctx.fillRect(0,0,W,H);
      ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.roundRect(10, lY, PAD_W, PAD_H, 3); ctx.fill();
      ctx.beginPath(); ctx.roundRect(W-20, rY, PAD_W, PAD_H, 3); ctx.fill();
      ctx.fillStyle='#e50914';
      ctx.beginPath(); ctx.arc(bx,by,BALL_R,0,Math.PI*2); ctx.fill();
    }

    function update() {
      if (keys['w']||keys['W']) lY = Math.max(0, lY-PAD_SPEED);
      if (keys['s']||keys['S']) lY = Math.min(H-PAD_H, lY+PAD_SPEED);
      if (keys['ArrowUp'])   rY = Math.max(0, rY-PAD_SPEED);
      if (keys['ArrowDown']) rY = Math.min(H-PAD_H, rY+PAD_SPEED);
      bx+=vx; by+=vy;
      if (by-BALL_R<=0||by+BALL_R>=H) vy=-vy;
      if (bx-BALL_R<=20+PAD_W && by>=lY && by<=lY+PAD_H) { vx=Math.abs(vx)*1.05; vy+=((by-(lY+PAD_H/2))/(PAD_H/2))*2; }
      if (bx+BALL_R>=W-20 && by>=rY && by<=rY+PAD_H) { vx=-Math.abs(vx)*1.05; vy+=((by-(rY+PAD_H/2))/(PAD_H/2))*2; }
      const maxV=12; const spd=Math.hypot(vx,vy); if(spd>maxV){vx=vx/spd*maxV;vy=vy/spd*maxV;}
      if (bx<0) { sr++; scoreR.textContent=sr; reset(1); if(sr>=7){running=false;cancelAnimationFrame(raf);msgEl.textContent='Right wins! Space to restart';} }
      if (bx>W) { sl++; scoreL.textContent=sl; reset(-1); if(sl>=7){running=false;cancelAnimationFrame(raf);msgEl.textContent='Left wins! Space to restart';} }
    }

    function loop() { if(!running) return; update(); draw(); raf=requestAnimationFrame(loop); }

    function onKey(e) {
      if (overlay.classList.contains('hidden')) return;
      keys[e.key]=true;
      if (e.key===' ') { e.preventDefault(); if(!running){init();running=true;msgEl.textContent='';loop();} }
      if (['ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault();
    }
    function onKeyUp(e) { keys[e.key]=false; }

    function close() {
      overlay.classList.add('hidden'); running=false; cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKeyUp);
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    closeBtn.onclick = close;
    overlay.addEventListener('click', e => { if(e.target===overlay) close(); });
    overlay.classList.remove('hidden');
    init();
  })();
}

/* ── BREAKOUT ── */
function startBreakout() {
  (function() {
    const W=400, H=300, PAD_W=70, PAD_H=10, BALL_R=7, ROWS=5, COLS=10;
    const BRICK_W=W/COLS, BRICK_H=18, BRICK_PAD=2;
    const COLORS=['#e50914','#ff6b35','#f5c518','#4ade80','#60a5fa'];

    const overlay  = document.getElementById('breakoutOverlay');
    const closeBtn = document.getElementById('breakoutClose');
    const canvas   = document.getElementById('breakoutCanvas');
    const scoreEl  = document.getElementById('breakoutScore');
    const livesEl  = document.getElementById('breakoutLives');
    const msgEl    = document.getElementById('breakoutMsg');
    const ctx      = canvas.getContext('2d');

    let px, bx, by, vx, vy, bricks, score, lives, running, launched, raf;
    const keys={};

    function makeBricks() {
      return Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>({alive:true,r,c})));
    }

    function init() {
      px=W/2-PAD_W/2; bx=W/2; by=H-30; vx=3; vy=-3;
      bricks=makeBricks(); score=0; lives=3; running=false; launched=false;
      scoreEl.textContent=0; livesEl.textContent=3;
      msgEl.textContent='Press Space to launch';
      draw();
    }

    function draw() {
      ctx.fillStyle='#0f0f17'; ctx.fillRect(0,0,W,H);
      bricks.forEach(row=>row.forEach(b=>{
        if(!b.alive) return;
        ctx.fillStyle=COLORS[b.r];
        ctx.beginPath(); ctx.roundRect(b.c*BRICK_W+BRICK_PAD, b.r*BRICK_H+BRICK_PAD+30, BRICK_W-BRICK_PAD*2, BRICK_H-BRICK_PAD*2, 2); ctx.fill();
      }));
      ctx.fillStyle='rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.roundRect(px,H-PAD_H-5,PAD_W,PAD_H,4); ctx.fill();
      ctx.fillStyle='#e50914';
      ctx.beginPath(); ctx.arc(bx,by,BALL_R,0,Math.PI*2); ctx.fill();
    }

    function update() {
      const spd=5;
      if (keys['ArrowLeft']||keys['a']||keys['A']) px=Math.max(0,px-spd);
      if (keys['ArrowRight']||keys['d']||keys['D']) px=Math.min(W-PAD_W,px+spd);
      if (!launched) { bx=px+PAD_W/2; return; }
      bx+=vx; by+=vy;
      if (bx-BALL_R<=0||bx+BALL_R>=W) vx=-vx;
      if (by-BALL_R<=0) vy=-vy;
      if (by+BALL_R>=H-PAD_H-5 && bx>=px && bx<=px+PAD_W) {
        vy=-Math.abs(vy); vx+=((bx-(px+PAD_W/2))/(PAD_W/2))*2;
      }
      if (by>H) {
        lives--; livesEl.textContent=lives;
        if(lives<=0){running=false;cancelAnimationFrame(raf);msgEl.textContent=`Game over! Score: ${score}`; return;}
        launched=false; bx=px+PAD_W/2; by=H-30; vx=3; vy=-3;
        msgEl.textContent='Press Space to launch';
      }
      bricks.forEach(row=>row.forEach(b=>{
        if(!b.alive) return;
        const bLeft=b.c*BRICK_W+BRICK_PAD, bTop=b.r*BRICK_H+BRICK_PAD+30;
        const bRight=bLeft+BRICK_W-BRICK_PAD*2, bBottom=bTop+BRICK_H-BRICK_PAD*2;
        if(bx+BALL_R>bLeft&&bx-BALL_R<bRight&&by+BALL_R>bTop&&by-BALL_R<bBottom){
          b.alive=false; vy=-vy; score+=10*(b.r+1); scoreEl.textContent=score;
        }
      }));
      if(bricks.every(row=>row.every(b=>!b.alive))){running=false;cancelAnimationFrame(raf);msgEl.textContent=`You win! Score: ${score}`;}
    }

    function loop(){if(!running)return;update();draw();raf=requestAnimationFrame(loop);}

    function onKey(e){
      if(overlay.classList.contains('hidden'))return;
      keys[e.key]=true;
      if(e.key===' '){e.preventDefault();if(!launched&&running){launched=true;msgEl.textContent='';}else if(!running){init();running=true;loop();}}
      if(['ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
    }
    function onKeyUp(e){keys[e.key]=false;}

    function close(){
      overlay.classList.add('hidden');running=false;cancelAnimationFrame(raf);
      document.removeEventListener('keydown',onKey);
      document.removeEventListener('keyup',onKeyUp);
    }

    document.addEventListener('keydown',onKey);
    document.addEventListener('keyup',onKeyUp);
    closeBtn.onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    overlay.classList.remove('hidden');
    init(); running=true; loop();
  })();
}

/* ── MOVIE TRIVIA ── */
function startTrivia() {
  (function() {
    const overlay  = document.getElementById('triviaOverlay');
    const closeBtn = document.getElementById('triviaClose');
    const posterEl = document.getElementById('triviaPoster');
    const questionEl = document.getElementById('triviaQuestion');
    const optionsEl  = document.getElementById('triviaOptions');
    const scoreEl    = document.getElementById('triviaScore');
    const qEl        = document.getElementById('triviaQ');
    const msgEl      = document.getElementById('triviaMsg');

    let score=0, qNum=0, total=10, pool=[], answered=false;

    function shuffle(a){return a.sort(()=>Math.random()-0.5);}

    async function loadPool() {
      questionEl.textContent='Loading questions...';
      optionsEl.innerHTML='';
      try {
        const pages = await Promise.all([1,2,3].map(p=>tmdbFetch(`/movie/popular?page=${p}`)));
        pool = pages.flatMap(p=>p.results||[]).filter(m=>m.poster_path&&m.release_date&&m.vote_average>0&&m.genre_ids?.length);
        shuffle(pool);
        nextQuestion();
      } catch(_){ questionEl.textContent='Failed to load. Check connection.'; }
    }

    function makeQuestion(movie, allMovies) {
      const type = Math.floor(Math.random()*3);
      if (type===0) {
        const year = movie.release_date.slice(0,4);
        const wrongs = shuffle(allMovies.filter(m=>m.id!==movie.id&&m.release_date).map(m=>m.release_date.slice(0,4))).slice(0,3);
        return { q:`What year was "${movie.title}" released?`, correct: year, opts: shuffle([year,...wrongs]) };
      } else if (type===1) {
        const score = movie.vote_average.toFixed(1);
        const wrongs = ['5.0','6.0','6.5','7.0','7.5','8.0','8.5','9.0'].filter(s=>s!==score).slice(0,3);
        return { q:`What is the TMDB rating of "${movie.title}"?`, correct: score, opts: shuffle([score,...wrongs]) };
      } else {
        const GENRE_NAMES = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',27:'Horror',9648:'Mystery',10749:'Romance',878:'Sci-Fi',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy',10768:'War & Politics'};
        const gid = movie.genre_ids[0];
        const correct = GENRE_NAMES[gid]||'Drama';
        const wrongs = shuffle(Object.values(GENRE_NAMES).filter(g=>g!==correct)).slice(0,3);
        return { q:`What genre is "${movie.title}"?`, correct, opts: shuffle([correct,...wrongs]) };
      }
    }

    function nextQuestion() {
      if (qNum>=total) { endGame(); return; }
      answered=false;
      const movie = pool[qNum];
      const q = makeQuestion(movie, pool);
      qNum++;
      qEl.textContent=`${qNum}/${total}`;
      posterEl.style.backgroundImage = movie.poster_path ? `url('https://image.tmdb.org/t/p/w500${movie.poster_path}')` : 'none';
      questionEl.textContent = q.q;
      msgEl.textContent='';
      optionsEl.innerHTML='';
      q.opts.forEach(opt=>{
        const btn=document.createElement('button');
        btn.className='trivia-opt';
        btn.textContent=opt;
        btn.addEventListener('click',()=>{
          if(answered)return;
          answered=true;
          if(opt===q.correct){
            btn.classList.add('correct'); score++; scoreEl.textContent=score;
            msgEl.textContent='Correct!';
          } else {
            btn.classList.add('wrong');
            optionsEl.querySelectorAll('.trivia-opt').forEach(b=>{ if(b.textContent===q.correct) b.classList.add('correct'); });
            msgEl.textContent=`Wrong! It was "${q.correct}"`;
          }
          optionsEl.querySelectorAll('.trivia-opt').forEach(b=>b.disabled=true);
          setTimeout(nextQuestion, 1500);
        });
        optionsEl.appendChild(btn);
      });
    }

    function endGame() {
      posterEl.style.backgroundImage='none';
      questionEl.textContent=`Game over! You scored ${score}/${total}`;
      optionsEl.innerHTML='';
      const restart=document.createElement('button');
      restart.className='trivia-opt'; restart.textContent='Play Again';
      restart.style.gridColumn='1/-1';
      restart.addEventListener('click',()=>{ score=0; qNum=0; scoreEl.textContent=0; shuffle(pool); nextQuestion(); });
      optionsEl.appendChild(restart);
    }

    function close(){ overlay.classList.add('hidden'); }
    closeBtn.onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    overlay.classList.remove('hidden');
    score=0; qNum=0; scoreEl.textContent=0; qEl.textContent=`0/${total}`;
    loadPool();
  })();
}
