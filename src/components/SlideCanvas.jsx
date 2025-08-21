import React, { useEffect, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { useDeck } from '../store'

function TextBox({ obj, onChange }) {
  return (
    <div
      className="w-full h-full p-2 outline outline-1 outline-zinc-700 bg-transparent"
      style={{
        color: obj.data.color,
        fontSize: obj.data.size,
        fontWeight: obj.data.weight,
        textAlign: obj.data.align,
        fontFamily: obj.data.font,
        fontStyle: obj.data.italic ? 'italic' : 'normal',
      }}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange({ data: { ...obj.data, text: e.currentTarget.innerText } })}
        className="w-full h-full"
      >
        {obj.data.text}
      </div>
    </div>
  )
}

function ShapeBox({ obj }) {
  const style = { width: '100%', height: '100%' }
  const strokeW = Math.max(0, obj.data.strokeWidth ?? 3)
  if (obj.data.shape === 'ellipse') {
    return (
      <div
        style={{
          ...style,
          background: obj.data.fill ? obj.data.color : 'transparent',
          border: `${strokeW}px solid ${obj.data.stroke || obj.data.color}`,
          borderRadius: '9999px',
        }}
      />
    )
  }
  return (
    <div
      style={{
        ...style,
        background: obj.data.fill ? obj.data.color : 'transparent',
        border: `${strokeW}px solid ${obj.data.stroke || obj.data.color}`,
      }}
    />
  )
}

function ImageBox({ obj }) {
  // Prefer persistent dataUrl; fall back to previewUrl if present
  const src = obj.data.dataUrl || obj.data.previewUrl || obj.data.url || ''
  return (
    <img
      src={src}
      alt={obj.data.name || ''}
      className="w-full h-full object-contain pointer-events-none select-none"
      draggable={false}
    />
  )
}

export default function SlideCanvas({ slideRef }) {
  const deck = useDeck()
  const slide = deck.slides[deck.current]
  const containerRef = useRef()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKey = (e) => {
      if (e.key === 'Delete') {
        for (const id of deck.selection) deck.removeObject(id)
        deck.clearSelection()
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        const id = Array.from(deck.selection)[0]
        const obj = slide.objects.find((o) => o.id === id)
        if (obj) deck.addObject({ ...obj, x: obj.x + 20, y: obj.y + 20, id: undefined })
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [deck, slide])

  return (
    <div className="flex-1 flex items-center justify-center p-6" tabIndex={0} ref={containerRef}>
      <div
        ref={slideRef}
        className="relative w-[1280px] h-[720px] shadow-2xl border border-zinc-700 rounded-2xl overflow-hidden"
        style={{ background: slide.background.color }}
      >
        {slide.objects.map((obj) => (
          <Rnd
            key={obj.id}
            size={{ width: obj.w, height: obj.h }}
            position={{ x: obj.x, y: obj.y }}
            onDragStop={(e, d) => deck.updateObject(obj.id, { x: Math.round(d.x), y: Math.round(d.y) })}
            onResizeStop={(e, dir, ref, delta, pos) =>
              deck.updateObject(obj.id, {
                w: Math.round(ref.offsetWidth),
                h: Math.round(ref.offsetHeight),
                x: Math.round(pos.x),
                y: Math.round(pos.y),
              })
            }
            bounds="parent"
            onClick={(e) => deck.select(obj.id, e.shiftKey)}
            className={`group ${deck.selection.has(obj.id) ? 'ring-2 ring-brand-500' : ''}`}
          >
            <div className="w-full h-full">
              {obj.type === 'text' && <TextBox obj={obj} onChange={(p) => deck.updateObject(obj.id, p)} />}
              {obj.type === 'shape' && <ShapeBox obj={obj} />}
              {obj.type === 'image' && <ImageBox obj={obj} />}
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  )
}
