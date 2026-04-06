import { useState } from 'react'

export default function Card({
  isDir, isGoUp, isMedia, name, displayName, size,
  thumbSrc, url, selected, onClick, onSelect, onDownload, onPlay,
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

  function handlePlay(e) {
    if (selected && isMedia && onPlay) {
      e.stopPropagation()
      onPlay()
    }
  }

  return (
    <div className={classes} onClick={handleClick} data-name={name} data-url={url}>
      <div className="card-thumb" onClick={handlePlay}>
        {isGoUp ? (
          <span className="material-symbols-sharp">arrow_upward</span>
        ) : isDir ? (
          <span className="material-symbols-sharp">folder</span>
        ) : thumbSrc && !thumbError ? (
          <img loading="lazy" src={thumbSrc} alt="" onLoad={() => setThumbLoaded(true)} onError={() => setThumbError(true)} />
        ) : isMedia ? (
          selected
            ? <span className="play-btn material-symbols-sharp">play_arrow</span>
            : <span className="material-symbols-sharp">movie</span>
        ) : (
          <span className="material-symbols-sharp">description</span>
        )}
        {selected && isMedia && thumbSrc && !thumbError && <span className="play-btn material-symbols-sharp">play_arrow</span>}
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
