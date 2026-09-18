import { ExternalLink, Trash2, StickyNote, CalendarDays, XCircle } from 'lucide-react'
import { diffBadge } from './StatsBar'
import { formatDate } from '../lib/leetcode'

export default function EntryList({ entries, onDelete, filterDate, onClearFilter, search, questionFilter }) {
  let list = entries
  if (filterDate) list = list.filter((e) => e.date === filterDate)
  if (questionFilter) list = list.filter((e) =>
    (e.slug && e.slug === questionFilter.slug) ||
    (!e.slug && e.title?.toLowerCase() === questionFilter.title?.toLowerCase())
  )
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter((e) =>
      e.title?.toLowerCase().includes(q) ||
      e.slug?.includes(q) ||
      e.notes?.toLowerCase().includes(q)
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">
          {filterDate ? `Solved on ${formatDate(filterDate)}` : questionFilter ? `Attempts: ${questionFilter.title}` : 'History'}
          <span className="ml-2 text-xs font-medium text-slate-400">({list.length})</span>
        </h2>
        {(filterDate || questionFilter) && (
          <button onClick={() => { onClearFilter() }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-slate-800 rounded-lg px-2 py-1">
            <XCircle className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {list.length === 0 && (
        <p className="text-sm text-slate-500 py-6 text-center">No entries match. Log your first solve above.</p>
      )}

      <ul className="space-y-2.5 max-h-[520px] overflow-y-auto pr-0.5">
        {list.map((e) => (
          <li key={e.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {e.number && <span className="text-[10px] font-bold text-slate-400 bg-slate-800/70 px-1.5 py-0.5 rounded">#{e.number}</span>}
                  <span className="font-semibold text-sm truncate">{e.title}</span>
                  <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${diffBadge(e.difficulty)}`}>{e.difficulty}</span>
                  {e.slug && <code className="text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">{e.slug}</code>}
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{formatDate(e.date)}</span>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sky-300 hover:text-sky-200">
                      <ExternalLink className="w-3.5 h-3.5" /> LeetCode
                    </a>
                  )}
                </div>
                {e.notes && (
                  <p className="mt-1.5 flex gap-1.5 text-xs text-slate-400"><StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" /><span className="whitespace-pre-wrap">{e.notes}</span></p>
                )}
              </div>
              <button
                onClick={() => { if (confirm(`Delete "${e.title}" from ${e.date}?`)) onDelete(e.id) }}
                aria-label="Delete entry"
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-500/10 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
