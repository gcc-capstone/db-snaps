import { Link, useParams } from 'react-router'
import Sparkline from '../components/Sparkline'
import {
  analysisTypes,
  formatDate,
  formatValue,
  frequencyLabels,
  type Analysis,
  type TrackedDatabase,
} from '../data/mockData'
import NotFound from './NotFound'

function DatabaseDashboard({ databases }: { databases: TrackedDatabase[] }) {
  const { databaseId } = useParams()
  const database = databases.find((d) => d.id === databaseId)

  if (!database) return <NotFound />

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{database.engine} · {database.host}</p>
          <h1>{database.name}</h1>
        </div>
        <div className="row">
          <Link to="settings" className="btn btn-secondary">Settings</Link>
          <Link to="analyses/new" className="btn btn-primary">Add Analysis</Link>
        </div>
      </div>

      <p className="muted summary-line">
        {database.snapshotCount} snapshots · {frequencyLabels[database.frequency]} schedule · Last snapshot{' '}
        {database.lastSnapshotAt ? formatDate(database.lastSnapshotAt) : 'not taken yet'}
      </p>

      {database.analyses.length === 0 ? (
        <div className="panel empty-state">
          <h3>No analyses yet</h3>
          <p className="muted">Add an analysis to start seeing how this database changes over time.</p>
          <Link to="analyses/new" className="btn btn-primary">Add Analysis</Link>
        </div>
      ) : (
        <div className="cards">
          {database.analyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      )}
    </main>
  )
}

function AnalysisCard({ analysis }: { analysis: Analysis }) {
  const { points, unit } = analysis
  const latest = points[points.length - 1]
  const previous = points[points.length - 2]
  const change = latest && previous ? latest.value - previous.value : 0
  const changeText =
    change === 0 ? 'No change' : `${change > 0 ? '▲' : '▼'} ${Math.abs(change).toLocaleString()}${unit === '%' ? ' pts' : ''}`
  const typeName = analysisTypes.find((type) => type.id === analysis.typeId)?.name

  return (
    <Link to={`analyses/${analysis.id}`} className="card card-link analysis-card">
      <span className="badge">{typeName}</span>
      <h3>{analysis.title}</h3>
      {latest && (
        <>
          <span className="stat-value">{formatValue(latest.value, unit)}</span>
          <span className="muted small">
            {changeText} since {previous?.label}
          </span>
        </>
      )}
      <Sparkline points={points} />
      <span className="card-action">View data →</span>
    </Link>
  )
}

export default DatabaseDashboard
