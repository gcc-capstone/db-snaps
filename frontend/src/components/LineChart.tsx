import { useState, type MouseEvent } from 'react'
import { formatValue, type Analysis } from '../data/mockData'

const width = 640
const height = 280
const pad = { top: 16, right: 24, bottom: 32, left: 56 }

function niceRange(values: number[]): [number, number] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = 10 ** Math.floor(Math.log10(span))
  return [Math.max(0, Math.floor((min - span * 0.2) / step) * step), Math.ceil((max + span * 0.2) / step) * step]
}

// Single-series line chart with a hover crosshair and tooltip. Plain SVG, no chart library.
function LineChart({ analysis }: { analysis: Analysis }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { points, unit, title } = analysis
  const [yMin, yMax] = niceRange(points.map((p) => p.value))
  const plotWidth = width - pad.left - pad.right
  const plotHeight = height - pad.top - pad.bottom

  const x = (i: number) => pad.left + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth)
  const y = (value: number) => pad.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight
  const ticks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ')

  const handleMove = (event: MouseEvent<SVGRectElement>) => {
    const box = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
    const svgX = ((event.clientX - box.left) / box.width) * width
    const index = Math.round(((svgX - pad.left) / plotWidth) * (points.length - 1))
    setHovered(Math.min(points.length - 1, Math.max(0, index)))
  }

  const active = hovered === null ? null : points[hovered]

  return (
    <figure className="chart">
      <div className="chart-plot">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line className="chart-grid" x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} />
              <text className="chart-axis" x={pad.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">
                {formatValue(Math.round(tick), unit)}
              </text>
            </g>
          ))}
          {points.map((p, i) => (
            <text key={p.label} className="chart-axis" x={x(i)} y={height - 8} textAnchor="middle">
              {p.label}
            </text>
          ))}
          {hovered !== null && (
            <line className="chart-crosshair" x1={x(hovered)} x2={x(hovered)} y1={pad.top} y2={pad.top + plotHeight} />
          )}
          <path className="chart-line" d={path} />
          {points.map((p, i) => (
            <circle
              key={p.label}
              className="chart-point"
              cx={x(i)}
              cy={y(p.value)}
              r={hovered === i ? 6 : 4}
            />
          ))}
          <rect
            x={pad.left - 12}
            y={pad.top}
            width={plotWidth + 24}
            height={plotHeight}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHovered(null)}
          />
        </svg>
        {active && hovered !== null && (
          <div
            className="chart-tooltip"
            style={{ left: `${(x(hovered) / width) * 100}%`, top: `${(y(active.value) / height) * 100}%` }}
          >
            <span className="muted small">{active.label}</span>
            <strong>{formatValue(active.value, unit)}</strong>
          </div>
        )}
      </div>
    </figure>
  )
}

export default LineChart
