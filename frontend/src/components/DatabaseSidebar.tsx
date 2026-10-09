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
      <path d="M2 4h12M2 8h12M2 12h12" />
      <circle cx="5" cy="4" r="1.5" fill="currentColor" />
      <circle cx="10.5" cy="8" r="1.5" fill="currentColor" />
      <circle cx="6.5" cy="12" r="1.5" fill="currentColor" />
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

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Monitor',
      items: [
        {
          to: base,
          label: 'Dashboard',
          icon: icons.dashboard,
          // Looking at one analysis still counts as being on the dashboard.
          active: path === base || (path.startsWith(`${base}/analyses/`) && path !== `${base}/analyses/new`),
        },
        { to: `${base}/snapshots`, label: 'Snapshots', icon: icons.snapshots, active: path.startsWith(`${base}/snapshots`) },
      ],
    },
    {
      label: 'Analyze',
      items: [{ to: `${base}/analyses/new`, label: 'Add Analysis', icon: icons.add, active: path === `${base}/analyses/new` }],
    },
    {
      label: 'Configure',
      items: [{ to: `${base}/settings`, label: 'Settings', icon: icons.settings, active: path === `${base}/settings` }],
    },
  ]

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
      <Link to="/" className="sidebar-back">← All databases</Link>

      <div className="sidebar-db">
        <span className="sidebar-db-name">{database.name}</span>
        <span className="sidebar-db-engine">{database.engine}</span>
        <code className="sidebar-db-host">{database.host}</code>
      </div>

      <nav className="sidebar-nav" aria-label={`${database.name} sections`}>
        {groups.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <span className="sidebar-label">{group.label}</span>
            <ul className="sidebar-links">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={item.active ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
                    aria-current={item.active ? 'page' : undefined}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
    </aside>
  )
}

export default DatabaseSidebar
