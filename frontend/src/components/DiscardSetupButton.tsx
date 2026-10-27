import { useId, useRef } from 'react'
import { useNavigate } from 'react-router'

type DiscardSetupButtonProps = {
  databaseName: string
}

// Cancel for the add-database steps. Asks before throwing away what has been entered so far.
function DiscardSetupButton({ databaseName }: DiscardSetupButtonProps) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.showModal()}>
        Cancel
      </button>
      <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby={titleId}>
        <h2 id={titleId}>Stop adding {databaseName}?</h2>
        <p className="muted">
          The connection details and snapshot settings you entered will be discarded. To add this database later, you
          will need to enter them again.
        </p>
        <div className="row">
          {/* First button gets focus, so pressing Enter by habit keeps the user's work. */}
          <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>
            Keep Setting Up
          </button>
          <button type="button" className="btn btn-danger" onClick={() => navigate('/')}>
            Discard
          </button>
        </div>
      </dialog>
    </>
  )
}

export default DiscardSetupButton
