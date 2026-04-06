import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Search from './Header'
import Card from './Card'
import Toast from './Toast'
import './media.css'

const MEDIA_EXTS = ['.mp4', '.mkv', '.avi', '.mov', '.m4v', '.webm']

function humanSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  const units = ['KB', 'MB', 'GB', 'TB']
  let i = -1, size = bytes
  do { size /= 1024; i++ } while (size >= 1024 && i < units.length - 1)
  return size.toFixed(size < 10 ? 1 : 0) + ' ' + units[i]
}

function ext(name) {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i) : ''
}

function stripExt(name) {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(0, i) : name
}

export default function Media() {
  const location = useLocation()
  const routerNavigate = useNavigate()
  const path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/'

  const [items, setItems] = useState(null)
  const [denied, setDenied] = useState(null)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [toast, setToast] = useState('')
  const gridRef = useRef(null)
  const lastSelectedIdx = useRef(-1)

  const navigate = useCallback((newPath) => {
    const normalized = newPath.endsWith('/') ? newPath : newPath + '/'
    routerNavigate(normalized)
  }, [routerNavigate])

  // Reset search/selection on path change
  useEffect(() => {
    setQuery('')
    setSelectedIdx(-1)
  }, [path])

  useEffect(() => {
    document.title = 'media \u2014 bren.page'
  }, [])

  // scroll shadows
  useEffect(() => {
    function update() {
      const { scrollY, innerHeight } = window
      const maxScroll = document.documentElement.scrollHeight - innerHeight
      document.body.classList.toggle('scroll-top', scrollY > 0)
      document.body.classList.toggle('scroll-bottom', scrollY < maxScroll - 1)
    }
    update()
    window.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      document.body.classList.remove('scroll-top', 'scroll-bottom')
    }
  }, [items])

  useEffect(() => {
    setItems(null)
    // setDenied(403); return
    fetch(path, { headers: { Accept: 'application/json' } })
      .then(res => {
        if (res.status === 403 || res.status === 401) { setDenied(res.status); return null }
        if (!res.ok) { setDenied(res.status); return null }
        return res.json()
      })
      .then(data => { if (data) setItems(data) })
      .catch(() => setDenied(0))
  }, [path])

  const filtered = items?.filter(item =>
    !item.name.startsWith('.') &&
    (!query || item.name.toLowerCase().includes(query.toLowerCase()))
  ) ?? []

  const canGoUp = path !== '/media/'

  const visibleCards = (canGoUp ? 1 : 0) + filtered.length

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 1500)
  }

  function getColumns() {
    const grid = gridRef.current
    if (!grid) return 1
    const cards = grid.querySelectorAll('.card')
    if (cards.length < 2) return 1
    const firstTop = cards[0].offsetTop
    for (let i = 1; i < cards.length; i++) {
      if (cards[i].offsetTop !== firstTop) return i
    }
    return cards.length
  }

  function scrollToCard(idx) {
    const grid = gridRef.current
    if (!grid) return
    const card = grid.querySelectorAll('.card')[idx]
    if (!card) return
    const rect = card.getBoundingClientRect()
    if (rect.top < 8) {
      window.scrollBy(0, rect.top - 8)
    } else if (rect.bottom > window.innerHeight) {
      window.scrollBy(0, rect.bottom - window.innerHeight + 8)
    }
  }

  // Restore card selection when Nav gives focus back
  useEffect(() => {
    function onUnfocusNav() {
      if (lastSelectedIdx.current >= 0) {
        const idx = Math.min(lastSelectedIdx.current, visibleCards - 1)
        setSelectedIdx(idx)
        setTimeout(() => scrollToCard(idx), 0)
        lastSelectedIdx.current = -1
      }
    }
    window.addEventListener('unfocus-nav', onUnfocusNav)
    return () => window.removeEventListener('unfocus-nav', onUnfocusNav)
  }, [visibleCards])

  // keyboard nav
  useEffect(() => {
    function onKeyDown(e) {
      if (document.body.classList.contains('nav-focused')) return
      const input = document.querySelector('.search-input')
      const inSearch = document.activeElement === input

      if ((e.ctrlKey && e.key === 'f') || (e.key === '/' && !inSearch)) {
        e.preventDefault()
        input?.focus()
        input?.select()
        return
      }

      if (!inSearch && e.ctrlKey && e.key === 'c' && selectedIdx >= 0) {
        const card = gridRef.current?.querySelectorAll('.card')[selectedIdx]
        if (card) {
          e.preventDefault()
          const url = card.dataset.url
          if (url) navigator.clipboard.writeText(window.location.origin + url).then(() => showToast('Copied URL'))
        }
        return
      }

      if (!inSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (input) {
          input.focus()
          input.value = e.key
          e.preventDefault()
          setQuery(e.key)
        }
        return
      }

      if (e.key === 'Escape') {
        if (inSearch) {
          input.blur()
        } else if (query) {
          setQuery('')
        }
        setSelectedIdx(-1)
        return
      }

      if (inSearch) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          input.blur()
          setSelectedIdx(0)
          setTimeout(() => scrollToCard(0), 0)
        }
        return
      }

      const cols = getColumns()
      let next = selectedIdx

      if (e.key === 'ArrowRight') {
        next = Math.min((selectedIdx < 0 ? -1 : selectedIdx) + 1, visibleCards - 1)
      } else if (e.key === 'ArrowLeft') {
        next = Math.max((selectedIdx < 0 ? 0 : selectedIdx) - 1, 0)
      } else if (e.key === 'ArrowDown') {
        next = (selectedIdx < 0 ? 0 : selectedIdx) + cols
        if (next >= visibleCards) {
          e.preventDefault()
          lastSelectedIdx.current = selectedIdx
          setSelectedIdx(-1)
          window.dispatchEvent(new Event('focus-nav'))
          return
        }
      } else if (e.key === 'ArrowUp') {
        next = (selectedIdx < 0 ? 0 : selectedIdx) - cols
        if (next < 0) {
          setSelectedIdx(-1)
          input?.focus()
          input?.select()
          return
        }
      } else if (e.key === 'Enter' && selectedIdx >= 0) {
        e.preventDefault()
        const adjustedIdx = canGoUp ? selectedIdx - 1 : selectedIdx
        if (canGoUp && selectedIdx === 0) {
          navigate(path.replace(/[^/]+\/$/, ''))
        } else if (filtered[adjustedIdx]?.is_dir) {
          navigate(path + filtered[adjustedIdx].name + '/')
        } else if (filtered[adjustedIdx]) {
          window.location.href = path + encodeURIComponent(filtered[adjustedIdx].name)
        }
        return
      } else return

      e.preventDefault()
      setSelectedIdx(next)
      setTimeout(() => scrollToCard(next), 0)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIdx, query, items, path, canGoUp, filtered, visibleCards, navigate])

  if (denied !== null) {
    return (
      <div className="page-media">
        <pre className="denied-greet">{`# Error ${denied || '???'} — Not authorized`}</pre>
      </div>
    )
  }

  return (
    <div className="page-media">
      <Search query={query} onQueryChange={setQuery} />
      <div className="grid" ref={gridRef}>
        {canGoUp && (
          <Card
            key=".."
            isDir
            isGoUp
            name=".."
            selected={selectedIdx === 0}
            onClick={() => navigate(path.replace(/[^/]+\/$/, ''))}
            onSelect={() => setSelectedIdx(0)}
            url=".."
          />
        )}
        {filtered.map((item, i) => {
          const idx = canGoUp ? i + 1 : i
          const isMedia = !item.is_dir && MEDIA_EXTS.includes(ext(item.name).toLowerCase())
          return (
            <Card
              key={item.name}
              isDir={item.is_dir}
              isMedia={isMedia}
              name={item.name}
              displayName={item.is_dir ? item.name : stripExt(item.name)}
              size={item.is_dir ? null : humanSize(item.size)}
              thumbSrc={isMedia ? `${path}.thumbs/${encodeURIComponent(stripExt(item.name))}.png` : null}
              url={path + encodeURIComponent(item.name) + (item.is_dir ? '/' : '')}
              selected={selectedIdx === idx}
              onClick={() => {
                if (item.is_dir) navigate(path + item.name + '/')
                else window.location.href = path + encodeURIComponent(item.name)
              }}
              onSelect={() => setSelectedIdx(idx)}
              onDownload={!item.is_dir ? () => {
                const a = document.createElement('a')
                a.href = path + encodeURIComponent(item.name)
                a.download = ''
                a.click()
              } : null}
            />
          )
        })}
      </div>
      <Toast message={toast} />
    </div>
  )
}
