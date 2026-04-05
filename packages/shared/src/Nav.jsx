import { useState } from 'react'
import { motion } from 'framer-motion'
import './Nav.css'

const PAGES = [
  { key: 'home',     label: 'Home',     icon: 'home',              href: 'https://bren.page' },
  { key: 'media',    label: 'Media',    icon: 'movie',             href: 'https://media.bren.page' },
  { key: 'controls', label: 'Controls', icon: 'home_iot_device',   href: null },
]

const DEV_HOSTS = {
  'localhost:5174': 'home',
  'localhost:9090': 'media',
}

function activePage() {
  const host = window.location.host
  if (DEV_HOSTS[host]) return DEV_HOSTS[host]
  if (host === 'bren.page') return 'home'
  if (host.startsWith('media.')) return 'media'
  if (host.startsWith('controls.')) return 'controls'
  return null
}

const labelVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1 },
}

export default function Nav() {
  const active = activePage()
  const [hovered, setHovered] = useState(null)

  return (
    <motion.nav
      className="nav-island"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.3 }}
    >
      {PAGES.map(({ key, label, icon, href }) => {
        const isActive = key === active
        const showLabel = isActive || hovered === key
        const disabled = !href
        const Tag = motion[href ? 'a' : 'span']

        return (
          <Tag
            key={key}
            href={href ?? undefined}
            className={`nav-item${isActive ? ' active' : ''}${disabled ? ' disabled' : ''}`}
            onMouseEnter={() => !disabled && setHovered(key)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="material-symbols-sharp">{icon}</span>
            <motion.span
              className="nav-label"
              variants={labelVariants}
              animate={showLabel ? 'visible' : 'hidden'}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {label}
            </motion.span>
          </Tag>
        )
      })}
    </motion.nav>
  )
}
