import { useEffect } from 'react'
import './home.css'

const links = [
  { label: 'GitHub', href: 'https://github.com/Acumane' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/bren-paul' },
  { label: 'Careers', href: 'https://machindustries.com/careers' },
]

export default function Home() {
  useEffect(() => { document.title = 'bren.page' }, [])

  return (
    <div className="page-home">
      <pre className="greet">{
`############## WIP ##############
#
# I do cool shit occasionally
# software @ Mach (we're hiring)
#
`}{links.map((l, i) => (
          <span key={i}>#  * <a href={l.href} data-act="^">{l.label}</a>{'\n'}</span>
        ))}{
`#`}
      </pre>
    </div>
  )
}
