import { useState } from 'react'
import type { TablePreview } from '../data/sampleTables'
import ColumnPicker from './ColumnPicker'
import Tabs from './Tabs'

export type TableSelection = {
  tracked: boolean
  columns: string[]
}

type TablePickerProps = {
  tables: TablePreview[]
  selections: Record<string, TableSelection>
  onChange: (table: string, selection: TableSelection) => void
}

// One tab per table. Each tab has a "track this table" switch and the column picker for that table.
// Tracking a table starts with only its primary key selected; untracking clears its columns.
function TablePicker({ tables, selections, onChange }: TablePickerProps) {
  const [activeName, setActiveName] = useState(tables[0].name)
  const active = tables.find((t) => t.name === activeName) ?? tables[0]
  const selection = selections[active.name]

  const tabs = tables.map((table) => {
    const { tracked, columns } = selections[table.name]
    return {
      id: table.name,
      label: (
        <>
          <code>{table.name}</code>
          <span className="tab-status">{tracked ? `${columns.length} columns tracked` : 'Not tracked'}</span>
        </>
      ),
    }
  })

  return (
    <Tabs label="Tables" tabs={tabs} activeId={active.name} onSelect={setActiveName}>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={selection.tracked}
          onChange={(e) =>
            onChange(active.name, { tracked: e.target.checked, columns: e.target.checked ? [active.primaryKey] : [] })
          }
        />
        <span>
          Track the <code>{active.name}</code> table in snapshots
        </span>
      </label>

      <fieldset className="column-picker-fieldset" disabled={!selection.tracked}>
        <legend className="visually-hidden">Columns to track in {active.name}</legend>
        <ColumnPicker
          table={active}
          selected={selection.columns}
          onChange={(columns) => onChange(active.name, { ...selection, columns })}
        />
      </fieldset>
    </Tabs>
  )
}

export default TablePicker
