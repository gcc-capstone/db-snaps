// Dummy snapshot history for the prototype. Nothing here talks to a real database.
// History is generated from each database's snapshot count, frequency and last snapshot time,
// so it always agrees with the numbers shown elsewhere in the UI.

import type { Snapshot, TrackedDatabase } from './mockData'

// Same tables as the schema list on the Add Analysis page.
const profiles = [
  { table: 'students', base: 2250, growth: 5 },
  { table: 'enrollments', base: 15800, growth: 38 },
  { table: 'majors', base: 58, growth: 0 },
  { table: 'major_changes', base: 120, growth: 3 },
]

function hash(text: string): number {
  return [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 100003, 7)
}

// Small repeatable "random" offset in the range -range..range.
function wobble(seed: number, n: number, range: number): number {
  return Math.round(Math.sin(seed * 13 + n * 7.1) * range)
}

function makeSnapshot(
  database: TrackedDatabase,
  number: number,
  takenAt: Date,
  trigger: Snapshot['trigger'],
  failed: boolean,
): Snapshot {
  const seed = hash(database.id)
  const base = {
    id: `snap-${String(number).padStart(4, '0')}`,
    number,
    takenAt: takenAt.toISOString(),
    trigger,
  }

  if (failed) {
    const errors = [
      'Connection timed out after 30 s while reading enrollments.',
      `Login failed for user "${database.username}".`,
    ]
    return {
      ...base,
      status: 'failed',
      tables: [],
      rows: 0,
      sizeMb: 0,
      durationSec: 30,
      error: errors[(seed + number) % errors.length],
    }
  }

  // Tables grow steadily; a little noise keeps the "change" column from looking fake.
  const tables = profiles.map((p) => ({
    table: p.table,
    rows: p.base + p.growth * number + (p.growth > 0 ? wobble(seed + p.base, number, Math.max(1, Math.round(p.growth * 0.3))) : 0),
  }))
  const rows = tables.reduce((sum, t) => sum + t.rows, 0)
  return {
    ...base,
    status: 'complete',
    tables,
    rows,
    sizeMb: Math.round(rows * 0.009) / 10,
    durationSec: Math.max(5, 14 + Math.round(rows / 1400) + wobble(seed, number, 3)),
  }
}

// Newest first. The latest snapshot is always a scheduled, successful one.
export function generateSnapshots(database: TrackedDatabase): Snapshot[] {
  if (!database.lastSnapshotAt || database.snapshotCount <= 0) return []
  const seed = hash(database.id)
  const last = new Date(database.lastSnapshotAt)
  const list: Snapshot[] = []

  for (let i = 0; i < database.snapshotCount; i++) {
    const number = database.snapshotCount - i
    const takenAt = new Date(last)
    if (database.frequency === 'monthly') takenAt.setUTCMonth(last.getUTCMonth() - i)
    else takenAt.setUTCDate(last.getUTCDate() - i * (database.frequency === 'weekly' ? 7 : 1))

    const manual = i > 0 && (seed + number) % 9 === 0
    const failed = i > 0 && !manual && (seed + number) % 17 === 0
    if (manual) takenAt.setUTCHours(takenAt.getUTCHours() + 3 + ((number * 7) % 9), (number * 13) % 60)

    list.push(makeSnapshot(database, number, takenAt, manual ? 'manual' : 'scheduled', failed))
  }
  return list
}

export function getSnapshots(database: TrackedDatabase): Snapshot[] {
  return database.snapshots ?? generateSnapshots(database)
}

// What the "Take Snapshot Now" button adds.
export function createManualSnapshot(database: TrackedDatabase, now: Date = new Date()): Snapshot {
  return makeSnapshot(database, database.snapshotCount + 1, now, 'manual', false)
}

// "2026-09-01 06:00:00" (UTC), for tables and logs.
export function formatDateTime(iso: string): string {
  return iso.replace('T', ' ').slice(0, 19)
}
