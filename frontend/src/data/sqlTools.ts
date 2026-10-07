// Dummy SQL helpers for the prototype. Nothing here talks to a real database or AI.

export type SqlValidation = { ok: true } | { ok: false; error: string }

export type AssistantReply = { text: string; sql?: string }

// Tables the fake "connected database" exposes. Used for validation and shown in the UI.
export const schema: { table: string; columns: string[] }[] = [
  { table: 'students', columns: ['student_id', 'name', 'major', 'status', 'enrolled_year', 'snapshot_year'] },
  { table: 'enrollments', columns: ['student_id', 'course_code', 'term', 'grade', 'snapshot_year'] },
  { table: 'majors', columns: ['major_code', 'major_name', 'department'] },
  { table: 'major_changes', columns: ['student_id', 'from_major', 'to_major', 'changed_year'] },
]

const forbiddenWords = ['insert', 'update', 'delete', 'drop', 'alter', 'truncate', 'create', 'grant', 'revoke', 'merge', 'exec']

const fail = (error: string): SqlValidation => ({ ok: false, error })

// Fake validation: a handful of simple checks that catch the mistakes a tester is most likely to try.
export function validateSql(raw: string): SqlValidation {
  const body = raw.trim().replace(/;\s*$/, '')
  if (!body) return fail('Enter a query to test.')

  if ((body.match(/'/g) ?? []).length % 2 !== 0) return fail('Unclosed quote. Add the missing \' to finish the text value.')
  const code = body.replace(/'[^']*'/g, "''")

  if (code.includes(';')) return fail('Only one statement is allowed. Remove the extra statement after the semicolon.')

  const words = code.toLowerCase().match(/[a-z_]+/g) ?? []
  const forbidden = forbiddenWords.find((word) => words.includes(word))
  if (forbidden) return fail(`Queries must be read-only. "${forbidden.toUpperCase()}" is not allowed.`)

  if (!/^(select|with)\b/i.test(body)) return fail('A query must start with SELECT or WITH.')

  const opens = (code.match(/\(/g) ?? []).length
  const closes = (code.match(/\)/g) ?? []).length
  if (opens !== closes) return fail('Parentheses do not match. Check that every ( has a closing ).')

  if (!/\bfrom\b/i.test(code)) return fail('The query is missing a FROM clause.')
  if (/,\s*from\b/i.test(code)) return fail('Remove the comma before FROM.')

  // Table check (skipped for WITH queries, whose table names can be defined inside the query).
  if (!/^with\b/i.test(body)) {
    const withoutExtract = code.replace(/extract\s*\([^)]*\)/gi, '')
    for (const match of withoutExtract.matchAll(/\b(?:from|join)\s+([a-z_][\w.]*)/gi)) {
      const name = match[1].split('.').pop()!.toLowerCase()
      if (!schema.some((t) => t.table === name)) {
        return fail(`Table "${name}" does not exist. Available tables: ${schema.map((t) => t.table).join(', ')}.`)
      }
    }
  }

  return { ok: true }
}

const majors: [RegExp, string][] = [
  [/\b(cs|computer science)\b/, 'Computer Science'],
  [/business analytics/, 'Business Analytics'],
  [/\bmath/, 'Mathematics'],
  [/\bbiolog/, 'Biology'],
]

function findMajors(text: string): string[] {
  return majors.filter(([pattern]) => pattern.test(text)).map(([, name]) => name)
}

function buildQuery(label: string, value: string, table: string, conditions: string[], groupBy: string): string {
  const where = conditions.length > 0 ? `\nWHERE ${conditions.join('\n  AND ')}` : ''
  return `SELECT ${label} AS label,\n       ${value} AS value\nFROM ${table}${where}\nGROUP BY ${groupBy}\nORDER BY ${groupBy};`
}

type Topic = 'retention' | 'count' | 'changes' | 'share'

const topics: [Topic, RegExp][] = [
  ['retention', /retain|retention|dropout|drop out|stay/],
  ['share', /share|percent|proportion|business analytics|leaving/],
  ['changes', /change|switch|transfer/],
  ['count', /how many|count|total|enrol|number of/],
]

// Canned "AI". Reads the whole conversation (newest message first) and picks a template query.
export function generateReply(userMessages: string[]): AssistantReply {
  const newestFirst = [...userMessages].reverse().map((m) => m.toLowerCase())
  const topic = newestFirst.map((m) => topics.find(([, pattern]) => pattern.test(m))?.[0]).find(Boolean)

  if (!topic) {
    return {
      text: 'I need a little more detail to write that. What do you want to measure? For example: "How many students are enrolled each year?" or "Retention of Computer Science majors since 2022."',
    }
  }

  const year = newestFirst.map((m) => m.match(/\b(20\d\d)\b/)?.[1]).find(Boolean)
  const major = newestFirst.map((m) => findMajors(m)[0]).find(Boolean)
  const since = (column: string) => (year ? [`${column} >= ${year}`] : [])
  const yearNote = year ? ` for ${year} onward` : ''

  switch (topic) {
    case 'retention': {
      const name = major ?? 'Computer Science'
      return {
        text: `This calculates the percent of ${name} students who are still active at each snapshot${yearNote}.${major ? '' : ' I assumed Computer Science; tell me if you meant another major.'}`,
        sql: buildQuery(
          'snapshot_year',
          "ROUND(100.0 * SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) / COUNT(*), 1)",
          'students',
          [`major = '${name}'`, ...since('snapshot_year')],
          'snapshot_year',
        ),
      }
    }
    case 'changes': {
      const conditions = [...(major ? [`from_major = '${major}'`] : []), ...since('changed_year')]
      return {
        text: `This counts major changes per year${major ? ` away from ${major}` : ' across all majors'}${yearNote}.`,
        sql: buildQuery('changed_year', 'COUNT(*)', 'major_changes', conditions, 'changed_year'),
      }
    }
    case 'share': {
      const from = findMajors(newestFirst.join(' ')).find((m) => m !== 'Business Analytics') ?? 'Computer Science'
      return {
        text: `This shows the percent of students leaving ${from} who moved to Business Analytics each year${yearNote}. I assumed Business Analytics as the destination.`,
        sql: buildQuery(
          'changed_year',
          "ROUND(100.0 * SUM(CASE WHEN to_major = 'Business Analytics' THEN 1 ELSE 0 END) / COUNT(*), 1)",
          'major_changes',
          [`from_major = '${from}'`, ...since('changed_year')],
          'changed_year',
        ),
      }
    }
    default: {
      const conditions = [...(major ? [`major = '${major}'`] : []), ...since('snapshot_year')]
      return {
        text: `This counts ${major ? `${major} students` : 'all students'} at each snapshot${yearNote}.`,
        sql: buildQuery('snapshot_year', 'COUNT(*)', 'students', conditions, 'snapshot_year'),
      }
    }
  }
}
