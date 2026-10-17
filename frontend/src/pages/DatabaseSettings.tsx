import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import type { DatabaseActions } from '../App'
import SnapshotTimingFields from '../components/SnapshotTimingFields'
import TablePicker, { type TableSelection } from '../components/TablePicker'
import TrackingModeOptions from '../components/TrackingModeOptions'
import {
  createDatabase,
  trackedTablesFor,
  type NewDatabaseState,
  type SnapshotFrequency,
  type SnapshotRetention,
  type TrackingMode,
} from '../data/mockData'
import { sampleTables, type TrackedTables } from '../data/sampleTables'
import NotFound from './NotFound'

function toSelections(tracked: TrackedTables): Record<string, TableSelection> {
  return Object.fromEntries(
    sampleTables.map((t): [string, TableSelection] => [t.name, { tracked: t.name in tracked, columns: tracked[t.name] ?? [] }]),
  )
}

function toTrackedTables(selections: Record<string, TableSelection>): TrackedTables {
  return Object.fromEntries(
    Object.entries(selections)
      .filter(([, selection]) => selection.tracked)
      .map(([table, selection]) => [table, selection.columns]),
  )
}

// Used both as Advanced options when creating a database and to edit an existing one.
// New databases get here only through Advanced options, so they always use a custom selection.
function DatabaseSettings({ databases, onCreate, onUpdate }: DatabaseActions) {
  const { databaseId } = useParams()
  const navigate = useNavigate()
  const draft = useLocation().state as NewDatabaseState | null
  const existing = databases.find((d) => d.id === databaseId)
  const isNew = databaseId === undefined
  const [frequency, setFrequency] = useState<SnapshotFrequency>(existing?.frequency ?? draft?.frequency ?? 'monthly')
  const [retention, setRetention] = useState<SnapshotRetention>(existing?.retention ?? draft?.retention ?? 'forever')
  const [mode, setMode] = useState<TrackingMode>(existing?.trackingMode ?? 'custom')
  // New databases start with nothing tracked.
  const [selections, setSelections] = useState(() => toSelections(existing?.trackedTables ?? {}))
  // Set once, so picking an option card doesn't fold the picker away while it is being used.
  const [advancedStartsOpen] = useState(mode === 'custom')

  if (isNew && !draft) return <Navigate to="/databases/new" replace />
  if (!isNew && !existing) return <NotFound />

  const name = existing?.name ?? draft?.name

  // Switching an existing database to on-demand keeps what it already tracks, so its analyses keep working.
  const handleModeChange = (next: Exclude<TrackingMode, 'custom'>) => {
    setMode(next)
    if (next === 'all') setSelections(toSelections(trackedTablesFor('all')))
  }

  const handlePickerChange = (table: string, selection: TableSelection) => {
    setMode('custom')
    setSelections((current) => ({ ...current, [table]: selection }))
  }

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    const settings = { frequency, retention, trackingMode: mode, trackedTables: toTrackedTables(selections) }
    if (existing) {
      onUpdate({ ...existing, ...settings })
      navigate(`/databases/${existing.id}`)
    } else if (draft) {
      const { name, engine, host, username } = draft
      const database = createDatabase({ name, engine, host, username }, settings)
      onCreate(database)
      navigate(`/databases/${database.id}`)
    }
  }

  const picker = (
    <>
      <p className="muted">
        Pick the tables to include in each snapshot, then the columns to keep from each one. A few sample rows are
        shown to help you choose.
      </p>
      <TablePicker tables={sampleTables} selections={selections} onChange={handlePickerChange} />
    </>
  )

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{isNew ? 'Step 2 of 2 · Advanced options' : name}</p>
          <h1>{isNew ? `Set Up Snapshots for ${name}` : 'Database Settings'}</h1>
          <p className="muted">Choose what data each snapshot includes, how often snapshots are taken, and how long they are kept.</p>
        </div>
      </div>

      <form className="stack" onSubmit={handleSave}>
        {isNew ? (
          <section className="panel">
            <h2>Tables and Columns</h2>
            {picker}
          </section>
        ) : (
          <section className="panel form">
            <h2>What to Track</h2>
            <TrackingModeOptions value={mode} onChange={handleModeChange} isNew={false} />
            {mode === 'custom' && (
              <p className="muted small">Using a custom selection of tables and columns. Change it under Advanced options.</p>
            )}
            <details className="schema" open={advancedStartsOpen}>
              <summary>Advanced options: choose tables and columns</summary>
              <div className="tracked-tables">{picker}</div>
            </details>
          </section>
        )}

        <SnapshotTimingFields
          frequency={frequency}
          retention={retention}
          onFrequencyChange={setFrequency}
          onRetentionChange={setRetention}
        />

        <div className="row save-bar">
          <button type="submit" className="btn btn-primary">
            {isNew ? 'Create Database' : 'Save Settings'}
          </button>
          <Link to={existing ? `/databases/${existing.id}` : '/'} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  )
}

export default DatabaseSettings
