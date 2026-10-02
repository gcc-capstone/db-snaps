import { Link, useParams } from 'react-router'
import LineChart from '../components/LineChart'
import { analysisTypes, formatValue, type TrackedDatabase } from '../data/mockData'
import NotFound from './NotFound'

function AnalysisDetail({ databases }: { databases: TrackedDatabase[] }) {
  const { databaseId, analysisId } = useParams()
  const database = databases.find((d) => d.id === databaseId)
  const analysis = database?.analyses.find((a) => a.id === analysisId)

  if (!database || !analysis) return <NotFound />

  const type = analysisTypes.find((t) => t.id === analysis.typeId)
  const values = analysis.points.map((p) => p.value)
  const summary = [
    { label: 'Latest', value: values[values.length - 1] },
    { label: 'Highest', value: Math.max(...values) },
    { label: 'Lowest', value: Math.min(...values) },
  ]

  return (
    <main className="page">
      <Link to={`/databases/${database.id}`}>← Back to {database.name}</Link>
      <div className="page-header page-header-spaced">
        <div>
          <p className="eyebrow">{type?.name}</p>
          <h1>{analysis.title}</h1>
        </div>
      </div>
      {type && <p className="muted">{type.description}</p>}

      <div className="stack">
        <div className="stats">
          {summary.map((item) => (
            <div className="stat" key={item.label}>
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{formatValue(item.value, analysis.unit)}</span>
            </div>
          ))}
        </div>

        <section className="panel">
          <h2>Over Time</h2>
          <LineChart analysis={analysis} />
        </section>

        <section className="panel">
          <h2>Data</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Value</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {analysis.points.map((point, i) => {
                  const change = i === 0 ? null : point.value - analysis.points[i - 1].value
                  return (
                    <tr key={point.label}>
                      <td>{point.label}</td>
                      <td>{formatValue(point.value, analysis.unit)}</td>
                      <td>{change === null ? '—' : `${change > 0 ? '+' : ''}${change.toLocaleString()}`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AnalysisDetail
