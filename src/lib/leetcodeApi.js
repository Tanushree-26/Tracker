// Fetch public problem metadata from LeetCode's GraphQL API using the
// slug extracted from a pasted URL (see parseLeetCodeUrl in ./leetcode).
//
// Query used:
//   query questionData($titleSlug: String!) {
//     question(titleSlug: $titleSlug) {
//       questionId questionFrontendId title titleSlug difficulty
//       topicTags { name slug }
//     }
//   }
//
// CORS NOTE: browsers often block direct POSTs to leetcode.com (no
// Access-Control-Allow-Origin header). fetchQuestionInfo() tries a direct
// call first and throws a friendly error when blocked — the form then
// falls back to the offline slug suggestion. For guaranteed auto-fill,
// point VITE_LC_GRAPHQL_URL at a tiny same-origin proxy (see README.md),
// e.g. a Vite dev proxy, Netlify/Vercel function, or Cloud Function that
// forwards the request body to https://leetcode.com/graphql.

const GRAPHQL_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LC_GRAPHQL_URL) ||
  'https://leetcode.com/graphql'

const QUESTION_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    difficulty
    topicTags { name slug }
  }
}`

/** Offline fallback: "longest-substring-without-repeating-characters" → "Longest Substring Without Repeating Characters" */
export function prettifySlug(slug) {
  if (!slug) return ''
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/**
 * Returns { number, title, slug, difficulty, topics }.
 * difficulty is one of 'Easy' | 'Medium' | 'Hard' (or null if unknown).
 * Throws with a user-friendly message on CORS block / 404 / network error.
 */
export async function fetchQuestionInfo(slug, { signal } = {}) {
  const clean = String(slug || '').trim().toLowerCase()
  if (!clean) throw new Error('No problem slug found in the URL.')

  let res
  try {
    res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `https://leetcode.com/problems/${clean}/`
      },
      body: JSON.stringify({
        query: QUESTION_QUERY,
        variables: { titleSlug: clean },
        operationName: 'questionData'
      }),
      signal
    })
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    throw new Error(
      'Browser blocked the request to leetcode.com (CORS). Use the suggested title below, or set up the one-line proxy in the README for full auto-fill.'
    )
  }

  if (!res.ok) throw new Error(`LeetCode refused the request (HTTP ${res.status}) — use the suggested title, or the proxy in the README.`)

  let json
  try {
    json = await res.json()
  } catch {
    throw new Error('LeetCode blocked the request — use the suggested title, or the proxy in the README.')
  }
  const q = json?.data?.question
  if (!q) throw new Error('Problem not found — double-check the URL slug.')

  const diff = ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : null
  return {
    number: q.questionFrontendId || q.questionId || '',
    title: q.title || prettifySlug(q.titleSlug || clean),
    slug: (q.titleSlug || clean).toLowerCase(),
    difficulty: diff,
    topics: (q.topicTags || []).map((t) => t.name).filter(Boolean)
  }
}
