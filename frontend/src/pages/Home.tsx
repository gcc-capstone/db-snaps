import { Link } from 'react-router'
import { formatDate, frequencyLabels, type TrackedDatabase } from '../data/mockData'

function Home({ databases }: { databases: TrackedDatabase[] }) {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Data in Motion</p>
          <h1>My Databases</h1>
        </div>
        <Link to="/databases/new" className="btn btn-primary">Add Database</Link>
      </div>

      {databases.length === 0 ? (
        <div className="panel empty-state">
          <h3>No databases yet</h3>
          <p className="muted">Add a database to start taking snapshots.</p>
        </div>
      ) : (
        <div className="cards">
          {databases.map((database) => (
            <Link key={database.id} to={`/databases/${database.id}`} className="card card-link">
              <span className="badge">{database.engine}</span>
              <h3>{database.name}</h3>
              <dl className="meta">
                <div className="meta-row">
                  <dt>Analyses</dt>
                  <dd>{database.analyses.length}</dd>
                </div>
                <div className="meta-row">
                  <dt>Snapshots</dt>
                  <dd>{database.snapshotCount}</dd>
                </div>
                <div className="meta-row">
                  <dt>Last snapshot</dt>
                  <dd>{database.lastSnapshotAt ? formatDate(database.lastSnapshotAt) : 'None yet'}</dd>
                </div>
                <div className="meta-row">
                  <dt>Frequency</dt>
                  <dd>{frequencyLabels[database.frequency]}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default Home
