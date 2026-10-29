# 📺 Bharat IPTV Player - Live Indian TV

A responsive, high-performance **React + TypeScript + Vite + HLS.js** web player powered by the official Indian stream directory from [`iptv-org/iptv`](https://github.com/iptv-org/iptv/blob/master/streams/in.m3u).

---

## ✨ Features

- 🇮🇳 **850+ Live Channels:** News, Entertainment, Movies, Music, Sports, Kids, Devotional, and Regional channels across India.
- ⚡ **HLS.js Live Streaming Engine:**
  - Fast live manifest loading with error recovery.
  - Multi-stream & resolution switcher (automatically try backup source feeds if primary stream is restricted).
  - Video controls: Play/Pause, Volume bar, Aspect ratio toggle (Contain, Cover, Fill), Fullscreen, Picture-in-Picture (PiP).
- 🔍 **Instant Search & Multi-Level Filtering:**
  - Real-time search across 850+ channels.
  - Category filters: *News, Movies, Entertainment, Music, Sports, Kids, Devotional, Infotainment*.
  - Language filters: *Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Punjabi, Gujarati, Marathi, Odia, Assamese, English, Bhojpuri*.
  - Resolution selector: *1080p Full HD, 720p HD, SD*.
- ⭐ **Favorites & Recents History:**
  - One-click channel bookmarking (saved to `localStorage`).
  - History of recently watched channels for instant zapping.
- ⌨️ **Smart TV & Keyboard Controls:**
  - `←` / `→` arrow keys: Channel zapping.
  - `Space`: Play / Pause.
  - `M`: Mute / Unmute.
  - `F`: Toggle Fullscreen.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```