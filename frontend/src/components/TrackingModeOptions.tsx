import type { TrackingMode } from '../data/mockData'
import InfoTip from './InfoTip'

type SimpleMode = Exclude<TrackingMode, 'custom'>

type TrackingModeOptionsProps = {
  value: TrackingMode
  onChange: (mode: SimpleMode) => void
  // Existing databases keep what they already track when switching to on-demand, so the wording differs.
  isNew: boolean
}

// The two simple ways to choose what snapshots include. A custom selection leaves both unselected.
function TrackingModeOptions({ value, onChange, isNew }: TrackingModeOptionsProps) {
  const options: { mode: SimpleMode; name: string; description: string }[] = [
    {
      mode: 'all',
      name: 'Track everything',
      description:
        'Every column of every table is copied into each snapshot, so any analysis you add later already has history to work with. Uses the most storage.',
    },
    {
      mode: 'on-demand',
      name: 'Track as needed',
      description: isNew
        ? 'Nothing is copied until you create an analysis. Then only the columns its query uses are tracked, and its history starts with the next snapshot.'
        : 'Keep tracking what is tracked now. When a new analysis uses other columns, start tracking those too. Their history starts with the next snapshot.',
    },
  ]

  return (
    <fieldset className="choice-grid">
      <legend className="visually-hidden">What to track</legend>
      {options.map((option) => (
        <label key={option.mode} className={value === option.mode ? 'choice choice-selected' : 'choice'}>
          <input
            type="radio"
            name="tracking-mode"
            value={option.mode}
            checked={value === option.mode}
            onChange={() => onChange(option.mode)}
          />
          <span className="choice-header">
            <span className="choice-name">{option.name}</span>
            <InfoTip label={`About ${option.name.toLowerCase()}`}>{option.description}</InfoTip>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

export default TrackingModeOptions
