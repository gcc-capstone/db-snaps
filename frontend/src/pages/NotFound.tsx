import { Link } from 'react-router'

function NotFound() {
  return (
    <main className="page">
      <h1>Page Not Found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Back to Databases</Link>
    </main>
  )
}

export default NotFound
