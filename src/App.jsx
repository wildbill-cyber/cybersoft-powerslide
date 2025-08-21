import React, { useMemo, useRef } from 'react'
import Sidebar from './components/Sidebar.jsx'
import SlideCanvas from './components/SlideCanvas.jsx'
import Toolbar from './components/Toolbar.jsx'
import { useDeck } from './store.js'

export default function App() {
  const slideRef = useRef(null)
  const allSlideRefs = useRef([])
  const deck = useDeck()

  const year = useMemo(()=> new Date().getFullYear(), [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-3 border-b border-zinc-800 flex items-center gap-3">
        <img src="/favicon.svg" className="w-8 h-8" alt="logo" />
        <h1 className="text-xl font-bold">Cybersoft PowerSlide</h1>
        <span className="text-zinc-500 text-sm">— quick, local, no login</span>
      </header>

      <Toolbar slideRef={slideRef} allSlideRefs={allSlideRefs} />

      <div className="flex flex-1">
        <Sidebar allSlideRefs={allSlideRefs} />
        <SlideCanvas slideRef={slideRef} />
      </div>

      <footer className="p-3 text-center text-xs text-zinc-500 border-t border-zinc-800">
        © {year} Cybersoft — PowerSlide
      </footer>
    </div>
  )
}
