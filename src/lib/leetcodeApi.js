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

// Public CORS mirrors that forward a request to leetcode.com and add CORS
// headers the browser needs. Tried in order after the direct call fails.
const CORS_PROXIES = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`
]

// Non-GraphQL REST mirror as a final tier (also usable without a proxy).
const REST_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LC_REST_URL) ||
  'https://alfa-leetcode-api.onrender.com'

const QUESTION_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    difficulty
    topicTags { name slug }
    stats { acceptanceRate }
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
 * Returns { number, title, slug, difficulty, topics, acceptanceRate }.
 * difficulty is one of 'Easy' | 'Medium' | 'Hard' (or null if unknown).
 * Throws with a user-friendly message on CORS block / 404 / network error.
 */
async function postJSON(url, body, { signal } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://leetcode.com',
      Referer: `https://leetcode.com/problems/${body.variables.titleSlug}/`
    },
    body: JSON.stringify(body),
    signal
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Tiered resolver: direct leetcode.com → CORS mirrors → REST mirror.
async function fetchGraphQL(clean, { signal } = {}) {
  const payload = {
    query: QUESTION_QUERY,
    variables: { titleSlug: clean },
    operationName: 'questionData'
  }
  const urls = [GRAPHQL_URL, ...CORS_PROXIES.map((p) => p(GRAPHQL_URL))]
  for (const url of urls) {
    try {
      return await postJSON(url, payload, { signal })
    } catch (e) {
      if (e?.name === 'AbortError') throw e
      // try next tier
    }
  }
  // Final tier: REST mirror (GET, no CORS headers needed).
  const restRes = await fetch(`${REST_URL}/select?titleSlug=${encodeURIComponent(clean)}`, { signal })
  if (!restRes.ok) {
    throw new Error('LeetCode blocked the request (CORS) — use the suggested title below, or set up the one-line proxy in the README for full auto-fill.')
  }
  return { data: { question: await restRes.json() } }
}

export async function fetchQuestionInfo(slug, { signal } = {}) {
  const clean = String(slug || '').trim().toLowerCase()
  if (!clean) throw new Error('No problem slug found in the URL.')

  let json
  try {
    json = await fetchGraphQL(clean, { signal })
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    throw new Error(
      'Browser blocked the request to leetcode.com (CORS). Use the suggested title below, or set up the one-line proxy in the README for full auto-fill.'
    )
  }

  const q = json?.data?.question
  if (!q) throw new Error('Problem not found — double-check the URL slug.')

  const diff = ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : null
  const rawTopics = q.topicTags || []
  const acceptance = q.acceptanceRate ?? q.stats?.acceptanceRate
  return {
    number: q.questionFrontendId || q.questionNumber || q.questionId || '',
    title: q.title || q.questionTitle || prettifySlug(q.titleSlug || clean),
    slug: (q.titleSlug || clean).toLowerCase(),
    difficulty: diff,
    topics: rawTopics.map((t) => t?.name ?? t).filter(Boolean),
    acceptanceRate: typeof acceptance === 'number' ? acceptance : null
  }
}
