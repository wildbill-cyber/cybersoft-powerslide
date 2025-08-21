import React, { useEffect } from 'react'
import { useDeck } from '../store'

export default function Sidebar({ allSlideRefs }) {
  const deck = useDeck()

  useEffect(() => { deck.load() }, [])

  return (
    <aside className="w-52 p-3 border-r border-zinc-800 overflow-auto">
      <h2 className="text-xs uppercase text-zinc-400 mb-2">Slides</h2>
      <div className="grid gap-3">
        {deck.slides.map((s, i) => (
          <button key={s.id}
            className={`rounded-xl overflow-hidden border ${i===deck.current?'border-brand-500':'border-zinc-700'} hover:border-zinc-500 text-left`}
            onClick={() => deck.setCurrent(i)}>
            <div className="bg-zinc-900">
              <div className="aspect-video bg-zinc-800">
                {/* thumbnail via CSS transform */}
                <div className="origin-top-left scale-[0.16] -translate-x-[105px] -translate-y-[70px] pointer-events-none">
                  <div ref={el => allSlideRefs.current[i] = el} className="w-[1280px] h-[720px] bg-zinc-900 relative">
                    <div className="absolute inset-0" style={{background:s.background.color}} />
                    {/* objects will be cloned by main canvas when needed; keep placeholder for export */}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-2 py-1">
              <input
                className="bg-transparent text-sm w-full text-zinc-200 outline-none"
                value={s.name}
                onChange={e => deck.renameSlide(i, e.target.value)}
              />
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
