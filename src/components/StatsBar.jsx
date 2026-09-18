import { CalendarCheck2, Trophy, Repeat2, Flame } from 'lucide-react'
import { todayISO } from '../lib/leetcode'

export function diffBadge(d) {
  if (d === 'Easy') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  if (d === 'Hard') return 'bg-red-500/15 text-red-300 border-red-500/30'
  return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
}

export default function StatsBar({ entries, uniqueCount, repeatGroups, streak }) {
  const today = todayISO()
  const doneToday = entries.filter((e) => e.date === today)

  const cards = [
    {
      icon: <CalendarCheck2 className="w-5 h-5 text-sky-300" />,
      label: 'Done Today', value: doneToday.length,
      sub: doneToday.length ? doneToday.slice(0, 3).map((e) => e.title).join(' · ') + (doneToday.length > 3 ? ` +${doneToday.length - 3} more` : '') : 'No solves yet today'
    },
    {
      icon: <Trophy className="w-5 h-5 text-amber-300" />,
      label: 'Total Solved', value: uniqueCount,
      sub: 'Unique questions'
    },
    {
      icon: <Repeat2 className="w-5 h-5 text-violet-300" />,
      label: 'Repeated', value: repeatGroups.length,
      sub: repeatGroups.length ? 'Questions solved 2+ times' : 'No repeats yet — revise!'
    },
    {
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      label: 'Current Streak', value: `${streak}d`,
      sub: streak > 0 ? 'Consecutive active days' : 'Solve one today to start'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((c) => (
        <div key={c.label} className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="shrink-0">{c.icon}</span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-semibold truncate">{c.label}</span>
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold">{c.value}</div>
          <div className="mt-0.5 text-[11px] sm:text-xs text-slate-400 truncate" title={c.sub}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
