import { BrowserRouter, NavLink, Route, Routes } from 'react-router'
import './App.css'
import Home from './pages/Home'
import StyleReference from './pages/StyleReference'

function App() {
  return (
    <BrowserRouter>
      <header className="nav">
        <span className="nav-brand">MOTUS</span>
        <nav>
          <ul className="nav-links">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/style">Style Guide</NavLink></li>
          </ul>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/style" element={<StyleReference />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
