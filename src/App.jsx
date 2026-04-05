import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Media from './pages/media/Media'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/media/*" element={<Media />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Nav />
    </>
  )
}
