# CINEXA

A Netflix/MyFlixer-style streaming site built with vanilla HTML, CSS, and JavaScript. Pulls real movie and TV data from TMDB.

---

## Features

- Real movies and TV shows via TMDB API
- Hero banner with featured content
- Horizontal rows — Trending, Popular Movies, Now Playing, Top Rated TV
- Genre filtering under Movies and TV Shows nav dropdowns
- Live search suggestions as you type, full results on Enter
- Movie/show detail modal with ratings, runtime, genres, and trailer
- Embedded player with 4 server options to switch if one fails
- TV show episode picker — season and episode selectors in the player
- Continue Watching row — saves your season/episode progress across sessions
- Watchlist — persisted to localStorage, accessible from the nav
- Fully responsive — desktop, tablet, and mobile bottom nav

---

## Setup

No build step, no dependencies.

**Option 1 — Python (recommended)**
```bash
cd streaming-site
python -m http.server 8080
```
Then open `http://localhost:8080`

**Option 2 — Node**
```bash
npx serve streaming-site
```

> Do not open `index.html` directly as a `file://` URL — the TMDB API calls will work but some browser behaviors (scroll, navigation) won't.

---

## TMDB API Key

The project uses a hardcoded TMDB v3 API key in `data.js`. To use your own:

1. Sign up free at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to Settings → API → copy your **API Key (v3)**
3. Open `data.js` and replace the value of `TMDB_API_KEY`

TMDB is free with no rate limits for normal usage.

---

## File Structure

```
streaming-site/
├── index.html   — markup and layout
├── style.css    — all styles including responsive breakpoints
├── app.js       — all UI logic, state, events
└── data.js      — TMDB API layer, fetch functions, data normalization
```

---

## Customization

| What | Where |
|---|---|
| Site name / logo | `index.html` — `<title>` and `.logo` div |
| Accent color | `style.css` — `--accent` CSS variable |
| Number of results per row | `app.js` — `.slice(0, 20)` calls in `init()` |
| Embed servers | `app.js` — `SOURCES` array |
| Genre list | `index.html` — `.nav-dropdown` lists |

---

## Player Servers

If a title shows "unavailable", switch servers using the buttons in the player header.

| Server | Source |
|---|---|
| Server 1 | vidsrc.xyz |
| Server 2 | vidsrc.to |
| Server 3 | 2embed.cc |
| Server 4 | moviesapi.club |

Not every title is indexed on every server.
