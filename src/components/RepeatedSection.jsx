import { useMemo, useState } from 'react'
import { Repeat2, ExternalLink, Clock3 } from 'lucide-react'
import { diffBadge } from './StatsBar'
import { reviewStatus } from '../lib/stats'

export default function RepeatedSection({ groups, entries, onSelect }) {
  const [showDue, setShowDue] = useState(false)
  const repeats = useMemo(() => groups.filter((g) => g.count > 1), [groups])
  const due = useMemo(() => reviewStatus(entries || []), [entries])
  const list = showDue ? due : repeats
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1">
        <Repeat2 className="w-5 h-5 text-violet-300" />
        <h2 className="font-bold">Repeated questions</h2>
        <span className="text-xs text-slate-400">({list.length})</span>
      </div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs text-slate-500">Questions attempted more than once — spaced repetition working.</p>
        <button
          onClick={() => setShowDue((v) => !v)}
          className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold border rounded-lg px-2 py-1 transition ${showDue ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
        >
          <Clock3 className="w-3.5 h-3.5" /> Due for review ({due.length})
        </button>
      </div>
      {list.length === 0 && (
        <p className="text-sm text-slate-500 py-4 text-center">
          {showDue ? 'Nothing due right now — great pace!' : 'Nothing repeated yet. Re-attempt a problem to build mastery.'}
        </p>
      )}
      <ul className="space-y-2 max-h-[320px] overflow-y-auto">
        {list.map((g) => (
          <li key={g.key}>
            <button
              onClick={() => onSelect(g)}
              className="w-full text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-violet-400/50 transition flex items-center justify-between gap-2"
              title="Show all attempts"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm truncate">{g.title}</span>
                  <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${diffBadge(g.difficulty)}`}>{g.difficulty}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {g.dates.length} day{g.dates.length !== 1 ? 's' : ''} · {g.dates.slice(0, 4).join(', ')}{g.dates.length > 4 ? '…' : ''}
                  {showDue && g.daysOverdue > 0 ? ` · ${g.daysOverdue}d overdue` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {g.url && (
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(ev) => ev.stopPropagation()}
                    className="p-1.5 rounded-lg text-sky-300 hover:bg-sky-500/10"
                    title="Open on LeetCode"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <span className="text-xs font-extrabold rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-200 px-2.5 py-1">×{g.count}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
