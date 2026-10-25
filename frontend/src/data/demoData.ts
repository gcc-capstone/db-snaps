// Hard-wired "jump into the future" for the class presentation.
// Clicking the MOTUS logo fills in years of snapshot history for every database added during the session,
// so the analyses created live have a story to show.

import type { Analysis, DataPoint, TrackedDatabase } from './mockData'

const yearsAhead = 5

// Percent of CS majors still active at each snapshot: a dip, then a recovery.
const csRetention = [82, 78, 71, 66, 72, 79]

// Any analysis that measures retention (from its title or query) gets the CS retention story.
function isRetention(analysis: Analysis): boolean {
  return /retention|retain|status = 'active'/i.test(`${analysis.title} ${analysis.query ?? ''}`)
}

// Steady, slightly noisy growth for any other analysis made during the demo.
function otherSeries(analysis: Analysis, count: number): number[] {
  const seed = [...analysis.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const base = analysis.unit === '%' ? 40 + (seed % 30) : 400 + (seed % 1500)
  const step = analysis.unit === '%' ? 2 : base * 0.04
  return Array.from({ length: count }, (_, i) => Math.round(base + i * step + Math.sin(seed + i) * step))
}

function snapshotsPerYear(database: TrackedDatabase): number {
  return { daily: 365, weekly: 52, monthly: 12 }[database.frequency]
}

// One point per year, from the year the database was added to `yearsAhead` years later.
export function jumpToFuture(database: TrackedDatabase, now: Date = new Date()): TrackedDatabase {
  const startYear = now.getUTCFullYear()
  const labels = Array.from({ length: yearsAhead + 1 }, (_, i) => String(startYear + i))
  const lastSnapshot = new Date(Date.UTC(startYear + yearsAhead, now.getUTCMonth(), 1, 6))

  const analyses = database.analyses.map((analysis): Analysis => {
    const values = isRetention(analysis) ? csRetention : otherSeries(analysis, labels.length)
    const points: DataPoint[] = labels.map((label, i) => ({ label, value: values[i] }))
    return { ...analysis, unit: isRetention(analysis) ? '%' : analysis.unit, points }
  })

  return {
    ...database,
    analyses,
    snapshotCount: snapshotsPerYear(database) * yearsAhead,
    lastSnapshotAt: lastSnapshot.toISOString(),
    // Drop any snapshots taken by hand during the demo, so the generated history is shown instead.
    snapshots: undefined,
  }
}
