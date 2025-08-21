import { create } from 'zustand'

const blankSlide = () => ({
  id: crypto.randomUUID(),
  name: 'Slide',
  background: { color: '#0b1020', image: null },
  objects: [] // {id, type, x,y,w,h, rotation, data:{}}
})

const persistKey = 'cspowerslide:v1'

export const useDeck = create((set, get) => ({
  title: 'Untitled Deck',
  slides: [blankSlide()],
  current: 0,
  selection: new Set(),

  // ---- SLIDE ACTIONS ----
  addSlide() {
    const slides = [...get().slides, blankSlide()]
    set({ slides, current: slides.length - 1 })
    get().save()
  },
  removeSlide(index) {
    const slides = get().slides.slice()
    if (slides.length <= 1) return
    slides.splice(index, 1)
    set({ slides, current: Math.max(0, get().current - 1) })
    get().save()
  },
  setCurrent(i) { set({ current: i }) },
  renameSlide(i, name) {
    const slides = get().slides.slice()
    slides[i] = { ...slides[i], name }
    set({ slides }); get().save()
  },
  updateSlide(i, patch) {
    const slides = get().slides.slice()
    slides[i] = { ...slides[i], ...patch }
    set({ slides }); get().save()
  },

  // ---- OBJECTS ----
  addObject(obj) {
    const slides = get().slides.slice()
    const s = slides[get().current]
    const o = { id: crypto.randomUUID(), rotation: 0, ...obj }
    s.objects = [...s.objects, o]
    slides[get().current] = { ...s }
    set({ slides }); get().save()
  },
  updateObject(id, patch) {
    const slides = get().slides.slice()
    const s = slides[get().current]
    s.objects = s.objects.map(o => o.id === id ? { ...o, ...patch } : o)
    slides[get().current] = { ...s }
    set({ slides }); get().save()
  },
  updateObjectData(id, newData) {
    const slides = get().slides.slice()
    const s = slides[get().current]
    s.objects = s.objects.map(o =>
      o.id === id ? { ...o, data: { ...o.data, ...newData } } : o
    )
    slides[get().current] = { ...s }
    set({ slides }); get().save()
  },
  removeObject(id) {
    const slides = get().slides.slice()
    const s = slides[get().current]
    s.objects = s.objects.filter(o => o.id !== id)
    slides[get().current] = { ...s }
    set({ slides }); get().save()
  },

  // ---- LAYERING ----
  moveForward(id) {
    const slides = get().slides.slice()
    const s = slides[get().current]
    const i = s.objects.findIndex(o => o.id === id)
    if (i >= 0 && i < s.objects.length - 1) {
      const arr = s.objects.slice()
      const [item] = arr.splice(i, 1)
      arr.splice(i + 1, 0, item)
      s.objects = arr
      slides[get().current] = { ...s }
      set({ slides }); get().save()
    }
  },
  moveBackward(id) {
    const slides = get().slides.slice()
    const s = slides[get().current]
    const i = s.objects.findIndex(o => o.id === id)
    if (i > 0) {
      const arr = s.objects.slice()
      const [item] = arr.splice(i, 1)
      arr.splice(i - 1, 0, item)
      s.objects = arr
      slides[get().current] = { ...s }
      set({ slides }); get().save()
    }
  },

  // ---- SELECTION ----
  clearSelection() { set({ selection: new Set() }) },
  select(id, additive=false) {
    const sel = new Set(additive ? get().selection : [])
    if (sel.has(id)) sel.delete(id); else sel.add(id)
    set({ selection: sel })
  },

  // ---- META ----
  setTitle(t) { set({ title: t }); get().save() },
  save() {
    const { title, slides } = get()
    localStorage.setItem(persistKey, JSON.stringify({ title, slides }))
  },
  load() {
    const raw = localStorage.getItem(persistKey)
    if (!raw) return
    try {
      const { title, slides } = JSON.parse(raw)
      set({ title, slides, current: 0, selection: new Set() })
    } catch {}
  },
  reset() {
    set({ title: 'Untitled Deck', slides: [blankSlide()], current: 0, selection: new Set() })
    get().save()
  }
}))
