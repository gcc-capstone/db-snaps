import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { generateReply } from '../data/sqlTools'

type Message = { id: number; role: 'user' | 'assistant'; text: string; sql?: string }

// Prototype only: replies come from canned logic in sqlTools.ts, not a real AI.
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
    const userTexts = next.filter((m) => m.role === 'user').map((m) => m.text)
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: nextId.current++, role: 'assistant', ...generateReply(userTexts) }])
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
      <h2>Ask the assistant</h2>
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
                    className={usedId === message.id ? 'btn btn-secondary' : 'btn btn-primary'}
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
          {thinking && <p className="muted small chat-typing">Writing a query…</p>}
        </div>
      )}

      <div className="chat-input">
        <input
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the analysis you want and the assistant will write the SQL"
          autoComplete="off"
        />
        <button type="button" className="btn btn-secondary" onClick={send} disabled={!draft.trim() || thinking}>
          Send
        </button>
      </div>
    </div>
  )
}

export default SqlAssistant