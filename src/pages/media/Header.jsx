export default function Search({ query, onQueryChange }) {
  if (!onQueryChange) return null

  return (
    <div className="search-island">
      <input
        type="text"
        className={`search-input${query ? ' has-text' : ''}`}
        autoComplete="off"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="search"
      />
      <span className="material-symbols-sharp">search</span>
    </div>
  )
}
