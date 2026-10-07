import { useEffect, useRef, useState, type FormEvent } from 'react'
import { generateReply } from '../data/sqlTools'

type Message = { id: number; role: 'user' | 'assistant'; text: string; sql?: string }

// Prototype only: replies come from canned logic in sqlTools.ts, not a real AI.
function SqlAssistant({ onUseQuery }: { onUseQuery: (sql: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, thinking])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
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

  return (
    <section>
      <h2>Ask the assistant</h2>
      <div className="chat">
        <div className="chat-log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation">
          {messages.length === 0 && !thinking && (
            <p className="muted chat-empty">Describe the analysis you want and the assistant will write the SQL.</p>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`chat-msg chat-msg-${message.role}`}>
              <p>{message.text}</p>
              {message.sql && (
                <>
                  <pre className="sql-block">{message.sql}</pre>
                  <button type="button" className="btn btn-primary" onClick={() => onUseQuery(message.sql!)}>
                    Use this query
                  </button>
                </>
              )}
            </div>
          ))}
          {thinking && <p className="muted small chat-typing">Writing a query…</p>}
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message the assistant"
            aria-label="Message to the SQL assistant"
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary" disabled={!draft.trim() || thinking}>
            Send
          </button>
        </form>
      </div>
    </section>
  )
}

export default SqlAssistant