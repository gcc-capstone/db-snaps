import type { DataPoint } from '../data/mockData'

const width = 240
const height = 56

// Small trend line for analysis cards. Decorative; the card text carries the values.
function Sparkline({ points }: { points: DataPoint[] }) {
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  const x = (i: number) => 4 + (i / Math.max(1, points.length - 1)) * (width - 8)
  const y = (value: number) => 4 + (1 - (value - min) / span) * (height - 8)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path className="chart-line" d={path} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default Sparkline
