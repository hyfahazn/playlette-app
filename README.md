# 🎡 Playlette — 1-Bit Dither & Diffractive Monochrome Vinyl Roulette

> **Playlette** is a stark, high-contrast monochrome music discovery web application inspired by 1-bit dithered celestial graphics and high-gloss diffractive vinyl records. Featuring 100% client-side Spotify OAuth with PKCE, liquid mercury specular disc reflections, a diffractive vinyl roulette wheel, and synchronized lyrics transcripts.

---

## ✨ Features

### 1. Visual Aesthetics (Inspired by User Reference Images)
- **3D Silver Vinyl Record with Soft Neon Hues & Prismatic Flare** *(Reference Image 1)*:
  - 3D tilted floating silver disc with interactive mouse parallax tilt (`perspective: 1200px`).
  - Horizontal rainbow prismatic chromatic flare with soft neon cyan, amber, magenta, and green dispersion hues.
  - Mirror-like silver finish with concentric microgrooves and high-intensity rim specular bloom.
  - Authentic retro-futuristic editorial prompt metadata box stamp.
- **Liquid Metal Chrome 4-Point Star** *(Reference Image 2)*:
  - Custom SVG liquid metal emblem with chrome bevel highlights, fluid aerodynamic curves, and center specular bloom.
  - Featured on the Vinyl Record center spindle, Roulette Wheel center hub, and brutalist "PULL TO SPIN" lever button.
- **Digital Halftone LED Pixel Matrix Wave** *(Reference Image 3)*:
  - High-contrast square dot-matrix display simulating a CRT/LED screen with glowing white, pale cyan, and warm ivory wave ribbons.
  - Live animated traveling waves undulating smoothly across the pitch-black space, reacting dynamically to music playback.
- **3D Topographic Wireframe Mesh** *(Reference Image 4)*:
  - Cybernetic 3D elevation terrain mesh with valleys, ridges, and depth contours.
  - Interactive mouse-reactive parallax tilt and audio playback elevation pulse.
- **Atmosphere FX Switcher**:
  - One-click pill button in the top navigation to instantly cycle between `FX: LED MATRIX`, `FX: WIREFRAME`, and `FX: MINIMAL VOID`.
- **Haifa's Spotify Profile Integration**:
  - Preloaded with Haifa's 6 public Spotify playlists (*"19"*, *"Chill"*, *"book vibes"*, *"Track"*, *"25"*, *"Free"*) and full tracklists.
  - Instant 1-click **"SPIN CRATE (6 PLAYLISTS)"** launch card and dynamic URL resolver.

### 2. Spotify OAuth (PKCE Flow)
- **Zero Backend Secrets**: 100% client-side Proof Key for Code Exchange (PKCE) with SHA-256 code challenge generation.
- **Scopes**: `playlist-read-private`, `playlist-read-collaborative`, `user-read-private`.
- **Session Persistence**: Access tokens stored safely in `sessionStorage` with automatic expiry checks.
- **Demo Crates**: Preloaded high-contrast demo crates (Chrome Psychedelia, Metallic Drift Noir, Silver Record Vault) for instant testing without configuring a Spotify developer app.

### 3. Audio & Effects Engine
- **Metallic Ratchet & Ping**: Web Audio API high-resonance bandpass synthesis simulating mechanical steel clicks and resonant chime on landing.
- **1-Bit Pixel Spark Confetti**: Crisp white, silver, and black square sparks scattering outward on track selection.
- **Camera Aperture Wipe**: Smooth shutter wipe transition between views.
- **Synchronized Lyrics**: Real-time lyrics fetch via `lyrics.ovh` with a stark white text shimmer on active lines and charcoal dimming on inactive lines.
- **Audio Playback**: 30-second audio previews where available; if restricted by Spotify, displays a stark **"Play full track on Spotify"** button with direct track launch.

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with stark monochrome, 1-bit dither, and specular vinyl design tokens
- **Auth Protocol**: Spotify Web API (OAuth 2.0 PKCE)
- **Audio Engine**: Web Audio API (tactile metallic clicks & chimes) + HTML5 Audio
- **Deployment**: Deploy-ready for [Vercel](https://vercel.com)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Spotify (Optional)
To connect your own Spotify account:
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an App.
2. In App Settings, add your Redirect URI:
   ```
   http://localhost:3000/callback
   ```
3. Set your Client ID in `.env.local` (or enter it directly on the landing page):
   ```env
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   ```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)**.
- Click **"CONNECT SPOTIFY"** to log in with your Spotify account, or click **"EXPLORE SAMPLE CRATE"** to test immediately with curated vinyl crates!
