/* ── TMDB API LAYER ── */
const TMDB_BASE    = 'https://api.themoviedb.org/3';
const IMG_BASE     = 'https://image.tmdb.org/t/p';
const TMDB_API_KEY = 'fe2a57d4368d2e6bf1c7b3ef38e79e52';

const GENRE_MAP = {
  28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
  99:'Documentary', 18:'Drama', 10751:'Family', 14:'Fantasy', 36:'History',
  27:'Horror', 10402:'Music', 9648:'Mystery', 10749:'Romance', 878:'Sci-Fi',
  10770:'TV Movie', 53:'Thriller', 10752:'War', 37:'Western',
  10759:'Action & Adventure', 10762:'Kids', 10763:'News', 10764:'Reality',
  10765:'Sci-Fi & Fantasy', 10766:'Soap', 10767:'Talk', 10768:'War & Politics',
};

function normalizeMovie(m) {
  return {
    id:          `m${m.id}`,
    tmdbId:      m.id,
    title:       m.title || m.name || 'Untitled',
    year:        (m.release_date || '').slice(0, 4),
    score:       m.vote_average ? (+m.vote_average).toFixed(1) : 'N/A',
    genre:       (m.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean),
    description: m.overview || '',
    thumb:       m.poster_path   ? `${IMG_BASE}/w342${m.poster_path}`   : '',
    banner:      m.backdrop_path ? `${IMG_BASE}/w1280${m.backdrop_path}` : '',
    type:        'movie',
    popularity:  m.popularity || 0,
    rating: '', duration: '', trailerKey: null,
  };
}

function normalizeShow(s) {
  return {
    id:          `t${s.id}`,
    tmdbId:      s.id,
    title:       s.name || s.title || 'Untitled',
    year:        (s.first_air_date || '').slice(0, 4),
    score:       s.vote_average ? (+s.vote_average).toFixed(1) : 'N/A',
    genre:       (s.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean),
    description: s.overview || '',
    thumb:       s.poster_path   ? `${IMG_BASE}/w342${s.poster_path}`   : '',
    banner:      s.backdrop_path ? `${IMG_BASE}/w1280${s.backdrop_path}` : '',
    type:        'show',
    popularity:  s.popularity || 0,
    rating: '', duration: '', trailerKey: null,
  };
}

async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchDetail(item) {
  try {
    const endpoint = item.type === 'movie' ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`;
    const appendix = item.type === 'movie' ? 'release_dates,videos' : 'content_ratings,videos';
    const data = await tmdbFetch(endpoint, { append_to_response: appendix });

    if (item.type === 'movie') {
      item.duration = data.runtime ? `${Math.floor(data.runtime/60)}h ${data.runtime%60}m` : '';
      const us = data.release_dates?.results?.find(r => r.iso_3166_1 === 'US');
      item.rating = us?.release_dates?.find(d => d.certification)?.certification || '';
    } else {
      item.duration = data.number_of_seasons
        ? `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}`
        : '';
      const us = data.content_ratings?.results?.find(r => r.iso_3166_1 === 'US');
      item.rating = us?.rating || '';
    }

    const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
      || data.videos?.results?.find(v => v.site === 'YouTube');
    item.trailerKey = trailer?.key || null;

    if (data.genres?.length) item.genre = data.genres.map(g => g.name);
    if (data.backdrop_path && !item.banner)
      item.banner = `${IMG_BASE}/w1280${data.backdrop_path}`;
  } catch (_) {}
  return item;
}

async function fetchTrending() {
  const [m, t] = await Promise.all([
    tmdbFetch('/trending/movie/week'),
    tmdbFetch('/trending/tv/week'),
  ]);
  return [...m.results.map(normalizeMovie), ...t.results.map(normalizeShow)]
    .sort((a, b) => b.popularity - a.popularity);
}

async function fetchPopularMovies(page = 1) {
  const d = await tmdbFetch('/movie/popular', { page });
  return d.results.map(normalizeMovie);
}

async function fetchPopularShows(page = 1) {
  const d = await tmdbFetch('/tv/popular', { page });
  return d.results.map(normalizeShow);
}

async function fetchNowPlaying() {
  const d = await tmdbFetch('/movie/now_playing');
  return d.results.map(normalizeMovie);
}

async function fetchTopRatedShows() {
  const d = await tmdbFetch('/tv/top_rated');
  return d.results.map(normalizeShow);
}

async function searchTMDB(query, page = 1) {
  const [m, t] = await Promise.all([
    tmdbFetch('/search/movie', { query, page }),
    tmdbFetch('/search/tv',    { query, page }),
  ]);
  return [...m.results.map(normalizeMovie), ...t.results.map(normalizeShow)]
    .sort((a, b) => b.popularity - a.popularity);
}

async function fetchByGenre(type, page = 1, genreId = '') {
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  const params = { page, sort_by: 'popularity.desc' };
  if (genreId) params.with_genres = genreId;
  const d = await tmdbFetch(endpoint, params);
  return type === 'movie'
    ? d.results.map(normalizeMovie)
    : d.results.map(normalizeShow);
}

async function fetchTopRatedMovies(page = 1) {
  const d = await tmdbFetch('/movie/top_rated', { page });
  return d.results.map(normalizeMovie);
}

async function fetchUpcoming(page = 1) {
  const d = await tmdbFetch('/movie/upcoming', { page });
  return d.results.map(normalizeMovie);
}

async function fetchAiringToday(page = 1) {
  const d = await tmdbFetch('/tv/airing_today', { page });
  return d.results.map(normalizeShow);
}

async function fetchMovies2026(page = 1) {
  const d = await tmdbFetch('/discover/movie', {
    page,
    primary_release_year: 2026,
    sort_by: 'popularity.desc',
  });
  return d.results.map(normalizeMovie);
}
