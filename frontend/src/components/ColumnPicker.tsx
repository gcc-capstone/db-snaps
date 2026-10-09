import type { TablePreview } from '../data/sampleTables'

type ColumnPickerProps = {
  table: TablePreview
  selected: string[]
  onChange: (selected: string[]) => void
}

// Preview of a table's first rows with a checkbox on each column header.
function ColumnPicker({ table, selected, onChange }: ColumnPickerProps) {
  const isSelected = (column: string) => selected.includes(column)

  const toggle = (column: string) =>
    onChange(isSelected(column) ? selected.filter((c) => c !== column) : [...selected, column])

  return (
    <div className="stack">
      <div className="row column-picker-toolbar">
        <p className="muted small">
          <code>{table.name}</code> · showing 10 of {table.totalRows.toLocaleString()} rows ·{' '}
          {selected.length} of {table.columns.length} columns tracked
        </p>
        <div className="row">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onChange(table.columns.map((c) => c.name))}
          >
            Select All
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange([table.primaryKey])}>
            Clear
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table column-picker">
          <thead>
            <tr>
              {table.columns.map((column) => {
                const isKey = column.name === table.primaryKey
                return (
                  <th key={column.name} className={isSelected(column.name) ? 'column-selected' : undefined}>
                    <label className="checkbox" title={isKey ? 'Primary key, always tracked' : undefined}>
                      <input
                        type="checkbox"
                        checked={isSelected(column.name)}
                        disabled={isKey}
                        onChange={() => toggle(column.name)}
                      />
                      <span>
                        {column.name}
                        <span className="column-type">{isKey ? 'primary key' : column.type}</span>
                      </span>
                    </label>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {table.rows.slice(0, 10).map((row) => (
              <tr key={String(row[table.primaryKey])}>
                {table.columns.map((column) => (
                  <td key={column.name} className={isSelected(column.name) ? 'column-selected' : 'column-unselected'}>
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

export default ColumnPicker
