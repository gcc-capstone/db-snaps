import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { DatabaseActions } from '../App'
import { analysisTypes, sampleAnalysis } from '../data/mockData'
import NotFound from './NotFound'

function AddAnalysis({ databases, onUpdate }: DatabaseActions) {
  const { databaseId } = useParams()
  const navigate = useNavigate()
  const database = databases.find((d) => d.id === databaseId)
  const [typeId, setTypeId] = useState('')
  const [title, setTitle] = useState('')

  if (!database) return <NotFound />

  const selectedType = analysisTypes.find((type) => type.id === typeId)

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!selectedType) return
    const analysis = sampleAnalysis(selectedType, `${selectedType.id}-${Date.now()}`)
    onUpdate({
      ...database,
      analyses: [...database.analyses, { ...analysis, title: title.trim() || selectedType.name }],
    })
    navigate(`/databases/${database.id}`)
  }

  return (
    <main className="page">
      <Link to={`/databases/${database.id}`}>← Back to Dashboard</Link>
      <div className="page-header page-header-spaced">
        <div>
          <p className="eyebrow">{database.name}</p>
          <h1>Add an Analysis</h1>
        </div>
      </div>

      <form className="stack" onSubmit={handleCreate}>
        <fieldset className="choice-grid">
          <legend className="field-label">Analysis type</legend>
          {analysisTypes.map((type) => (
            <label key={type.id} className={type.id === typeId ? 'choice choice-selected' : 'choice'}>
              <input
                type="radio"
                name="analysis-type"
                value={type.id}
                checked={type.id === typeId}
                onChange={() => setTypeId(type.id)}
              />
              <span className="choice-name">{type.name}</span>
              <span className="muted small">{type.description}</span>
            </label>
          ))}
        </fieldset>

        <div className="panel form">
          <label className="field">
            <span className="field-label">Card title (optional)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={selectedType?.name ?? 'My Analysis'}
            />
          </label>
          <div className="row">
            <button type="submit" className="btn btn-primary" disabled={!selectedType}>
              Create Analysis
            </button>
            <Link to={`/databases/${database.id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </div>
      </form>
    </main>
  )
}

export default AddAnalysis
