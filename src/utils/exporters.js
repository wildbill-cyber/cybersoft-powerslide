import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportSlidePNG(el, filename='slide.png') {
  const canvas = await html2canvas(el, { backgroundColor: null, useCORS: true, scale: 2 })
  const data = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = data
  a.download = filename
  a.click()
}

export async function exportDeckPDF(slideEls, filename='deck.pdf') {
  const canvases = []
  for (const el of slideEls) {
    const c = await html2canvas(el, { backgroundColor: '#0b1020', useCORS: true, scale: 2 })
    canvases.push(c)
  }
  const w = canvases[0].width, h = canvases[0].height
  const pdf = new jsPDF({ orientation: w >= h ? 'l' : 'p', unit: 'px', format: [w, h] })
  canvases.forEach((c, i) => {
    if (i > 0) pdf.addPage([w, h], w >= h ? 'l' : 'p')
    pdf.addImage(c, 'PNG', 0, 0, w, h)
  })
  pdf.save(filename)
}
