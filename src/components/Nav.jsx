import { useState, useRef, useCallback, useLayoutEffect } from 'react'
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

const LEAD  = { type: 'spring', stiffness: 300, damping: 30 }
const TRAIL = { type: 'spring', stiffness: 120, damping: 20 }
const SNAP  = { type: 'spring', stiffness: 400, damping: 35 }

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const active = activePage(location.pathname)

  const [hovered, setHovered] = useState(null)
  const navRef = useRef(null)
  const itemRefs = useRef({})
  const pillLeft = useMotionValue(0)
  const pillRight = useMotionValue(0)
  const initialized = useRef(false)

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
      return
    }

    // Slug: leading edge races ahead, trailing edge catches up
    const curLeft = pillLeft.get()
    const goingRight = to.left > curLeft
    animate(pillLeft,  to.left,  goingRight ? TRAIL : LEAD)
    animate(pillRight, to.right, goingRight ? LEAD  : TRAIL)
  }, [active])

  // Re-snap pill when hover shows/hides labels (shifts item widths)
  useLayoutEffect(() => {
    if (!initialized.current) return
    const items = measureAll()
    if (!items || !items[active]) return
    animate(pillLeft,  items[active].left,  SNAP)
    animate(pillRight, items[active].right, SNAP)
  }, [hovered])

  return (
    <nav ref={navRef} className="nav-island">
      <motion.div
        className="nav-pill"
        style={{ left: pillLeft, right: pillRight }}
      />
      {PAGES.map(({ key, label, icon, to }) => {
        const isActive = key === active
        const showLabel = isActive || hovered === key
        const disabled = !to

        return (
          <a
            key={key}
            ref={el => itemRefs.current[key] = el}
            className={`nav-item${isActive ? ' active' : ''}${disabled ? ' disabled' : ''}`}
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
