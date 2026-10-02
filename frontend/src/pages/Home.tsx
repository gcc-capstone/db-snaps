import { Link } from 'react-router'

function Home() {
  return (
    <main className="page">
      <p className="eyebrow">Data in Motion</p>
      <h1>Motus</h1>
      <p className="lead">This is a placeholder home page. Application features will be added here.</p>
      <Link to="/style" className="btn btn-primary">View Style Guide</Link>
    </main>
  )
}

export default Home
