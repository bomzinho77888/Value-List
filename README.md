# 🐾 Pet Simulator X — Exclusive Value List & Database

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Framer_Motion-14-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/GSAP-3-0AE448?style=for-the-badge&logo=greensock&logoColor=black" alt="GSAP" />
  <img src="https://img.shields.io/badge/Lenis-Smooth_Scroll-purple?style=for-the-badge" alt="Lenis" />
</p>

An ultra-fluid, modern web application for tracking and exploring **Pet Simulator X** (Roblox) Exclusive pet values, variants, demand, and trends. Built with **React 18**, **Vite**, **Framer Motion**, and full touch compatibility for mobile and tablet devices.

---

## ✨ Key Features

- 💎 **Exclusives Only Catalog:** Curated database focusing exclusively on Exclusive and Huge pets with the latest trading market values.
- 🔍 **Real-Time Search:** Instant search by pet name or variant.
- 📱 **Mobile & Tablet Optimized:**
  - Responsive 2-column grid layout for smartphones and compact tablets.
  - Multi-touch 3D tilt, tactile spring physics, and dynamic holograph sheen.
  - Horizontally swipeable filter segments with zero lag.
- 🌈 **Official Variant Rules:**
  - **Regular Exclusives:** Normal variant only.
  - **Huge Pets:** Normal, Golden, and Rainbow variants.
- 🛡️ **Anti-Adware Protection:** Real-time DOM interception that instantly purges any `/html/body/iframe` injected by free hostings or third-party scripts.
- ⚡ **High-Performance Architecture:**
  - **Lenis Smooth Scroll** engine with 60fps physics interpolation.
  - Progressive lazy-loading and GPU-accelerated 3D parallax cards.
  - Fast asset delivery directly from GitHub Raw & jsDelivr global CDN.

---

## 🛠️ Tech Stack

- **Frontend:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://greensock.com/gsap/)
- **Scroll Engine:** [Lenis](https://github.com/darkroomengineering/lenis)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```plaintext
Value-List/
├── Images/              # Pet sprites and assets categorized by world/zone
├── Values/              # JSON definitions containing trading values, demand & trend
├── Pets/                # Additional pet metadata (IDs, names, rarities)
├── collection.json      # Compiled single-file database for high-speed CDN delivery
├── src/
│   ├── App.jsx          # Main application, state management & touch card logic
│   ├── main.jsx         # React application entrypoint
│   └── index.css        # Obsidian & Neon design system with mobile media queries
├── index.html           # HTML5 shell with iframe purge defense
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and build scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer)
- Package manager (`npm`, `pnpm`, or `yarn`)

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bomzinho77888/Value-List.git
   cd Value-List
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` to explore the value list.

---

## 📦 Production Build

To build the static optimized application for production (ready for Vercel, Netlify, or GitHub Pages):

```bash
npm run build
```

Production output will be generated inside the `dist/` directory.

---

## 📜 License

Distributed under the MIT License.
