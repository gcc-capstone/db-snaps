import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { demoReply } from '../data/demoData'

type Message = { id: number; role: 'user' | 'assistant'; text: string; sql?: string }

// Prototype only: for the presentation every reply is the hard-wired demoReply (demoData.ts), not a real AI.
// Switch back to generateReply in sqlTools.ts for the canned replies that react to what is typed.
// Not a <form>: it sits inside the query form, so Enter is handled manually.
function SqlAssistant({ onUseQuery }: { onUseQuery: (sql: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [usedId, setUsedId] = useState<number | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, thinking])

  const send = () => {
    const text = draft.trim()
    if (!text || thinking) return
    const next = [...messages, { id: nextId.current++, role: 'user' as const, text }]
    setMessages(next)
    setDraft('')
    setThinking(true)
        window.setTimeout(() => {
      setMessages((current) => [...current, { id: nextId.current++, role: 'assistant', ...demoReply }])
      setThinking(false)
    }, 800)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }

  return (
    <div className="assistant">
      <h2>Describe what you want to see, and we'll write the query</h2>
      <label htmlFor="assistant-input" className="visually-hidden">Message to the assistant</label>

      {(messages.length > 0 || thinking) && (
        <div className="chat-log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation">
          {messages.map((message) => (
            <div key={message.id} className={`chat-msg chat-msg-${message.role}`}>
              <p>{message.text}</p>
              {message.sql && (
                <>
                  <pre className="sql-block">{message.sql}</pre>
                  <button
                    type="button"
                    className={usedId === message.id ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                    onClick={() => {
                      setUsedId(message.id)
                      onUseQuery(message.sql!)
                    }}
                  >
                    {usedId === message.id ? '✓ Added to editor' : 'Use this query'}
                  </button>
                </>
              )}
            </div>
          ))}
          {thinking && (
            <div className="chat-msg chat-msg-assistant" role="status">
              <span className="visually-hidden">The assistant is writing a query</span>
              <span className="typing" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
        </div>
      )}

      <div className="chat-input">
        <input
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the analysis you want in plain English"
          autoComplete="off"
          // The assistant is the main way to start, so the cursor starts here.
          autoFocus
        />
        <button type="button" className="btn btn-primary" onClick={send} disabled={!draft.trim() || thinking}>
          Send
        </button>
      </div>
    </div>
  )
}

export default SqlAssistant