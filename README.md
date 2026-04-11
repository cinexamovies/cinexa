# awu & chill

A Netflix-style streaming site built with vanilla HTML, CSS, and JavaScript. Pulls real movie and TV data from TMDB and streams via third-party embed sources.

---

## Features

- Real movies and TV shows via TMDB API
- Hero banner with featured content
- Horizontal drag-scrollable rows — Trending, Popular, Now Playing, Top Rated, Upcoming, Airing Today, and genre-specific rows
- Genre browser with full movie and TV genre categories
- Nav dropdowns for Movies and TV Shows with genre filtering
- Live search with instant suggestions and full results on Enter
- Movie/show detail modal with ratings, runtime, genres, and trailer
- Embedded player with 12 server options
- Episode sidebar — scrollable episode list next to the video for TV shows
- Season selector in the episode sidebar
- Continue Watching row — saves season, episode, and server progress per title
- Watchlist — persisted to localStorage, accessible from the nav heart icon
- Light/dark mode toggle with preference saved to localStorage
- "Feeling Lucky" random title picker
- Right-click disabled on the player
- Fully responsive — desktop, tablet, and mobile with bottom nav

---

## Setup

No build step, no dependencies.

**Python**
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`

**Node**
```bash
npx serve .
```

> Don't open `index.html` directly as a `file://` URL — some browser security restrictions will cause issues.

---

## TMDB API Key

The project uses a hardcoded TMDB v3 API key in `data.js`. To use your own:

1. Sign up free at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to Settings → API → copy your **API Key (v3)**
3. Open `data.js` and replace the value of `TMDB_API_KEY`

---

## File Structure

```
├── index.html   — markup and layout
├── style.css    — all styles, light/dark mode, responsive breakpoints
├── app.js       — all UI logic, state, player, events
└── data.js      — TMDB API layer, fetch functions, data normalization
```

---

## Customization

| What | Where |
|---|---|
| Site name / logo | `index.html` — `<title>` and `.logo` div |
| Accent color | `style.css` — `--accent` CSS variable |
| Results per row | `app.js` — `.slice(0, 20)` calls in `init()` |
| Embed servers | `app.js` — `SOURCES` array |
| Genre list | `index.html` — `.nav-dropdown` and genre browser section |

---

## Embed Servers

If a title doesn't load, switch servers using the server bar below the video.

| Server | Quality | Domain |
|---|---|---|
| VidSrc CC | HD | vidsrc.cc |
| VidSrc ICU | HD | vidsrc.icu |
| VidSrc XYZ | HD | vidsrc.xyz |
| VidSrc TO | HD | vidsrc.to |
| VidSrc ME | HD | vidsrc.me |
| Embed SU | HD | embed.su |
| SuperEmbed | HD | multiembed.mov |
| AutoEmbed | HD | autoembed.co |
| VidSrc LOL | 4K | vidsrc.lol |
| VidSrc Store | HD | vidsrc.store |
| CineSrc | HD | cinesrc.st |
| NontonGo | HD | nontongo.net |

Not every title is indexed on every server.

---

## Legal

This project is for personal/educational use only. It does not host any content — all media is streamed via third-party embed sources. Use responsibly.
