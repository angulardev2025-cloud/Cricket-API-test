# 📺 Global IPTV Player - 182 Countries Live TV

An interactive, high-performance **React + TypeScript + Vite + HLS.js** web player powered by all official country stream playlists from [`iptv-org/iptv`](https://github.com/iptv-org/iptv).

---

## ✨ Features

- 🌍 **182 Countries & Territories:**
  - 🇮🇳 India (879 channels)
  - 🇺🇸 United States (2,347 channels)
  - 🇬🇧 United Kingdom (624 channels)
  - 🇨🇦 Canada (387 channels)
  - 🇦🇺 Australia (134 channels)
  - 🇩🇪 Germany (422 channels)
  - 🇫🇷 France (385 channels)
  - 🇪🇸 Spain (418 channels)
  - 🇮🇹 Italy (449 channels)
  - 🇧🇷 Brazil (449 channels)
  - 🇦🇪 United Arab Emirates (84 channels)
  - 🇵🇰 Pakistan (85 channels)
  - 🇧🇩 Bangladesh (42 channels)
  - ...and 169 more countries across Asia, Europe, Americas, Africa, Middle East, and Oceania!
- ⚡ **14,500+ Live HLS Streams:**
  - Fast on-demand JSON loading (`/data/countries/{code}.json`) with in-memory caching for instant country switching.
  - Multi-stream fallback switcher for channels with backup CDN feeds.
  - Video controls: Play/Pause, Volume slider, Mute toggle, Aspect ratio toggle (Contain, Cover, Fill), Fullscreen, and Picture-in-Picture (PiP).
- 🔍 **Search & Multi-Level Filtering:**
  - Real-time instant search within any selected country.
  - Category filters: *News, Movies, Entertainment, Music, Sports, Kids, Devotional, Infotainment*.
  - Quality filters: *1080p Full HD, 720p HD, SD*.
  - Region filters: *Asia, Europe, Americas, Africa, Middle East, Oceania*.
- ⭐ **Personalization & TV Guide:**
  - Persistent favorite channels saved in `localStorage`.
  - Recently watched channels history.
  - Side TV Guide drawer for instant zapping while streaming.
- ⌨️ **Keyboard Controls:**
  - `←` / `→` arrow keys: Zap to previous/next channel.
  - `Space`: Play / Pause.
  - `M`: Mute / Unmute.
  - `F`: Toggle Fullscreen.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server (port 3000)
npm run dev

# Production build
npm run build
```