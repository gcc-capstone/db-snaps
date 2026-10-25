import { useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router'
import './App.css'
import { jumpToFuture } from './data/demoData'
import { initialDatabases, type TrackedDatabase } from './data/mockData'
import AddAnalysis from './pages/AddAnalysis'
import AnalysisDetail from './pages/AnalysisDetail'
import DatabaseLayout from './components/DatabaseLayout'
import DatabaseDashboard from './pages/DatabaseDashboard'
import DatabaseSettings from './pages/DatabaseSettings'
import Home from './pages/Home'
import NewDatabase from './pages/NewDatabase'
import NewDatabaseTracking from './pages/NewDatabaseTracking'
import NotFound from './pages/NotFound'
import Snapshots from './pages/Snapshots'
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

  // Presentation only: the MOTUS logo jumps databases added this session years into the future, once each.
  const jumped = useRef(new Set(initialDatabases.map((d) => d.id)))
  const handleJump = () => {
    const ids = databases.map((d) => d.id).filter((id) => !jumped.current.has(id))
    ids.forEach((id) => jumped.current.add(id))
    if (ids.length > 0) setDatabases((current) => current.map((d) => (ids.includes(d.id) ? jumpToFuture(d) : d)))
  }

  return (
    <BrowserRouter>
      <header className="nav">
        <Link to="/" className="nav-brand" onClick={handleJump}>MOTUS</Link>
        <nav>
          <ul className="nav-links">
            <li><NavLink to="/" end>Home</NavLink></li>
          </ul>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home databases={databases} />} />
        <Route path="/databases/new" element={<NewDatabase />} />
        <Route path="/databases/new/tracking" element={<NewDatabaseTracking {...actions} />} />
        <Route path="/databases/new/custom" element={<DatabaseSettings {...actions} />} />
        <Route path="/databases/:databaseId" element={<DatabaseLayout databases={databases} onUpdate={actions.onUpdate} />}>
          <Route index element={<DatabaseDashboard databases={databases} />} />
          <Route path="settings" element={<DatabaseSettings {...actions} />} />
          <Route path="analyses/new" element={<AddAnalysis {...actions} />} />
          <Route path="analyses/:analysisId" element={<AnalysisDetail databases={databases} />} />
          <Route path="snapshots" element={<Snapshots databases={databases} />} />
        </Route>
        <Route path="/style" element={<StyleReference />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App