import { useEffect, useRef } from 'react'
import './Reticle.css'

const DARK = '#32323D', DIM = '#404048'
const CLICKABLE = 'button, a, input[type="button"], input[type="submit"], [onclick]'

export default function Reticle() {
  const vLineRef = useRef(null), hLineRef = useRef(null), maskRef = useRef(null)
  const dotRef = useRef(null), selRef = useRef(null), retActRef = useRef(null)

  useEffect(() => {
    const vLine = vLineRef.current, hLine = hLineRef.current, mask = maskRef.current
    const dot = dotRef.current, sel = selRef.current, retAct = retActRef.current
    const rets = [vLine, hLine, mask]

    let over = false, returning = false, init = false, lastDown = 0, i = 0, raf = 0
    let mx = 0, my = 0

    const pos = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px' }
    const opacity = (els, v) => els.forEach(el => el.style.opacity = v)

    function onMove(e) {
      mx = e.clientX; my = e.clientY
      if (!over) {
        if (!init) { opacity(rets, '1'); sel.style.opacity = '0.4'; init = true }
        if (!returning) pos(sel, mx - 3, my - 3)
      }
      pos(mask, mx - 13.5, my - 13.5)
      pos(dot, mx - 1, my - 1)
      vLine.style.left = mx + 1 + 'px'
      hLine.style.top = my + 1 + 'px'
    }

    function onLeave() { opacity(rets, '0'); sel.style.opacity = '0'; onUp() }
    function onEnter() { if (init) { opacity(rets, '1'); sel.style.opacity = '0.4' } }

    function onDown() {
      if (returning) return
      if (!over) {
        lastDown = Date.now()
        sel.style.transform = 'scale(0.5)'
        mask.style.transform = 'scale(0.6)'
        dot.style.opacity = '1'
        vLine.style.borderColor = hLine.style.borderColor = DIM
      } else {
        sel.style.transform = 'scale(0.92)'
      }
    }

    function onUp() {
      const delay = (Date.now() - lastDown) < 200 ? 200 : 0
      setTimeout(() => {
        dot.style.opacity = '0'
        mask.style.transform = sel.style.transform = 'unset'
        vLine.style.borderColor = hLine.style.borderColor = DARK
      }, delay)
    }

    function onOver(e) {
      const el = e.target.closest(CLICKABLE)
      if (!el) return
      over = true; returning = false; cancelAnimationFrame(raf)
      const rect = el.getBoundingClientRect()
      const cy = rect.top + rect.height / 2

      opacity(rets, '0')
      retAct.style.visibility = 'visible'
      retAct.textContent = el.dataset.act || ''
      pos(retAct,
        el.tagName === 'A' ? rect.right + 10 : rect.left,
        el.tagName === 'A' ? cy - 8 : rect.bottom + 10
      )

      Object.assign(sel.style, {
        top: rect.top - 6 + 'px', left: rect.left - 6 + 'px',
        width: rect.width + 4 + 'px', height: rect.height + 4 + 'px',
        opacity: '1', outlineColor: 'white',
        transition: 'all 0.2s, transform 0.1s',
        transitionTimingFunction: 'ease-out',
      })

      const pulse = () => {
        i += 1
        sel.style.opacity = `${Math.sin(i * 0.02) / 4 + 0.75}`
        if (over) requestAnimationFrame(pulse)
        else { sel.style.opacity = '0.4'; i = 0 }
      }
      pulse()
    }

    function onOut(e) {
      if (!e.target.closest(CLICKABLE)) return
      over = false; returning = true
      opacity(rets, '1')
      retAct.style.visibility = 'hidden'

      Object.assign(sel.style, {
        transition: 'width 0.2s ease-out, height 0.2s ease-out, opacity 0.25s ease-out',
        width: '1px', height: '1px', opacity: '0.4',
      })

      const t0 = Date.now()
      cancelAnimationFrame(raf)

      const chase = () => {
        const elapsed = (Date.now() - t0) / 1000
        const t = Math.min(elapsed / 0.8, 1)
        const lerp = 0.08 + t * t * 0.5
        const sx = sel.getBoundingClientRect().left + 3
        const sy = sel.getBoundingClientRect().top + 3
        const dx = mx - sx, dy = my - sy

        if ((Math.abs(dx) < 1 && Math.abs(dy) < 1) || elapsed > 1) {
          returning = false
          pos(sel, mx - 3, my - 3)
          sel.style.transition = 'transform 0.2s, opacity 0.25s, width 0.2s, height 0.2s'
          sel.style.transitionTimingFunction = 'ease-out'
          return
        }
        pos(sel, sx + dx * lerp - 3, sy + dy * lerp - 3)
        raf = requestAnimationFrame(chase)
      }
      raf = requestAnimationFrame(chase)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="ret" ref={vLineRef} id="v-line" />
      <div className="ret" ref={hLineRef} id="h-line" />
      <div className="ret" ref={maskRef} id="ret-mask" />
      <div ref={dotRef} id="dot" />
      <span ref={retActRef} id="ret-action" />
      <div ref={selRef} id="sel" />
    </>
  )
}
