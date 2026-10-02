import motusLogo from '../assets/motus-logo.png'

const colors = [
  { name: 'Navy', token: '--color-navy', value: '#0B2545', use: 'Header, headings, primary buttons' },
  { name: 'Steel Blue', token: '--color-steel', value: '#3E6491', use: 'Secondary buttons, list markers, input focus' },
  { name: 'Signal Amber', token: '--color-amber', value: '#F2A541', use: 'Accent for active, focus, and highlight states' },
  { name: 'Mist', token: '--color-mist', value: '#E6EDF5', use: 'Panel and hover backgrounds' },
  { name: 'Paper', token: '--color-paper', value: '#F7F9FC', use: 'Page background' },
  { name: 'Ink', token: '--color-ink', value: '#1C2430', use: 'Body text' },
  { name: 'Slate', token: '--color-slate', value: '#5B6777', use: 'Muted text and labels' },
]

function StyleReference() {
  return (
    <main className="page">
      <section className="section">
        <p className="eyebrow">Style Reference</p>
        <h1>My Primary Heading</h1>
        <p className="lead">
          My body text. This page shows the colors, type, spacing, and controls used across the
          Motus interface.
        </p>
      </section>

      <section className="section">
        <h2>Color Palette</h2>
        <div className="swatches">
          {colors.map((color) => (
            <div className="swatch" key={color.name}>
              <div className="swatch-color" style={{ background: `var(${color.token})` }} />
              <div className="swatch-label">
                <strong>{color.name}</strong>
                <code>{color.value}</code>
                <span>{color.use}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Typography</h2>
        <div className="panel">
          <p className="eyebrow">Eyebrow · 0.75rem uppercase</p>
          <h1>My Primary Heading</h1>
          <h2>My Secondary Heading</h2>
          <h3>My Tertiary Heading</h3>
          <p>
            My body text. Body copy is set at 16px with a 1.6 line height in Ink on a light
            background for comfortable reading.
          </p>
          <p className="muted">My muted text for captions and helper copy.</p>
          <ul className="list">
            <li>My List Item</li>
            <li>My List Item</li>
            <li>My List Item</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <h2>Buttons</h2>
        <div className="row">
          <button className="btn btn-primary">My Button</button>
          <button className="btn btn-secondary">My Button</button>
          <button className="btn btn-primary" disabled>My Button</button>
        </div>
      </section>

      <section className="section">
        <h2>Form Controls</h2>
        <form className="panel form" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span className="field-label">My Text Input</span>
            <input type="text" placeholder="My placeholder" />
          </label>
          <label className="field">
            <span className="field-label">My Dropdown</span>
            <select defaultValue="">
              <option value="" disabled>My option…</option>
              <option>My Option 1</option>
              <option>My Option 2</option>
            </select>
          </label>
          <label className="checkbox">
            <input type="checkbox" defaultChecked />
            My Checkbox
          </label>
          <div className="row">
            <button className="btn btn-primary" type="submit">My Button</button>
            <button className="btn btn-secondary" type="button">My Button</button>
          </div>
        </form>
      </section>

      <section className="section">
        <h2>Cards</h2>
        <div className="cards">
          <article className="card">
            <span className="badge">My Badge</span>
            <h3>My Card Title</h3>
            <p className="muted">My card body text describing the content of this panel.</p>
            <button className="btn btn-secondary">My Button</button>
          </article>
          <article className="card card-accent">
            <span className="badge">My Badge</span>
            <h3>My Card Title</h3>
            <p className="muted">My card body text describing the content of this panel.</p>
            <button className="btn btn-primary">My Button</button>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Spacing</h2>
        <div className="spacing">
          {[4, 8, 16, 24, 32, 48].map((size) => (
            <div className="spacing-item" key={size}>
              <div className="spacing-bar" style={{ width: size }} />
              <code>{size}px</code>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Navigation</h2>
        <header className="nav nav-example">
          <span className="nav-brand">MOTUS</span>
          <nav>
            <ul className="nav-links">
              <li><a href="#" className="active">My Link</a></li>
              <li><a href="#">My Link</a></li>
              <li><a href="#">My Link</a></li>
            </ul>
          </nav>
        </header>
      </section>

      <section className="section">
        <h2>Logo</h2>
        <div className="panel logo-panel">
          <img src={motusLogo} alt="Motus — Data in Motion" />
        </div>
      </section>
    </main>
  )
}

export default StyleReference
