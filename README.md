# Cybersoft PowerSlide

A lightweight, local-first slide maker — built with React + Vite. Create slides, add text/shapes/images, drag & resize, and export to PNG or PDF. No auth, no backend. Runs entirely in the browser.

## Features
- 🧩 Add **Text**, **Rectangles**, **Ellipses**, and **Images**
- 🖱️ Drag / resize items; double‑click text to edit
- 🎨 Change slide background color
- 🗂️ Multiple slides with thumbnails, renaming & delete
- 💾 **Auto-save** to `localStorage`
- ⬇️ Export current slide as **PNG** or whole deck to **PDF**
- ⌨️ Shortcuts: `Delete` (remove selected), `Ctrl+D` (duplicate selected)

## Quickstart
```bash
# 1) Install tools
npm i

# 2) Run the dev server
npm run dev

# 3) Build for production
npm run build
npm run preview  # optional local preview
```

Then open the app at the URL printed in your terminal (usually http://localhost:5173).

## Tech
- React, Vite
- Tailwind CSS
- Zustand (state)
- react-rnd for drag/resize
- html2canvas + jsPDF for export

## Notes
- Exports render your current slide size (1280×720). You can adjust this in `SlideCanvas.jsx` if needed.
- Image uploads are kept in-memory via `URL.createObjectURL()` — if you need persistence across sessions, swap to IndexedDB.
- All data is local to your browser. Clearing site data will reset your deck.
