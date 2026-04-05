import { useRef } from 'react'

export default function Header({ path, query, onQueryChange, onNavigate, headerRef }) {
  const inputRef = useRef(null)

  const segments = path.split('/').filter(Boolean)
  // segments[0] is 'media' — shown as brand, rest as breadcrumbs

  function handleInput(e) {
    const val = e.target.value
    onQueryChange?.(val)
    e.target.classList.toggle('has-text', val.length > 0)
  }

  return (
    <header ref={headerRef}>
      <nav className="breadcrumbs">
        <a className="brand" onClick={() => onNavigate?.('/media/')}>MEDIA</a>
        {segments.slice(1).map((seg, i) => {
          const href = '/' + segments.slice(0, i + 2).join('/') + '/'
          return (
            <span key={href}>
              <span className="sep">/</span>
              <a onClick={() => onNavigate?.(href)}>{decodeURIComponent(seg)}</a>
            </span>
          )
        })}
      </nav>
      {onQueryChange && (
        <div className="search-wrap">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            autoComplete="off"
            value={query}
            onChange={handleInput}
            placeholder="search"
          />
          <span className="material-symbols-sharp">search</span>
        </div>
      )}
    </header>
  )
}
