import { useState } from 'react'
import type { TablePreview, TrackedTables } from '../data/sampleTables'
import Tabs from './Tabs'

type TablesPreviewProps = {
  tables: TablePreview[]
  trackedTables: TrackedTables
  // Columns that will start being tracked once the analysis is created (on-demand databases).
  pendingColumns?: TrackedTables
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
  trackedCount: number
}

// Read-only first rows of one table, with every column shaded by whether it is tracked.
function TableView({ table, columnState, trackedCount }: TableViewProps) {
  return (
    <div>
      <p className="muted small">
        <code>{table.name}</code> · showing 10 of {table.totalRows.toLocaleString()} rows · {trackedCount} of{' '}
        {table.columns.length} columns tracked
      </p>
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
    </div>
  )
}

// Collapsible view of every table in the database, one tab per table.
function TablesPreview({
  tables,
  trackedTables,
  pendingColumns = {},
  note = 'Change tracked tables and columns in Database Settings.',
}: TablesPreviewProps) {
  const [activeName, setActiveName] = useState(tables[0].name)
  const active = tables.find((t) => t.name === activeName) ?? tables[0]
  const hasPending = Object.keys(pendingColumns).length > 0
  const legend: ColumnState[] = hasPending ? ['tracked', 'pending', 'untracked'] : ['tracked', 'untracked']

  const tabs = tables.map((table) => {
    const tracked = trackedTables[table.name]?.length ?? 0
    const pending = pendingColumns[table.name]?.length ?? 0
    return {
      id: table.name,
      label: (
        <>
          <code>{table.name}</code>
          <span className="tab-status">
            {tracked > 0 ? `${tracked} of ${table.columns.length} tracked` : 'Not tracked'}
            {pending > 0 && ` · ${pending} new`}
          </span>
        </>
      ),
    }
  })

  const columnState = (column: string): ColumnState => {
    if (trackedTables[active.name]?.includes(column)) return 'tracked'
    if (pendingColumns[active.name]?.includes(column)) return 'pending'
    return 'untracked'
  }

  return (
    <details className="schema">
      <summary>View tables</summary>
      <div className="tracked-tables">
        <ul className="column-legend small">
          {legend.map((state) => (
            <li key={state}>
              <span className={`column-legend-swatch ${stateClasses[state]}`} aria-hidden="true" />
              {stateLabels[state]}
            </li>
          ))}
        </ul>
        <Tabs label="Tables" tabs={tabs} activeId={active.name} onSelect={setActiveName}>
          <TableView
            table={active}
            columnState={columnState}
            trackedCount={trackedTables[active.name]?.length ?? 0}
          />
        </Tabs>
        <p className="muted small">{note}</p>
      </div>
    </details>
  )
}

export default TablesPreview
