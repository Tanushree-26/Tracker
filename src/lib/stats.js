import { entryKey, todayISO } from './leetcode'

/** Group entries by attempt date: { 'YYYY-MM-DD': Entry[] } */
export function groupByDate(entries) {
  const map = {}
  for (const e of entries) {
    const d = e.date || todayISO()
    if (!map[d]) map[d] = []
    map[d].push(e)
  }
  for (const d of Object.keys(map)) {
    map[d].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }
  return map
}

/** Group attempts by unique question: [{ key, title, slug, url, difficulty, count, dates[], entries[] }] */
export function groupByQuestion(entries) {
  const map = new Map()
  for (const e of entries) {
    const key = entryKey(e)
    if (!map.has(key)) {
      map.set(key, {
        key, title: e.title, slug: e.slug || '', url: e.url || '',
        difficulty: e.difficulty, count: 0, dates: [], entries: []
      })
    }
    const g = map.get(key)
    g.count += 1
    g.entries.push(e)
    if (e.date && !g.dates.includes(e.date)) g.dates.push(e.date)
    // keep latest difficulty/title
    g.difficulty = e.difficulty || g.difficulty
    g.title = e.title || g.title
  }
  const arr = [...map.values()]
  arr.forEach((g) => g.dates.sort())
  arr.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
  return arr
}

/** Consecutive days (ending today or yesterday) with ≥1 solve. */
export function calcStreak(entries) {
  const days = new Set(entries.map((e) => e.date).filter(Boolean))
  if (days.size === 0) return 0
  const d = new Date()
  const iso = (dt) => dt.toISOString().slice(0, 10)
  // Local-date safe ISO:
  const localISO = (dt) => {
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  void iso
  let cursor = new Date()
  if (!days.has(localISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(localISO(cursor))) return 0
  }
  let streak = 0
  while (days.has(localISO(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function difficultyCount(entries) {
  const c = { Easy: 0, Medium: 0, Hard: 0 }
  // count unique questions per difficulty (latest difficulty wins)
  for (const g of groupByQuestion(entries)) {
    if (c[g.difficulty] !== undefined) c[g.difficulty] += 1
  }
  return c
}
