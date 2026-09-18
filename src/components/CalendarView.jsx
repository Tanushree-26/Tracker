import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { groupByDate } from '../lib/stats'

function monthCells(year, month) {
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

const isoOf = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function intensity(count) {
  if (!count) return 'bg-slate-800/60 border-slate-800'
  if (count === 1) return 'bg-emerald-900/70 border-emerald-700/50'
  if (count === 2) return 'bg-emerald-700/70 border-emerald-600/50'
  if (count === 3) return 'bg-emerald-500/70 border-emerald-400/50'
  return 'bg-amber-400/80 border-amber-300/60'
}

export default function CalendarView({ entries, selectedDate, onSelectDate }) {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const byDate = useMemo(() => groupByDate(entries), [entries])
  const cells = useMemo(() => monthCells(ym.y, ym.m), [ym])

  const title = new Date(ym.y, ym.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const shift = (dir) => {
    const d = new Date(ym.y, ym.m + dir, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="font-bold">Calendar</h2>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 shrink-0"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs sm:text-sm font-semibold min-w-[7rem] sm:min-w-[9rem] text-center truncate">{title}</span>
          <button onClick={() => shift(1)} aria-label="Next month" className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 shrink-0"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[9px] sm:text-[11px] font-semibold text-slate-500 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1 truncate">
            <span className="hidden min-[420px]:inline">{d}</span>
            <span className="min-[420px]:hidden">{d[0]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const iso = isoOf(d)
          const count = (byDate[iso] || []).length
          const selected = selectedDate === iso
          return (
            <button
              key={i} onClick={() => onSelectDate(selected ? null : iso)}
              title={`${iso} — ${count} solved`}
              className={`min-w-0 aspect-square overflow-hidden p-0.5 rounded-lg border text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-0 leading-tight transition hover:ring-1 hover:ring-amber-400/50 ${intensity(count)} ${selected ? 'ring-2 ring-amber-400' : ''}`}
            >
              <span>{d.getDate()}</span>
              {count > 0 && <span className="text-[9px] sm:text-[10px] font-bold opacity-90">{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((n) => <span key={n} className={`w-3.5 h-3.5 rounded border ${intensity(n)}`} />)}
        <span>More</span>
      </div>
    </div>
  )
}
