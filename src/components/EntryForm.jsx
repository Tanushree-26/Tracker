import { useEffect, useMemo, useRef, useState } from 'react'
import { PlusCircle, Link2, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { parseLeetCodeUrl, todayISO } from '../lib/leetcode'
import { fetchQuestionInfo, prettifySlug } from '../lib/leetcodeApi'

const DIFFS = ['Easy', 'Medium', 'Hard']

export default function EntryForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [number, setNumber] = useState('')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [fetched, setFetched] = useState(null)

  const parsed = useMemo(() => parseLeetCodeUrl(url), [url])
  const suggestion = useMemo(() => prettifySlug(parsed.slug), [parsed.slug])

  // Track latest URL so a slow fetch never overwrites a newer pasted link.
  const urlRef = useRef(url)
  urlRef.current = url

  // Stale result guard: editing the URL invalidates previous fetch output.
  useEffect(() => {
    setFetched(null)
    setFetchError('')
  }, [parsed.slug])

  const autoFill = async () => {
    const slug = parsed.slug
    if (!slug || fetching) return
    setFetching(true)
    setFetchError('')
    try {
      const info = await fetchQuestionInfo(slug)
      if (parseLeetCodeUrl(urlRef.current).slug !== slug) return // URL changed mid-flight
      if (!title.trim() || title.trim() === suggestion) setTitle(info.title)
      if (info.difficulty) setDifficulty(info.difficulty)
      if (info.number) setNumber(info.number)
      setFetched(info)
    } catch (e) {
      if (e?.name !== 'AbortError') setFetchError(e?.message || 'Could not fetch problem info.')
    } finally {
      setFetching(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    setSaving(true)
    try {
      await onAdd({
        title: title.trim(),
        url: parsed.url || url.trim(),
        slug: parsed.slug,
        number: number.trim(),
        difficulty,
        date,
        notes: notes.trim(),
        timeSpent: timeSpent.trim(),
        acceptanceRate: fetched?.acceptanceRate ?? null
      })
      setTitle(''); setUrl(''); setNotes('')
      setNumber(''); setFetched(null); setFetchError('')
      setDifficulty('Medium'); setDate(todayISO()); setTimeSpent('')
      setOk('Logged! Nice work.')
      setTimeout(() => setOk(''), 2500)
    } finally {
      setSaving(false)
    }
  }

  const diffStyle = (d) =>
    difficulty === d
      ? d === 'Easy' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
      : d === 'Medium' ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
      : 'bg-red-500/20 border-red-400/50 text-red-300'
      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <PlusCircle className="w-5 h-5 text-amber-400" />
        <h2 className="font-bold">Log a solved question</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-400">Question title *</span>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="e.g. Two Sum"
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm placeholder:text-slate-600 focus:border-amber-400/60"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-400">Attempt date *</span>
          <input
            type="date" value={date} max={todayISO()} required
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm focus:border-amber-400/60"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-400">Time spent (minutes)</span>
          <input
            type="number" min="0" value={timeSpent} inputMode="numeric"
            onChange={(e) => setTimeSpent(e.target.value)}
            placeholder="e.g. 45"
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm placeholder:text-slate-600 focus:border-amber-400/60"
          />
        </label>
        <div className="hidden min-[420px]:block" />
      </div>

      <label className="block">
        <span className="text-xs font-medium text-slate-400">LeetCode URL (slug auto-extracted)</span>
        <div className="relative mt-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://leetcode.com/problems/two-sum/"
            inputMode="url"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2.5 text-sm placeholder:text-slate-600 focus:border-amber-400/60"
          />
        </div>
        {url.trim() && (
          <p className="mt-1 text-[11px] text-slate-500">
            {parsed.slug
              ? <>Detected slug: <code className="text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">{parsed.slug}</code></>
              : 'Could not detect a /problems/ slug — entry will still be saved.'}
          </p>
        )}
        {parsed.slug && (
          <div className="flex flex-col min-[420px]:flex-row gap-2">
            <input
              value={number} onChange={(e) => setNumber(e.target.value)}
              placeholder="# e.g. 1" inputMode="numeric" aria-label="Problem number (optional)"
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm placeholder:text-slate-600 focus:border-amber-400/60 min-[420px]:w-28"
            />
            <button
              type="button" onClick={autoFill} disabled={fetching}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-200 text-xs font-semibold px-3 py-2 hover:bg-amber-400/20 disabled:opacity-50 transition"
            >
              {fetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {fetching ? 'Fetching from LeetCode…' : 'Auto-fill title, difficulty & ID'}
            </button>
          </div>
        )}
        {!title.trim() && suggestion && (
          <button type="button" onClick={() => setTitle(suggestion)} className="text-[11px] text-sky-300 hover:text-sky-200">
            No network needed — use “{suggestion}” as title
          </button>
        )}
        {fetchError && <p className="text-[11px] text-red-300">{fetchError}</p>}
        {fetched && !fetchError && (
          <p className="text-[11px] text-emerald-300">
            Found{fetched.number ? ` #${fetched.number}` : ''}{fetched.difficulty ? ` · ${fetched.difficulty}` : ''}{fetched.acceptanceRate != null ? ` · ${fetched.acceptanceRate}% accepted` : ''}{fetched.topics.length ? ` · ${fetched.topics.slice(0, 4).join(', ')}${fetched.topics.length > 4 ? '…' : ''}` : ''}
          </p>
        )}
      </label>

      <div>
        <span className="text-xs font-medium text-slate-400">Difficulty *</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {DIFFS.map((d) => (
            <button
              type="button" key={d} onClick={() => setDifficulty(d)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${diffStyle(d)}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-slate-400">Notes / approach</span>
        <textarea
          value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="e.g. Hash map, one pass O(n). Edge: duplicates…"
          className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm placeholder:text-slate-600 focus:border-amber-400/60 resize-y"
        />
      </label>

      <button
        disabled={saving || !title.trim()}
        className="w-full rounded-xl bg-amber-400 text-slate-950 font-bold py-2.5 text-sm hover:bg-amber-300 disabled:opacity-50 transition"
      >
        {saving ? 'Saving…' : 'Save entry'}
      </button>
      {ok && <p className="flex items-center gap-1.5 text-xs text-emerald-300"><CheckCircle2 className="w-4 h-4" />{ok}</p>}
    </form>
  )
}
