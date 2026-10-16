import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import type { DatabaseActions } from '../App'
import SnapshotTimingFields from '../components/SnapshotTimingFields'
import TrackingModeOptions from '../components/TrackingModeOptions'
import {
  createDatabase,
  trackedTablesFor,
  type DatabaseDraft,
  type NewDatabaseState,
  type SnapshotFrequency,
  type SnapshotRetention,
  type TrackingMode,
} from '../data/mockData'

// Step 2 of adding a database: pick one of the two simple tracking options, or go to Advanced options.
function NewDatabaseTracking({ onCreate }: DatabaseActions) {
  const navigate = useNavigate()
  const draft = useLocation().state as DatabaseDraft | null
  const [mode, setMode] = useState<Exclude<TrackingMode, 'custom'>>('all')
  const [frequency, setFrequency] = useState<SnapshotFrequency>('monthly')
  const [retention, setRetention] = useState<SnapshotRetention>('forever')

  if (!draft) return <Navigate to="/databases/new" replace />

  const advancedState: NewDatabaseState = { ...draft, frequency, retention }

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    const database = createDatabase(draft, { frequency, retention, trackingMode: mode, trackedTables: trackedTablesFor(mode) })
    onCreate(database)
    navigate(`/databases/${database.id}`)
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Step 2 of 2</p>
          <h1>Set Up Snapshots for {draft.name}</h1>
          <p className="muted">Choose what data each snapshot includes, how often snapshots are taken, and how long they are kept.</p>
        </div>
      </div>

      <form className="stack" onSubmit={handleCreate}>
        <section className="panel form">
          <h2>What to Track</h2>
          <TrackingModeOptions value={mode} onChange={setMode} isNew />
          <p className="small">
            <Link to="/databases/new/advanced" state={advancedState}>Advanced options</Link>
            <span className="muted"> · choose specific tables and columns</span>
          </p>
        </section>

        <SnapshotTimingFields
          frequency={frequency}
          retention={retention}
          onFrequencyChange={setFrequency}
          onRetentionChange={setRetention}
        />

        <div className="row save-bar">
          <button type="submit" className="btn btn-primary">Create Database</button>
          <Link to="/" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </main>
  )
}

export default NewDatabaseTracking
