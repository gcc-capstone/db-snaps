import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import type { DatabaseDraft } from '../data/mockData'

const engineNames: [string, string][] = [
  ['postgres', 'PostgreSQL'],
  ['mysql', 'MySQL'],
  ['sqlserver', 'SQL Server'],
  ['server=', 'SQL Server'],
  ['oracle', 'Oracle'],
]

// Best-effort labels for display; accepts URL, JDBC, and key=value connection strings.
function describeConnection(connectionString: string) {
  const lower = connectionString.toLowerCase()
  const engine = engineNames.find(([key]) => lower.includes(key))?.[1] ?? 'Database'
  const host =
    connectionString.match(/\/\/(?:[^@/]*@)?([^/;?]+)/)?.[1] ??
    connectionString.match(/(?:server|host|data source)=([^;]+)/i)?.[1] ??
    connectionString.split(/[/;]/)[0]
  return { engine, host: host.trim() }
}

function NewDatabase() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [connectionString, setConnectionString] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const missing = [
    name.trim() === '' && 'database name',
    connectionString.trim() === '' && 'connection string',
  ].filter(Boolean)

  // Fake connection test: only checks that the required fields are filled in.
  const testConnection = () => setTestResult(missing.length === 0 ? 'success' : 'error')

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (missing.length > 0) {
      setTestResult('error')
      return
    }
    const draft: DatabaseDraft = {
      name: name.trim(),
      ...describeConnection(connectionString.trim()),
      username: username.trim(),
    }
    // The password is not kept anywhere in this prototype.
    navigate('/databases/new/settings', { state: draft })
  }

  return (
    <main className="page">
      <Link to="/">← Back to Databases</Link>
      <div className="page-header page-header-spaced">
        <div>
          <p className="eyebrow">Step 1 of 2</p>
          <h1>Add a Database</h1>
        </div>
      </div>

      <form className="panel form" onSubmit={handleCreate}>
        <label className="field">
          <span className="field-label">Database name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="GCC Student Database" />
        </label>
        <label className="field">
          <span className="field-label">Connection string</span>
          <input
            value={connectionString}
            onChange={(e) => {
              setConnectionString(e.target.value)
              setTestResult(null)
            }}
            placeholder="postgresql://host:5432/dbname"
          />
        </label>
        <div className="field-pair">
          <label className="field">
            <span className="field-label">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
        </div>

        {testResult === 'success' && <p className="message message-success">Connection successful.</p>}
        {testResult === 'error' && missing.length > 0 && (
          <p className="message message-error">Enter a {missing.join(' and ')}.</p>
        )}

        <div className="row">
          <button type="button" className="btn btn-secondary" onClick={testConnection}>
            Test Connection
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </main>
  )
}

export default NewDatabase
