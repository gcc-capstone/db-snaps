import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import type { DatabaseActions } from '../App'
import { frequencyLabels, type DatabaseDraft, type SnapshotFrequency } from '../data/mockData'
import NotFound from './NotFound'

// Used both to finish creating a new database and to edit an existing one.
function DatabaseSettings({ databases, onCreate, onUpdate }: DatabaseActions) {
  const { databaseId } = useParams()
  const navigate = useNavigate()
  const draft = useLocation().state as DatabaseDraft | null
  const existing = databases.find((d) => d.id === databaseId)
  const isNew = databaseId === undefined
  const [frequency, setFrequency] = useState<SnapshotFrequency>(existing?.frequency ?? 'monthly')

  if (isNew && !draft) return <Navigate to="/databases/new" replace />
  if (!isNew && !existing) return <NotFound />

  const name = existing?.name ?? draft?.name

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    if (existing) {
      onUpdate({ ...existing, frequency })
      navigate(`/databases/${existing.id}`)
    } else if (draft) {
      const id = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
      onCreate({ ...draft, id, frequency, snapshotCount: 0, lastSnapshotAt: null, analyses: [] })
      navigate(`/databases/${id}`)
    }
  }

  return (
    <main className="page">
      {existing ? (
        <Link to={`/databases/${existing.id}`}>← Back to Dashboard</Link>
      ) : (
        <Link to="/databases/new">← Back</Link>
      )}
      <div className="page-header page-header-spaced">
        <div>
          <p className="eyebrow">{isNew ? 'Step 2 of 2' : name}</p>
          <h1>{isNew ? `Settings for ${name}` : 'Database Settings'}</h1>
        </div>
      </div>

      <form className="stack" onSubmit={handleSave}>
        <section className="panel form">
          <h2>Snapshot Schedule</h2>
          <label className="field">
            <span className="field-label">Snapshot frequency</span>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as SnapshotFrequency)}>
              {Object.entries(frequencyLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="panel">
          <h2>Tracked Tables and Columns</h2>
          <div className="placeholder">
            <p className="muted">Table and column selection will appear here.</p>
          </div>
        </section>

        <div className="row">
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
