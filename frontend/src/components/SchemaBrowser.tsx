import { useId, useRef, useState } from 'react'
import type { TablePreview, TrackedTables } from '../data/sampleTables'

type SchemaBrowserProps = {
  tables: TablePreview[]
  trackedTables: TrackedTables
  // Columns that will start being tracked once the analysis is created (on-demand databases).
  pendingColumns?: TrackedTables
  // Called with a column name when it is clicked, to add it to the query.
  onInsert: (text: string) => void
  note?: string
}

type ColumnState = 'tracked' | 'pending' | 'untracked'

const stateLabels: Record<ColumnState, string> = {
  tracked: 'Tracked',
  pending: 'Will be tracked',
  untracked: 'Not tracked',
}

const stateClasses: Record<ColumnState, string> = {
  tracked: 'column-selected',
  pending: 'column-pending',
  untracked: 'column-unselected',
}

type TableViewProps = {
  table: TablePreview
  columnState: (column: string) => ColumnState
}

// Read-only first rows of one table, with every column shaded by whether it is tracked.
function TableView({ table, columnState }: TableViewProps) {
  return (
    <div className="table-wrap">
      <table className="table column-picker">
        <thead>
          <tr>
            {table.columns.map((column) => {
              const state = columnState(column.name)
              return (
                <th key={column.name} className={stateClasses[state]}>
                  {column.name}
                  <span className="column-type">
                    {column.type}
                    {state !== 'tracked' && ` · ${stateLabels[state].toLowerCase()}`}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {table.rows.slice(0, 10).map((row) => (
            <tr key={String(row[table.primaryKey])}>
              {table.columns.map((column) => (
                <td key={column.name} className={stateClasses[columnState(column.name)]}>
                  {row[column.name] ?? <span className="muted">NULL</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Legend({ states }: { states: ColumnState[] }) {
  return (
    <ul className="column-legend small">
      {states.map((state) => (
        <li key={state}>
          <span className={`column-legend-swatch ${stateClasses[state]}`} aria-hidden="true" />
          {stateLabels[state]}
        </li>
      ))}
    </ul>
  )
}

// Tables and columns listed beside the SQL editor. Clicking a column adds its name to the query;
// "Preview rows" opens the first rows of a table in a dialog.
function SchemaBrowser({
  tables,
  trackedTables,
  pendingColumns = {},
  onInsert,
  note = 'Change tracked tables and columns in Database Settings.',
}: SchemaBrowserProps) {
  const [expanded, setExpanded] = useState<string[]>([])
  const [previewName, setPreviewName] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const preview = tables.find((t) => t.name === previewName)
  const hasPending = Object.keys(pendingColumns).length > 0
  const legend: ColumnState[] = hasPending ? ['tracked', 'pending', 'untracked'] : ['tracked', 'untracked']

  const columnState = (table: string, column: string): ColumnState => {
    if (trackedTables[table]?.includes(column)) return 'tracked'
    if (pendingColumns[table]?.includes(column)) return 'pending'
    return 'untracked'
  }

  const toggle = (name: string) =>
    setExpanded((current) => (current.includes(name) ? current.filter((n) => n !== name) : [...current, name]))

  const openPreview = (name: string) => {
    setPreviewName(name)
    dialogRef.current?.showModal()
  }

  return (
    <aside className="schema-browser" aria-label="Tables and columns">
      <div className="schema-browser-header">
        <h3>Tables ({tables.length})</h3>
        <p className="muted small">Click a column to add it to your query.</p>
        <Legend states={legend} />
      </div>

      <ul className="schema-tables">
        {tables.map((table) => {
          const isOpen = expanded.includes(table.name)
          const tracked = trackedTables[table.name]?.length ?? 0
          const pending = pendingColumns[table.name]?.length ?? 0
          return (
            <li key={table.name}>
              <button type="button" className="schema-table" aria-expanded={isOpen} onClick={() => toggle(table.name)}>
                <span className="schema-caret" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                <code>{table.name}</code>
                <span className="schema-count">
                  {tracked > 0 ? `${tracked} of ${table.columns.length} tracked` : 'Not tracked'}
                  {pending > 0 && ` · ${pending} new`}
                </span>
              </button>
              {isOpen && (
                <div className="schema-columns">
                  <ul>
                    {table.columns.map((column) => {
                      const state = columnState(table.name, column.name)
                      return (
                        <li key={column.name}>
                          <button
                            type="button"
                            className="schema-column"
                            title={`Add ${column.name} to the query`}
                            onClick={() => onInsert(column.name)}
                          >
                            <span className={`column-legend-swatch ${stateClasses[state]}`} aria-hidden="true" />
                            <code>{column.name}</code>
                            <span className="schema-type">{column.type}</span>
                            <span className="visually-hidden">, {stateLabels[state].toLowerCase()}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  <button type="button" className="schema-preview-link" onClick={() => openPreview(table.name)}>
                    Preview rows →
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <p className="muted small">{note}</p>

      <dialog ref={dialogRef} className="preview-dialog" aria-labelledby={titleId} onClose={() => setPreviewName(null)}>
        {preview && (
          <>
            <div className="preview-dialog-header">
              <div>
                <h2 id={titleId}>
                  <code>{preview.name}</code>
                </h2>
                <p className="muted small">
                  Showing 10 of {preview.totalRows.toLocaleString()} rows · {trackedTables[preview.name]?.length ?? 0} of{' '}
                  {preview.columns.length} columns tracked
                </p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => dialogRef.current?.close()}>
                Close
              </button>
            </div>
            <Legend states={legend} />
            <TableView table={preview} columnState={(column) => columnState(preview.name, column)} />
          </>
        )}
      </dialog>
    </aside>
  )
}

export default SchemaBrowser
