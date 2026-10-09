import { Fragment, useState } from 'react'
import { useParams } from 'react-router'
import { formatDate, frequencyLabels, type TrackedDatabase } from '../data/mockData'
import { formatDateTime, getSnapshots } from '../data/snapshotData'
import NotFound from './NotFound'

type Filter = 'all' | 'scheduled' | 'manual' | 'failed'

const filterLabels: Record<Filter, string> = {
  all: 'All snapshots',
  scheduled: 'Scheduled',
  manual: 'Manual',
  failed: 'Failed',
}

const pageSize = 10

function Snapshots({ databases }: { databases: TrackedDatabase[] }) {
  const { databaseId } = useParams()
  const database = databases.find((d) => d.id === databaseId)
  const [filter, setFilter] = useState<Filter>('all')
  const [limit, setLimit] = useState(pageSize)
  const [openId, setOpenId] = useState<string | null>(null)

  if (!database) return <NotFound />

  const all = getSnapshots(database)
  const matching = all.filter((s) =>
    filter === 'all' ? true : filter === 'failed' ? s.status === 'failed' : s.trigger === filter,
  )
  const visible = matching.slice(0, limit)
  const latest = all.find((s) => s.status === 'complete')
  const failedCount = all.filter((s) => s.status === 'failed').length

  const stats = [
    { label: 'Snapshots', value: all.length.toLocaleString() },
    { label: 'Failed', value: failedCount.toLocaleString() },
    { label: 'Latest', value: latest ? formatDate(latest.takenAt) : '—' },
    { label: 'Latest size', value: latest ? `${latest.sizeMb} MB` : '—' },
  ]

  // Row counts of the previous successful snapshot, to show what changed.
  const previousRows = (index: number) => {
    const previous = all.slice(index + 1).find((s) => s.status === 'complete')
    return new Map(previous?.tables.map((t) => [t.table, t.rows]))
  }

  return (
    <main className="page">
      <div className="page-header page-header-spaced">
        <div>
          <p className="eyebrow">{database.name}</p>
          <h1>Snapshots</h1>
        </div>
      </div>
      <p className="muted summary-line">
        {frequencyLabels[database.frequency]} schedule · times shown in UTC · use Take Snapshot Now in the sidebar to add one by hand
      </p>

      <div className="stack">
        <div className="stats">
          {stats.map((item) => (
            <div className="stat" key={item.label}>
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{item.value}</span>
            </div>
          ))}
        </div>

        {all.length === 0 ? (
          <div className="panel empty-state">
            <h3>No snapshots yet</h3>
            <p className="muted">Use Take Snapshot Now in the sidebar to capture the first one.</p>
          </div>
        ) : (
          <section className="panel">
            <div className="table-toolbar">
              <label className="field field-inline">
                <span className="field-label">Show</span>
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as Filter)
                    setLimit(pageSize)
                    setOpenId(null)
                  }}
                >
                  {Object.entries(filterLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <span className="muted small">
                Showing {visible.length} of {matching.length}
              </span>
            </div>

            <div className="table-wrap">
              <table className="table snapshot-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Taken (UTC)</th>
                    <th>Trigger</th>
                    <th>Status</th>
                    <th className="num">Rows</th>
                    <th className="num">Size</th>
                    <th className="num">Duration</th>
                    <th><span className="visually-hidden">Details</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((snapshot) => {
                    const open = openId === snapshot.id
                    const before = open ? previousRows(all.indexOf(snapshot)) : null
                    return (
                      <Fragment key={snapshot.id}>
                        <tr>
                          <td className="mono">{snapshot.id}</td>
                          <td className="mono">{formatDateTime(snapshot.takenAt)}</td>
                          <td><span className="badge badge-flat">{snapshot.trigger === 'manual' ? 'Manual' : 'Scheduled'}</span></td>
                          <td>
                            <span className={snapshot.status === 'complete' ? 'status status-complete' : 'status status-failed'}>
                              {snapshot.status === 'complete' ? 'Complete' : 'Failed'}
                            </span>
                          </td>
                          <td className="num mono">{snapshot.status === 'complete' ? snapshot.rows.toLocaleString() : '—'}</td>
                          <td className="num mono">{snapshot.status === 'complete' ? `${snapshot.sizeMb} MB` : '—'}</td>
                          <td className="num mono">{snapshot.durationSec} s</td>
                          <td className="num">
                            <button
                              type="button"
                              className="link-button"
                              aria-expanded={open}
                              onClick={() => setOpenId(open ? null : snapshot.id)}
                            >
                              {open ? 'Hide' : 'Details'}
                            </button>
                          </td>
                        </tr>
                        {open && (
                          <tr className="detail-row">
                            <td colSpan={8}>
                              {snapshot.status === 'failed' ? (
                                <p className="message message-error">Snapshot failed. {snapshot.error}</p>
                              ) : (
                                <table className="table table-compact">
                                  <thead>
                                    <tr>
                                      <th>Table</th>
                                      <th className="num">Rows</th>
                                      <th className="num">Change since previous</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {snapshot.tables.map((t) => {
                                      const prior = before?.get(t.table)
                                      const delta = prior === undefined ? null : t.rows - prior
                                      return (
                                        <tr key={t.table}>
                                          <td className="mono">{t.table}</td>
                                          <td className="num mono">{t.rows.toLocaleString()}</td>
                                          <td className="num mono">
                                            {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toLocaleString()}`}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {matching.length === 0 && <p className="muted">No snapshots match this filter.</p>}
            {visible.length < matching.length && (
              <div className="row">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLimit(limit + pageSize)}>
                  Show more
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default Snapshots
