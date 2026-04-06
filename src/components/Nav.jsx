import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, animate } from 'framer-motion'
import './Nav.css'

const PAGES = [
  { key: 'home',     label: 'Home',     icon: 'home',            to: '/' },
  { key: 'media',    label: 'Media',    icon: 'movie',           to: '/media/' },
  { key: 'controls', label: 'Controls', icon: 'home_iot_device', to: null },
]

function activePage(pathname) {
  if (pathname.startsWith('/media')) return 'media'
  if (pathname.startsWith('/controls')) return 'controls'
  return 'home'
}

const LEAD  = { type: 'spring', stiffness: 300, damping: 28 }
const TRAIL = { type: 'spring', stiffness: 160, damping: 22, delay: 0.08 }
const SNAP  = { type: 'spring', stiffness: 400, damping: 35 }

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const active = activePage(location.pathname)

  const [hovered, setHovered] = useState(null)
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const navRef = useRef(null)
  const itemRefs = useRef({})
  const pillLeft = useMotionValue(0)
  const pillRight = useMotionValue(0)
  const initialized = useRef(false)
  const slugging = useRef(false)

  const measureAll = useCallback(() => {
    const nav = navRef.current
    if (!nav) return null
    const navRect = nav.getBoundingClientRect()
    const items = {}
    for (const [key, el] of Object.entries(itemRefs.current)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      items[key] = {
        left: r.left - navRect.left,
        right: navRect.right - r.right,
      }
    }
    return items
  }, [])

  // Position pill — on first mount jump, on route change slug-animate
  useLayoutEffect(() => {
    const items = measureAll()
    if (!items || !items[active]) return

    const to = items[active]

    if (!initialized.current) {
      pillLeft.jump(to.left)
      pillRight.jump(to.right)
      initialized.current = true
      navRef.current.querySelector('.nav-pill').style.visibility = 'visible'
      // Re-measure after framer-motion label expansion and font loading
      const remeasure = () => {
        const fresh = measureAll()
        if (fresh && fresh[active]) {
          pillLeft.jump(fresh[active].left)
          pillRight.jump(fresh[active].right)
        }
      }
      requestAnimationFrame(remeasure)
      document.fonts.ready.then(remeasure)
      return
    }

    // Slug: leading edge races ahead, trailing edge catches up
    slugging.current = true
    const curLeft = pillLeft.get()
    const goingRight = to.left > curLeft
    const trailing = animate(pillLeft,  to.left,  goingRight ? TRAIL : LEAD)
    const leading  = animate(pillRight, to.right, goingRight ? LEAD  : TRAIL)
    Promise.all([trailing.then?.(() => {}), leading.then?.(() => {})]).then(() => {
      slugging.current = false
    })
  }, [active])

  // Re-snap pill when hover shows/hides labels (shifts item widths)
  useLayoutEffect(() => {
    if (!initialized.current) return
    const items = measureAll()
    if (!items || !items[active]) return
    animate(pillLeft,  items[active].left,  SNAP)
    animate(pillRight, items[active].right, SNAP)
  }, [hovered])

  // Lock nav height after first render to prevent shrink during transitions
  useEffect(() => {
    const nav = navRef.current
    if (!nav || nav.style.minHeight) return
    const h = nav.offsetHeight
    if (h > 0) nav.style.minHeight = h + 'px'
  })

  // Re-snap pill when nav resizes (label expand, font load, etc.)
  useEffect(() => {
    if (!navRef.current) return
    const ro = new ResizeObserver(() => {
      if (!initialized.current || slugging.current) return
      const items = measureAll()
      if (!items || !items[active]) return
      animate(pillLeft,  items[active].left,  SNAP)
      animate(pillRight, items[active].right, SNAP)
    })
    ro.observe(navRef.current)
    return () => ro.disconnect()
  }, [active])

  const enabledPages = PAGES.filter(p => p.to)

  // Keyboard nav
  useEffect(() => {
    function onKeyDown(e) {
      if (focusedIdx < 0) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setFocusedIdx(i => Math.min(i + 1, enabledPages.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setFocusedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIdx(-1)
        window.dispatchEvent(new Event('unfocus-nav'))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const page = enabledPages[focusedIdx]
        if (page && page.key !== active) navigate(page.to)
      } else if (e.key === 'Escape') {
        setFocusedIdx(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focusedIdx, active, navigate, enabledPages])

  // Reset focus on route change
  useEffect(() => { setFocusedIdx(-1) }, [location.pathname])

  // Expose focused state so other components can check
  useEffect(() => {
    document.body.classList.toggle('nav-focused', focusedIdx >= 0)
    return () => document.body.classList.remove('nav-focused')
  }, [focusedIdx])

  // Allow other components (or global keys) to focus the nav
  useEffect(() => {
    function onFocusNav() {
      const idx = enabledPages.findIndex(p => p.key === active)
      setFocusedIdx(idx >= 0 ? idx : 0)
    }
    window.addEventListener('focus-nav', onFocusNav)
    return () => window.removeEventListener('focus-nav', onFocusNav)
  }, [active, enabledPages])

  // Global down-arrow when nothing else has focus → focus nav
  useEffect(() => {
    function onGlobalKey(e) {
      if (focusedIdx >= 0) return
      if (e.key !== 'ArrowDown') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      // Let Media's grid handler take priority
      if (document.querySelector('.grid')) return
      e.preventDefault()
      window.dispatchEvent(new Event('focus-nav'))
    }
    window.addEventListener('keydown', onGlobalKey)
    return () => window.removeEventListener('keydown', onGlobalKey)
  }, [focusedIdx])

  return (
    <nav ref={navRef} className="nav-island">
      <motion.div
        className="nav-pill"
        style={{ left: pillLeft, right: pillRight }}
      />
      {PAGES.map(({ key, label, icon, to }) => {
        const isActive = key === active
        const enabledIdx = enabledPages.findIndex(p => p.key === key)
        const isFocused = focusedIdx >= 0 && enabledIdx === focusedIdx
        const showLabel = isActive || hovered === key || isFocused
        const disabled = !to

        return (
          <a
            key={key}
            ref={el => itemRefs.current[key] = el}
            className={`nav-item${isActive ? ' active' : ''}${disabled ? ' disabled' : ''}${isFocused ? ' focused' : ''}`}
            onMouseEnter={() => !disabled && setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              if (!disabled && !isActive) navigate(to)
            }}
          >
            <span className="material-symbols-sharp">{icon}</span>
            <motion.span
              className="nav-label"
              initial={false}
              animate={showLabel ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
            >
              {label}
            </motion.span>
          </a>
        )
      })}
    </nav>
  )
}
