import { useState } from 'react'
import type { TablePreview, TrackedTables } from '../data/sampleTables'
import Tabs from './Tabs'

type TrackedDataPreviewProps = {
  tables: TablePreview[]
  trackedTables: TrackedTables
}

type TrackedTableProps = {
  table: TablePreview
  trackedColumns: string[]
  showUntracked: boolean
}

// Read-only first rows of one table: its tracked columns, plus greyed-out untracked columns if asked for.
function TrackedTable({ table, trackedColumns, showUntracked }: TrackedTableProps) {
  const isTracked = (column: string) => trackedColumns.includes(column)
  // Keep the table's column order rather than the order the columns were selected in.
  const columns = showUntracked ? table.columns : table.columns.filter((c) => isTracked(c.name))
  return (
    <div>
      <p className="muted small">
        <code>{table.name}</code> · showing 10 of {table.totalRows.toLocaleString()} rows · {trackedColumns.length}{' '}
        tracked columns
      </p>
      <div className="table-wrap">
        <table className="table column-picker">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.name} className={isTracked(column.name) ? undefined : 'column-untracked'}>
                  {column.name}
                  <span className="column-type">
                    {column.type}
                    {!isTracked(column.name) && ' · not tracked'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.slice(0, 10).map((row) => (
              <tr key={String(row[table.primaryKey])}>
                {columns.map((column) => (
                  <td key={column.name} className={isTracked(column.name) ? undefined : 'column-untracked'}>
                    {row[column.name] ?? <span className="muted">NULL</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Collapsible view of each tracked table. Tabs appear only when more than one table is tracked.
function TrackedDataPreview({ tables, trackedTables }: TrackedDataPreviewProps) {
  const tracked = tables.filter((t) => t.name in trackedTables)
  const [activeName, setActiveName] = useState(tracked[0]?.name)
  const active = tracked.find((t) => t.name === activeName) ?? tracked[0]
  const [showUntracked, setShowUntracked] = useState(false)

  return (
    <details className="schema">
      <summary>View tracked tables</summary>
      <div className="tracked-tables">
        {tracked.length === 0 && <p className="muted small">No tables are tracked. Choose tables in Database Settings.</p>}
        {tracked.length > 0 && (
          <label className="checkbox small">
            <input type="checkbox" checked={showUntracked} onChange={(e) => setShowUntracked(e.target.checked)} />
            <span>Show untracked columns</span>
          </label>
        )}
        {tracked.length === 1 && (
          <TrackedTable table={active} trackedColumns={trackedTables[active.name]} showUntracked={showUntracked} />
        )}
        {tracked.length > 1 && (
          <Tabs
            label="Tracked tables"
            tabs={tracked.map((t) => ({
              id: t.name,
              label: (
                <>
                  <code>{t.name}</code>
                  <span className="tab-status">{trackedTables[t.name].length} columns</span>
                </>
              ),
            }))}
            activeId={active.name}
            onSelect={setActiveName}
          >
            <TrackedTable table={active} trackedColumns={trackedTables[active.name]} showUntracked={showUntracked} />
          </Tabs>
        )}
        {tracked.length > 0 && <p className="muted small">Change tracked tables and columns in Database Settings.</p>}
      </div>
    </details>
  )
}

export default TrackedDataPreview
