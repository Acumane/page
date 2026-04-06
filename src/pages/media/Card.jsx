import { useState } from 'react'

export default function Card({
  isDir, isGoUp, isMedia, name, displayName, size,
  thumbSrc, url, selected, onClick, onSelect, onDownload,
}) {
  const [thumbError, setThumbError] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const pending = thumbSrc && !thumbError && !thumbLoaded

  const classes = [
    'card',
    isDir && 'is-dir',
    isMedia && 'is-media',
    isGoUp && 'go-up',
    selected && 'selected',
    pending && 'thumb-pending',
  ].filter(Boolean).join(' ')

  function handleClick(e) {
    onSelect?.()
    onClick?.()
  }

  function handleDownload(e) {
    e.stopPropagation()
    onDownload?.()
  }

  return (
    <div className={classes} onClick={handleClick} data-name={name} data-url={url}>
      <div className="card-thumb">
        {isGoUp ? (
          <span className="material-symbols-sharp">arrow_upward</span>
        ) : isDir ? (
          <span className="material-symbols-sharp">folder</span>
        ) : thumbSrc && !thumbError ? (
          <img loading="lazy" src={thumbSrc} alt="" onLoad={() => setThumbLoaded(true)} onError={() => setThumbError(true)} />
        ) : isMedia ? (
          <span className="material-symbols-sharp">movie</span>
        ) : (
          <span className="material-symbols-sharp">description</span>
        )}
      </div>
      <div className="card-info">
        <div className="card-text">
          <div className="card-name">{isGoUp ? '..' : (displayName || name)}</div>
          {size && <div className="card-size">{size}</div>}
        </div>
        {onDownload && (
          <span className="dl-btn" onClick={handleDownload}>
            <span className="material-symbols-sharp">download</span>
          </span>
        )}
      </div>
    </div>
  )
}
