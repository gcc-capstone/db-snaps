import { useId } from 'react'

type InfoTipProps = {
  label: string
  children: string
}

// Small "i" button that reveals help text on hover or keyboard focus.
function InfoTip({ label, children }: InfoTipProps) {
  const tipId = useId()

  return (
    <span className="info-tip">
      <button type="button" className="info-tip-button" aria-label={label} aria-describedby={tipId}>
        i
      </button>
      <span id={tipId} role="tooltip" className="info-tip-text">
        {children}
      </span>
    </span>
  )
}

export default InfoTip
