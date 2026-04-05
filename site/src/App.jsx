import Reticle from './Reticle'

const links = [
  { label: 'GitHub', href: 'https://github.com/Acumane' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/bren-paul' },
  { label: 'Careers', href: 'https://machindustries.com/careers' },
]

export default function App() {
  return (
    <>
      <Reticle />
      <pre className="greet">{
`############## WIP ##############
#
# I do cool shit occasionally
# software @ Mach (we're hiring)
#
`}{links.map((l, i) => (
          <span key={i}>#  * <a href={l.href} data-act="↗">{l.label}</a>{'\n'}</span>
        ))}{
`#`}
    </pre>
    </>
  )
}