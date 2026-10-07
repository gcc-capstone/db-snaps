import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { DatabaseActions } from '../App'
import SqlAssistant from '../components/SqlAssistant'
import { customSqlType, formatValue, sampleAnalysis } from '../data/mockData'
import { schema, validateSql, type SqlValidation } from '../data/sqlTools'
import NotFound from './NotFound'

function AddAnalysis({ databases, onUpdate }: DatabaseActions) {
  const { databaseId } = useParams()
  const navigate = useNavigate()
  const database = databases.find((d) => d.id === databaseId)
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  // The query text that was tested, so editing the query invalidates the earlier result.
  const [tested, setTested] = useState<{ query: string; result: SqlValidation } | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  if (!database) return <NotFound />

  const trimmedQuery = query.trim()
  const testIsCurrent = tested !== null && tested.query === trimmedQuery
  const passed = testIsCurrent && tested.result.ok
  const preview = passed ? sampleAnalysis(customSqlType, trimmedQuery).points.slice(-5) : []

  const handleTest = () => setTested({ query: trimmedQuery, result: validateSql(trimmedQuery) })

  // Called by the assistant: put its query in the editor and bring the editor into view.
  const handleUseQuery = (sql: string) => {
    setQuery(sql)
    setTested(null)
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    editorRef.current?.focus({ preventScroll: true })
  }

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!passed) return
    const analysis = {
      ...sampleAnalysis(customSqlType, `${customSqlType.id}-${Date.now()}`),
      // Same seed as the test preview, so the card matches what the tester just saw.
      points: sampleAnalysis(customSqlType, trimmedQuery).points,
      title: title.trim() || 'Custom Query',
      query: trimmedQuery,
    }
    onUpdate({ ...database, analyses: [...database.analyses, analysis] })
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

      <div className="stack">
        <form className="panel form form-compact" onSubmit={handleCreate}>
          <SqlAssistant onUseQuery={handleUseQuery} />

          <h2>Write your query</h2>
          <label className="field field-wide">
            <span className="visually-hidden">SQL query</span>
            <textarea
              ref={editorRef}
              className="sql-editor"
              rows={7}
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={'SELECT snapshot_year AS label,\n       COUNT(*) AS value\nFROM students\nGROUP BY snapshot_year\nORDER BY snapshot_year;'}
            />
            <span className="muted small">
              Return a label column and a numeric value column. Read-only SELECT queries only.
            </span>
          </label>

          <details className="schema">
            <summary>Available tables and columns</summary>
            <ul className="list">
              {schema.map((t) => (
                <li key={t.table}>
                  <code>{t.table}</code> ({t.columns.join(', ')})
                </li>
              ))}
            </ul>
          </details>

          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleTest} disabled={!trimmedQuery}>
              Test Query
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setQuery('')
                setTested(null)
              }}
              disabled={!query}
            >
              Clear
            </button>
          </div>

          {testIsCurrent && tested.result.ok && (
            <>
              <p className="message message-success">Query is valid. Preview of the last {preview.length} results:</p>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>label</th>
                      <th>value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((point) => (
                      <tr key={point.label}>
                        <td>{point.label}</td>
                        <td>{formatValue(point.value, '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {testIsCurrent && !tested.result.ok && <p className="message message-error">{tested.result.error}</p>}
          {tested && !testIsCurrent && (
            <p className="muted small">The query changed. Test it again to enable Create Analysis.</p>
          )}

          <label className="field">
            <span className="field-label">Card title (optional)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Custom Query" />
          </label>

          <div className="row">
            <button type="submit" className="btn btn-primary" disabled={!passed}>
              Create Analysis
            </button>
            <Link to={`/databases/${database.id}`} className="btn btn-secondary">Cancel</Link>
          </div>
          {!passed && <p className="muted small">Test your query successfully to enable Create Analysis.</p>}
        </form>
      </div>
    </main>
  )
}

export default AddAnalysis