import React, { useRef, useMemo } from 'react'
import { useDeck } from '../store'
import { exportSlidePNG, exportDeckPDF } from '../utils/exporters'
import { fileToDataURL } from '../utils/imageio'

// ---- File helpers (Save/Load JSON) ----
function exportDeckJSON(deck, filename = 'deck.json') {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}
function importDeckJSON(file, callback) {
  const reader = new FileReader()
  reader.onload = () => {
    try { callback(JSON.parse(reader.result)) }
    catch { alert('Invalid deck file') }
  }
  reader.readAsText(file)
}

export default function Toolbar({ slideRef, allSlideRefs }) {
  const deck = useDeck()
  const imageFileRef = useRef()
  const importDeckRef = useRef()

  // selection helpers
  const selectedId = useMemo(() => Array.from(deck.selection)[0], [deck.selection])
  const selectedObj = useMemo(() => {
    const s = deck.slides[deck.current]
    return s?.objects?.find(o => o.id === selectedId)
  }, [deck.slides, deck.current, selectedId])

  const isText = selectedObj?.type === 'text'
  const isShape = selectedObj?.type === 'shape'

  // ---- object creators ----
  const addText = () =>
    deck.addObject({
      type: 'text',
      x: 80, y: 80, w: 360, h: 90,
      data: {
        text: 'Double-click to edit',
        size: 28, color: '#e5e7eb', align: 'left',
        weight: 700, font: 'Arial', italic: false
      }
    })
  const addShape = (shape) =>
    deck.addObject({
      type: 'shape',
      x: 120, y: 120, w: 240, h: 150,
      data: { shape, color: '#22d3ee', stroke: '#0ea5b7', fill: true, strokeWidth: 3 }
    })

  const onImageUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    try {
      const dataUrl = await fileToDataURL(f) // persistent
      // optional preview URL for current session (not saved)
      const previewUrl = URL.createObjectURL(f)
      deck.addObject({
        type: 'image',
        x: 100, y: 100, w: 360, h: 240,
        data: { dataUrl, previewUrl, name: f.name }
      })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10 overflow-x-auto">
      {/* Slides */}
      <button className="btn" onClick={() => deck.addSlide()}>+ Slide</button>
      <button className="btn-outline" onClick={() => deck.removeSlide(deck.current)}>Delete</button>
      <div className="mx-1 w-px h-6 bg-zinc-700" />

      {/* Insert */}
      <button className="btn-outline" onClick={addText}>Text</button>
      <button className="btn-outline" onClick={() => addShape('rect')}>Rect</button>
      <button className="btn-outline" onClick={() => addShape('ellipse')}>Ellipse</button>
      <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
      <button className="btn-outline" onClick={() => imageFileRef.current?.click()}>Image</button>

      <div className="mx-1 w-px h-6 bg-zinc-700" />

      {/* Export */}
      <button
        className="btn"
        onClick={() => slideRef.current && exportSlidePNG(slideRef.current, `slide-${deck.current + 1}.png`)}
      >Export PNG</button>
      <button
        className="btn"
        onClick={() => exportDeckPDF(allSlideRefs.current.filter(Boolean), `deck-${deck.title || 'untitled'}.pdf`)}
      >Export PDF</button>

      <div className="mx-1 w-px h-6 bg-zinc-700" />

      {/* Save / Load (JSON) */}
      <button
        className="btn-outline"
        onClick={() => {
          const { title, slides } = deck
          exportDeckJSON({ title, slides }, `${deck.title || 'deck'}.json`)
        }}
      >Save</button>

      <input
        ref={importDeckRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return
          importDeckJSON(f, (parsed) => {
            if (!parsed?.slides) return alert('Invalid deck file')
            deck.reset()
            deck.setTitle(parsed.title || 'Imported Deck')
            parsed.slides.forEach((s, i) => {
              if (i === 0) deck.updateSlide(0, s)
              else deck.addSlide(s)
            })
          })
          e.target.value = ''
        }}
      />
      <button className="btn-outline" onClick={() => importDeckRef.current?.click()}>Load</button>

      <div className="mx-1 w-px h-6 bg-zinc-700" />

      {/* Layering */}
      <button className="btn-outline" disabled={!selectedObj} onClick={() => selectedId && deck.moveForward(selectedId)}>Bring ↑</button>
      <button className="btn-outline" disabled={!selectedObj} onClick={() => selectedId && deck.moveBackward(selectedId)}>Send ↓</button>

      {/* TEXT controls */}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-xs text-zinc-400">Text</span>
        <select
          className="bg-zinc-800 text-sm text-white rounded px-2 py-1"
          disabled={!isText}
          value={isText ? selectedObj.data.font : 'Arial'}
          onChange={(e) => deck.updateObjectData(selectedId, { font: e.target.value })}
        >
          <option>Arial</option>
          <option>Georgia</option>
          <option>Courier New</option>
          <option>Verdana</option>
          <option>Times New Roman</option>
        </select>
        <input
          type="number" min="8" max="160"
          className="w-16 bg-zinc-800 text-sm text-white rounded px-2 py-1"
          disabled={!isText}
          value={isText ? selectedObj.data.size : 28}
          onChange={(e) => deck.updateObjectData(selectedId, { size: parseInt(e.target.value) || 12 })}
        />
        <button className="btn-outline" disabled={!isText}
          onClick={() => deck.updateObjectData(selectedId, { italic: !selectedObj.data.italic })}>Italic</button>
        <button className="btn-outline" disabled={!isText}
          onClick={() => deck.updateObjectData(selectedId, { weight: selectedObj.data.weight === 700 ? 400 : 700 })}>Bold</button>
      </div>

      {/* SHAPE controls */}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-xs text-zinc-400">Shape</span>
        <label className="text-xs text-zinc-400">Fill</label>
        <input
          type="color" disabled={!isShape}
          value={isShape ? (selectedObj.data.color || '#22d3ee') : '#22d3ee'}
          onChange={(e) => deck.updateObjectData(selectedId, { color: e.target.value })}
          className="w-8 h-8 rounded border border-zinc-700 cursor-pointer disabled:opacity-40"
        />
        <label className="text-xs text-zinc-400">Stroke</label>
        <input
          type="color" disabled={!isShape}
          value={isShape ? (selectedObj.data.stroke || '#0ea5b7') : '#0ea5b7'}
          onChange={(e) => deck.updateObjectData(selectedId, { stroke: e.target.value })}
          className="w-8 h-8 rounded border border-zinc-700 cursor-pointer disabled:opacity-40"
        />
        <label className="text-xs text-zinc-400">Width</label>
        <input
          type="number" min="0" max="40" disabled={!isShape}
          className="w-16 bg-zinc-800 text-sm text-white rounded px-2 py-1 disabled:opacity-40"
          value={isShape ? (selectedObj.data.strokeWidth ?? 3) : 3}
          onChange={(e) => deck.updateObjectData(selectedId, { strokeWidth: Math.max(0, parseInt(e.target.value) || 0) })}
        />
        <button className="btn-outline" disabled={!isShape}
          onClick={() => deck.updateObjectData(selectedId, { fill: !selectedObj.data.fill })}>Toggle Fill</button>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <input
          value={deck.title}
          onChange={(e) => deck.setTitle(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
          placeholder="Deck title"
        />
        <button className="btn-outline" onClick={() => deck.reset()}>New</button>
      </div>
    </div>
  )
}
