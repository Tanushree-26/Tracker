import { Repeat2, ExternalLink } from 'lucide-react'
import { diffBadge } from './StatsBar'

export default function RepeatedSection({ groups, onSelect }) {
  const repeats = groups.filter((g) => g.count > 1)
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1">
        <Repeat2 className="w-5 h-5 text-violet-300" />
        <h2 className="font-bold">Repeated questions</h2>
        <span className="text-xs text-slate-400">({repeats.length})</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Questions attempted more than once — spaced repetition working.</p>
      {repeats.length === 0 && (
        <p className="text-sm text-slate-500 py-4 text-center">Nothing repeated yet. Re-attempt a problem to build mastery.</p>
      )}
      <ul className="space-y-2 max-h-[320px] overflow-y-auto">
        {repeats.map((g) => (
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
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {g.url && (
                  <span
                    role="link" tabIndex={0}
                    onClick={(ev) => { ev.stopPropagation(); window.open(g.url, '_blank', 'noreferrer') }}
                    onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.stopPropagation(); window.open(g.url, '_blank', 'noreferrer') } }}
                    className="p-1.5 rounded-lg text-sky-300 hover:bg-sky-500/10"
                    title="Open on LeetCode"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </span>
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
