import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { formatDate, frequencyLabels, type TrackedDatabase } from '../data/mockData'
import { createManualSnapshot, getSnapshots } from '../data/snapshotData'

type NavItem = { to: string; label: string; icon: ReactNode; active: boolean }

const icon = (paths: ReactNode) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
)

const icons = {
  dashboard: icon(
    <>
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </>,
  ),
  snapshots: icon(
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </>,
  ),
  add: icon(<path d="M8 3v10M3 8h10" />),
  settings: icon(
    <>
      <path d="M6.55 3.32L6.88 1.5h2.24l.33 1.82.84.35 1.52-1.06 1.58 1.58-1.06 1.52.35.84 1.82.33v2.24l-1.82.33-.35.84 1.06 1.52-1.58 1.58-1.52-1.06-.84.35-.33 1.82H6.88l-.33-1.82-.84-.35-1.52 1.06-1.58-1.58 1.06-1.52-.35-.84-1.82-.33V6.88l1.82-.33.35-.84-1.06-1.52 1.58-1.58 1.52 1.06z" />
      <circle cx="8" cy="8" r="2" />
    </>,
  ),
  record: icon(
    <>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </>,
  ),
}

// Persistent left navigation for everything inside one database.
// The snapshot button is fake: after a short wait it adds a manual snapshot to the history.
function DatabaseSidebar({
  database,
  onUpdate,
}: {
  database: TrackedDatabase
  onUpdate: (database: TrackedDatabase) => void
}) {
  const [taking, setTaking] = useState(false)
  const [lastTaken, setLastTaken] = useState<number | null>(null)
  const path = useLocation().pathname.replace(/\/$/, '')
  const base = `/databases/${database.id}`

  const items: NavItem[] = [
    {
      to: base,
      label: 'Dashboard',
      icon: icons.dashboard,
      active: path === base,
    },
    { to: `${base}/snapshots`, label: 'Snapshots', icon: icons.snapshots, active: path.startsWith(`${base}/snapshots`) },
    { to: `${base}/analyses/new`, label: 'Add Analysis', icon: icons.add, active: path === `${base}/analyses/new` },
  ]
  // Pinned to the bottom of the sidebar, apart from the everyday pages.
  const settings: NavItem = { to: `${base}/settings`, label: 'Settings', icon: icons.settings, active: path === `${base}/settings` }

  const navLink = (item: NavItem) => (
    <Link
      to={item.to}
      className={item.active ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
      aria-current={item.active ? 'page' : undefined}
    >
      {item.icon}
      {item.label}
    </Link>
  )

  const takeSnapshot = () => {
    setTaking(true)
    setLastTaken(null)
    window.setTimeout(() => {
      const snapshot = createManualSnapshot(database)
      onUpdate({
        ...database,
        snapshotCount: database.snapshotCount + 1,
        lastSnapshotAt: snapshot.takenAt,
        snapshots: [snapshot, ...getSnapshots(database)],
      })
      setTaking(false)
      setLastTaken(snapshot.number)
    }, 1500)
  }

  return (
    <aside className="sidebar" aria-label={`${database.name} navigation`}>
      <div className="sidebar-db">
        <span className="sidebar-db-name">{database.name}</span>
        <span className="sidebar-db-engine">{database.engine}</span>
        <code className="sidebar-db-host">{database.host}</code>
      </div>

      <nav aria-label={`${database.name} sections`}>
        <ul className="sidebar-links">
          {items.map((item) => (
            <li key={item.to}>
              {navLink(item)}
              {/* Each analysis is listed under Dashboard, so the one being viewed shows as the current page. */}
              {item.to === base && database.analyses.length > 0 && (
                <ul className="sidebar-sublinks">
                  {database.analyses.map((analysis) => {
                    const to = `${base}/analyses/${analysis.id}`
                    const active = path === to
                    return (
                      <li key={analysis.id}>
                        <Link
                          to={to}
                          className={active ? 'sidebar-sublink sidebar-link-active' : 'sidebar-sublink'}
                          aria-current={active ? 'page' : undefined}
                          title={analysis.title}
                        >
                          {analysis.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <dl className="sidebar-stats">
          <div>
            <dt>Snapshots</dt>
            <dd>{database.snapshotCount}</dd>
          </div>
          <div>
            <dt>Schedule</dt>
            <dd>{frequencyLabels[database.frequency]}</dd>
          </div>
          <div>
            <dt>Last run</dt>
            <dd>{database.lastSnapshotAt ? formatDate(database.lastSnapshotAt) : '—'}</dd>
          </div>
        </dl>

        <button type="button" className="sidebar-action" onClick={takeSnapshot} disabled={taking}>
          {icons.record}
          {taking ? 'Taking snapshot…' : 'Take Snapshot Now'}
        </button>

        {lastTaken !== null && (
          <p className="sidebar-status" role="status">
            Snapshot #{lastTaken} complete. <Link to={`${base}/snapshots`}>View</Link>
          </p>
        )}
      </div>

      <nav className="sidebar-settings" aria-label={`${database.name} settings`}>
        {navLink(settings)}
      </nav>
    </aside>
  )
}

export default DatabaseSidebar
