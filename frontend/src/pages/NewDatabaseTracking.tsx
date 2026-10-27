import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import type { DatabaseActions } from '../App'
import DiscardSetupButton from '../components/DiscardSetupButton'
import SnapshotTimingFields from '../components/SnapshotTimingFields'
import TrackingModeOptions from '../components/TrackingModeOptions'
import {
  createDatabase,
  trackedTablesFor,
  type NewDatabaseState,
  type SnapshotFrequency,
  type SnapshotRetention,
  type TrackingMode,
} from '../data/mockData'

// Step 2 of adding a database: pick one of the two simple tracking options, or go to a custom selection.
function NewDatabaseTracking({ onCreate }: DatabaseActions) {
  const navigate = useNavigate()
  // Coming back from the custom selection page also carries the timing chosen there.
  const draft = useLocation().state as NewDatabaseState | null
  const [mode, setMode] = useState<Exclude<TrackingMode, 'custom'>>('all')
  const [frequency, setFrequency] = useState<SnapshotFrequency>(draft?.frequency ?? 'monthly')
  const [retention, setRetention] = useState<SnapshotRetention>(draft?.retention ?? 'forever')

  if (!draft) return <Navigate to="/databases/new" replace />

  const customState: NewDatabaseState = { ...draft, frequency, retention }

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
            <Link to="/databases/new/custom" state={customState}>Choose specific tables and columns</Link>
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
          <DiscardSetupButton databaseName={draft.name} />
        </div>
      </form>
    </main>
  )
}

export default NewDatabaseTracking
