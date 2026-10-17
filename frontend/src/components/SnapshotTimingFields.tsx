import {
  frequencyLabels,
  retentionLabels,
  type SnapshotFrequency,
  type SnapshotRetention,
} from '../data/mockData'

type SnapshotTimingFieldsProps = {
  frequency: SnapshotFrequency
  retention: SnapshotRetention
  onFrequencyChange: (frequency: SnapshotFrequency) => void
  onRetentionChange: (retention: SnapshotRetention) => void
}

function SnapshotTimingFields({ frequency, retention, onFrequencyChange, onRetentionChange }: SnapshotTimingFieldsProps) {
  return (
    <section className="panel form">
      <h2>Snapshot Timing</h2>
      <div className="field-pair">
        <label className="field">
          <span className="field-label">Take a snapshot</span>
          <select value={frequency} onChange={(e) => onFrequencyChange(e.target.value as SnapshotFrequency)}>
            {Object.entries(frequencyLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Keep each snapshot for</span>
          <select value={retention} onChange={(e) => onRetentionChange(e.target.value as SnapshotRetention)}>
            {Object.entries(retentionLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted small">
        Snapshots older than this are deleted automatically. Analyses can only show trends across the snapshots that
        are still kept.
      </p>
    </section>
  )
}

export default SnapshotTimingFields
