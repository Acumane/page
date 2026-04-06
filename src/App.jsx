import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav'
import Home from './pages/Home'
import Media from './pages/media/Media'

export default function App() {
  const location = useLocation()
  const routeKey = location.pathname.startsWith('/media') ? 'media' : 'home'

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0.5, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.5 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ minHeight: '100vh' }}
        >
          <Routes location={location}>
            <Route path="/media/*" element={<Media />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Nav />
    </>
  )
}
