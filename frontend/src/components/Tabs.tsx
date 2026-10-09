import { useId, type KeyboardEvent, type ReactNode } from 'react'

type Tab = {
  id: string
  label: ReactNode
}

type TabsProps = {
  label: string
  tabs: Tab[]
  activeId: string
  onSelect: (id: string) => void
  // Content of the active tab.
  children: ReactNode
}

function Tabs({ label, tabs, activeId, onSelect, children }: TabsProps) {
  const prefix = useId()
  const tabId = (id: string) => `${prefix}-tab-${id}`
  const panelId = `${prefix}-panel`

  // Left/right arrow keys move between tabs, as in a standard tab list.
  const handleKeyDown = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    const index = tabs.findIndex((t) => t.id === activeId)
    const next = tabs[(index + step + tabs.length) % tabs.length]
    onSelect(next.id)
    document.getElementById(tabId(next.id))?.focus()
  }

  return (
    <div className="stack">
      <div className="tabs" role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              className={isActive ? 'tab tab-active' : 'tab'}
              onClick={() => onSelect(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={panelId} aria-labelledby={tabId(activeId)} className="stack">
        {children}
      </div>
    </div>
  )
}

export default Tabs
