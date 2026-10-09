import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import type { DatabaseActions } from '../App'
import TablePicker, { type TableSelection } from '../components/TablePicker'
import {
  frequencyLabels,
  retentionLabels,
  type DatabaseDraft,
  type SnapshotFrequency,
  type SnapshotRetention,
} from '../data/mockData'
import { sampleTables } from '../data/sampleTables'
import NotFound from './NotFound'

// Used both to finish creating a new database and to edit an existing one.
function DatabaseSettings({ databases, onCreate, onUpdate }: DatabaseActions) {
  const { databaseId } = useParams()
  const navigate = useNavigate()
  const draft = useLocation().state as DatabaseDraft | null
  const existing = databases.find((d) => d.id === databaseId)
  const isNew = databaseId === undefined
  const [frequency, setFrequency] = useState<SnapshotFrequency>(existing?.frequency ?? 'monthly')
  const [retention, setRetention] = useState<SnapshotRetention>(existing?.retention ?? 'forever')
  const [selections, setSelections] = useState(() => {
    // New databases start with nothing tracked.
    const saved = existing?.trackedTables ?? {}
    return Object.fromEntries(
      sampleTables.map((t): [string, TableSelection] => [
        t.name,
        { tracked: t.name in saved, columns: saved[t.name] ?? [] },
      ]),
    )
  })

  if (isNew && !draft) return <Navigate to="/databases/new" replace />
  if (!isNew && !existing) return <NotFound />

  const name = existing?.name ?? draft?.name

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    const trackedTables = Object.fromEntries(
      Object.entries(selections)
        .filter(([, selection]) => selection.tracked)
        .map(([table, selection]) => [table, selection.columns]),
    )
    if (existing) {
      onUpdate({ ...existing, frequency, retention, trackedTables })
      navigate(`/databases/${existing.id}`)
    } else if (draft) {
      const id = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
      onCreate({ ...draft, id, frequency, retention, trackedTables, snapshotCount: 0, lastSnapshotAt: null, analyses: [] })
      navigate(`/databases/${id}`)
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{isNew ? 'Step 2 of 2' : name}</p>
          <h1>{isNew ? `Set Up Snapshots for ${name}` : 'Database Settings'}</h1>
          <p className="muted">Choose what data each snapshot includes, how often snapshots are taken, and how long they are kept.</p>
        </div>
      </div>

      <form className="stack" onSubmit={handleSave}>
        <section className="panel">
          <h2>Tables and Columns</h2>
          <p className="muted">
            Pick the tables to include in each snapshot, then the columns to keep from each one. A few sample rows
            are shown to help you choose.
          </p>
          <TablePicker
            tables={sampleTables}
            selections={selections}
            onChange={(table, selection) => setSelections((current) => ({ ...current, [table]: selection }))}
          />
        </section>

        <section className="panel form">
          <h2>Snapshot Timing</h2>
          <div className="field-pair">
            <label className="field">
              <span className="field-label">Take a snapshot</span>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as SnapshotFrequency)}>
                {Object.entries(frequencyLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Keep each snapshot for</span>
              <select value={retention} onChange={(e) => setRetention(e.target.value as SnapshotRetention)}>
                {Object.entries(retentionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="muted small">
            Snapshots older than this are deleted automatically. Analyses can only show trends across the snapshots
            that are still kept.
          </p>
        </section>

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
