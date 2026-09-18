// Helpers to parse a LeetCode URL into a canonical slug + problem number.

/**
 * Extract slug + id from a LeetCode URL.
 * Supports:
 *  - https://leetcode.com/problems/two-sum/
 *  - https://leetcode.com/problems/two-sum/description/
 *  - https://leetcode.com/problems/two-sum/submissions/...
 *  - leetcode.com/problems/Two-Sum
 *  - with query strings / trailing slashes
 * Returns { slug, url } — slug is lowercase kebab-case, url is normalized.
 */
export function parseLeetCodeUrl(raw) {
  if (!raw) return { slug: '', url: '' }
  const trimmed = String(raw).trim()
  // Plain slug typed by user, e.g. "two-sum" (no dots/slashes/spaces)
  if (/^[A-Za-z0-9-]+$/.test(trimmed) && !trimmed.includes('.')) {
    const slug = trimmed.toLowerCase()
    return { slug, url: `https://leetcode.com/problems/${slug}/` }
  }
  let input = trimmed
  if (input && !/^https?:\/\//i.test(input)) input = 'https://' + input

  try {
    const u = new URL(input)
    const hostOk = /leetcode(\.cn|\.com)?$/i.test(u.hostname.replace(/^www\./, '')) ||
      u.hostname.toLowerCase().includes('leetcode')
    const match = u.pathname.match(/\/problems\/([A-Za-z0-9-]+)/)
    if (match) {
      const slug = match[1].toLowerCase()
      return { slug, url: `https://leetcode.com/problems/${slug}/` }
    }
    // Not a /problems/ URL but mentions leetcode → keep raw, slug from best effort
    if (hostOk) return { slug: '', url: u.toString() }
    return { slug: '', url: String(raw).trim() }
  } catch {
    // Plain slug typed by user, e.g. "two-sum"
    const slug = String(raw).trim().toLowerCase().replace(/\s+/g, '-')
    if (/^[a-z0-9-]+$/.test(slug)) {
      return { slug, url: `https://leetcode.com/problems/${slug}/` }
    }
    return { slug: '', url: String(raw).trim() }
  }
}

/** Canonical dedupe key: prefer slug, else normalized title, else url. */
export function entryKey(e) {
  if (e?.slug) return `slug:${e.slug}`
  if (e?.title) return `title:${e.title.trim().toLowerCase()}`
  return `url:${(e?.url || '').trim().toLowerCase()}`
}

export function todayISO(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  })
}
