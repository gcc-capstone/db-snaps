import { useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router'
import './App.css'
import { initialDatabases, type TrackedDatabase } from './data/mockData'
import AddAnalysis from './pages/AddAnalysis'
import AnalysisDetail from './pages/AnalysisDetail'
import DatabaseDashboard from './pages/DatabaseDashboard'
import DatabaseSettings from './pages/DatabaseSettings'
import Home from './pages/Home'
import NewDatabase from './pages/NewDatabase'
import NotFound from './pages/NotFound'
import StyleReference from './pages/StyleReference'

export type DatabaseActions = {
  databases: TrackedDatabase[]
  onCreate: (database: TrackedDatabase) => void
  onUpdate: (database: TrackedDatabase) => void
}

function App() {
  // In-memory state only; changes reset on page reload.
  const [databases, setDatabases] = useState(initialDatabases)

  const actions: DatabaseActions = {
    databases,
    onCreate: (database) => setDatabases((current) => [...current, database]),
    onUpdate: (database) =>
      setDatabases((current) => current.map((d) => (d.id === database.id ? database : d))),
  }

  return (
    <BrowserRouter>
      <header className="nav">
        <Link to="/" className="nav-brand">MOTUS</Link>
        <nav>
          <ul className="nav-links">
            <li><NavLink to="/" end>Databases</NavLink></li>
            <li><NavLink to="/style">Style Guide</NavLink></li>
          </ul>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home databases={databases} />} />
        <Route path="/databases/new" element={<NewDatabase />} />
        <Route path="/databases/new/settings" element={<DatabaseSettings {...actions} />} />
        <Route path="/databases/:databaseId" element={<DatabaseDashboard databases={databases} />} />
        <Route path="/databases/:databaseId/settings" element={<DatabaseSettings {...actions} />} />
        <Route path="/databases/:databaseId/analyses/new" element={<AddAnalysis {...actions} />} />
        <Route path="/databases/:databaseId/analyses/:analysisId" element={<AnalysisDetail databases={databases} />} />
        <Route path="/style" element={<StyleReference />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
