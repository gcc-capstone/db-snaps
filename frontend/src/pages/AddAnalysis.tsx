import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { DatabaseActions } from '../App'
import SchemaBrowser from '../components/SchemaBrowser'
import SqlAssistant from '../components/SqlAssistant'
import { customSqlType, sampleAnalysis } from '../data/mockData'
import { findReferencedColumns, validateSql, type SqlValidation } from '../data/sqlTools'
import { mergeTracked, sampleTables, type TrackedTables } from '../data/sampleTables'
import NotFound from './NotFound'

// Columns in `wanted` that `tracked` doesn't have yet, by table.
function untracked(wanted: TrackedTables, tracked: TrackedTables): TrackedTables {
  return Object.fromEntries(
    Object.entries(wanted)
      .map(([table, columns]): [string, string[]] => [table, columns.filter((c) => !tracked[table]?.includes(c))])
      .filter(([, columns]) => columns.length > 0),
  )
}

function AddAnalysis({ databases, onUpdate }: DatabaseActions) {
  const { databaseId } = useParams()
  const navigate = useNavigate()
  const database = databases.find((d) => d.id === databaseId)
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  // The query text that was tested, so editing the query invalidates the earlier result.
  const [tested, setTested] = useState<{ query: string; result: SqlValidation } | null>(null)
  // The editor stays folded away until the assistant suggests a query or the user asks for it.
  const [showEditor, setShowEditor] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  if (!database) return <NotFound />

  const trimmedQuery = query.trim()
  const testIsCurrent = tested !== null && tested.query === trimmedQuery
  const passed = testIsCurrent && tested.result.ok
  const onDemand = database.trackingMode === 'on-demand'
  // On-demand databases start tracking whatever the query uses that isn't tracked yet.
  const newColumns: TrackedTables =
    onDemand && passed ? untracked(findReferencedColumns(trimmedQuery), database.trackedTables) : {}

  const handleTest = () => setTested({ query: trimmedQuery, result: validateSql(trimmedQuery) })

  // Opens the editor if needed, then scrolls to it and focuses it once it is on screen.
  const openEditor = () => {
    setShowEditor(true)
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      editorRef.current?.focus({ preventScroll: true })
    })
  }

  // Called by the assistant: put its query in the editor and focus it.
  const handleUseQuery = (sql: string) => {
    setQuery(sql)
    setTested(null)
    openEditor()
  }

  // Called by the schema browser: put a column name at the cursor, with a space if it would run into a word.
  const handleInsert = (text: string) => {
    const editor = editorRef.current
    const start = editor?.selectionStart ?? query.length
    const end = editor?.selectionEnd ?? query.length
    const before = query.slice(0, start)
    const spacer = before && !/[\s(.]$/.test(before) ? ' ' : ''
    setQuery(before + spacer + text + query.slice(end))
    const caret = start + spacer.length + text.length
    requestAnimationFrame(() => {
      editor?.focus()
      editor?.setSelectionRange(caret, caret)
    })
  }

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!passed) return
    const analysis = {
      ...sampleAnalysis(customSqlType, `${customSqlType.id}-${Date.now()}`),
      // Seeded by the query text, so the same query always shows the same sample data.
      // A database with no snapshots yet has nothing to show.
      points: database.snapshotCount > 0 ? sampleAnalysis(customSqlType, trimmedQuery).points : [],
      // Queries that work out a percentage (as the assistant writes them) show their values as percents.
      unit: /100\.0\s*\*/.test(trimmedQuery) ? ('%' as const) : customSqlType.unit,
      title: title.trim() || 'Custom Query',
      query: trimmedQuery,
    }
    const trackedTables = onDemand ? mergeTracked(database.trackedTables, newColumns) : database.trackedTables
    onUpdate({ ...database, trackedTables, analyses: [...database.analyses, analysis] })
    navigate(`/databases/${database.id}/analyses/${analysis.id}`)
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{database.name}</p>
          <h1>Add an Analysis</h1>
        </div>
      </div>

      <div className="stack">
        <form className="panel form form-compact" onSubmit={handleCreate}>
          <SqlAssistant onUseQuery={handleUseQuery} />

          {!showEditor && (
            <p className="editor-toggle">
              <span className="muted">Prefer to write SQL yourself? </span>
              <button type="button" onClick={openEditor}>
                Open the editor ▸
              </button>
            </p>
          )}

          {showEditor && (
            <>
              <h2>Write your query</h2>
              <div className="query-workspace">
                <div className="query-editor">
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

                  {testIsCurrent && tested.result.ok && <p className="message message-success">Test succeeded.</p>}
                  {testIsCurrent && !tested.result.ok && <p className="message message-error">Test failed. {tested.result.error}</p>}
                  {tested && !testIsCurrent && (
                    <p className="muted small">The query changed. Test it again to enable Create Analysis.</p>
                  )}
                </div>

                <SchemaBrowser
                  tables={sampleTables}
                  trackedTables={database.trackedTables}
                  pendingColumns={newColumns}
                  onInsert={handleInsert}
                  note={
                    onDemand
                      ? 'Creating an analysis starts tracking the columns its query uses. Change tracking in Database Settings.'
                      : undefined
                  }
                />
              </div>

              <label className="field">
                <span className="field-label">Card title (optional)</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Custom Query" />
              </label>
            </>
          )}

          <div className="row">
            {showEditor && (
              <button type="submit" className="btn btn-primary" disabled={!passed}>
                Create Analysis
              </button>
            )}
            <Link to={`/databases/${database.id}`} className="btn btn-secondary">Cancel</Link>
          </div>
          {showEditor && !passed && <p className="muted small">Test your query successfully to enable Create Analysis.</p>}
        </form>
      </div>
    </main>
  )
}

export default AddAnalysis