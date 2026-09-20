import { useMemo, useState } from 'react'
import { Code2, LogOut, Search, Cloud } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useEntries } from './hooks/useEntries'
import { groupByQuestion, calcStreak, difficultyCount } from './lib/stats'
import AuthScreen from './components/AuthScreen'
import EntryForm from './components/EntryForm'
import StatsBar from './components/StatsBar'
import CalendarView from './components/CalendarView'
import EntryList from './components/EntryList'
import RepeatedSection from './components/RepeatedSection'

export default function App() {
  const auth = useAuth()
  const { entries, loading, addEntry, removeEntry } = useEntries(auth.user)
  const [selectedDate, setSelectedDate] = useState(null)
  const [questionFilter, setQuestionFilter] = useState(null)
  const [search, setSearch] = useState('')

  const groups = useMemo(() => groupByQuestion(entries), [entries])
  const streak = useMemo(() => calcStreak(entries), [entries])
  const diffs = useMemo(() => difficultyCount(entries), [entries])
  const repeats = useMemo(() => groups.filter((g) => g.count > 1), [groups])

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Code2 className="w-5 h-5 animate-pulse text-amber-400" /> Loading LeetCode Tracker…
        </div>
      </div>
    )
  }

  if (!auth.user) return <AuthScreen auth={auth} />

  const clearFilters = () => { setSelectedDate(null); setQuestionFilter(null) }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 shrink-0">
              <Code2 className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold leading-tight truncate">LeetCode Tracker</h1>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <Cloud className="w-3 h-3 text-sky-300" /> {auth.user.email || auth.user.displayName} · cloud sync
              </p>
            </div>
          </div>
          <button
            onClick={auth.logout}
            className="flex items-center gap-1.5 text-xs font-semibold border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-300 hover:bg-slate-800 transition shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden min-[420px]:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-4">
        <StatsBar entries={entries} uniqueCount={groups.length} repeatGroups={repeats} streak={streak} />

        {/* Difficulty split */}
        <div className="flex gap-2 text-xs font-semibold flex-wrap">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-1">Easy · {diffs.Easy}</span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 px-3 py-1">Medium · {diffs.Medium}</span>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 text-red-300 px-3 py-1">Hard · {diffs.Hard}</span>
          <span className="rounded-full border border-slate-700 text-slate-400 px-3 py-1">{entries.length} total attempts</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, slug, or notes…"
            className="w-full rounded-xl bg-slate-900/70 border border-slate-800 pl-9 pr-3 py-2.5 text-sm placeholder:text-slate-600 focus:border-amber-400/60"
          />
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 text-center py-10">Loading entries…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            <div className="lg:col-span-2 space-y-4 min-w-0">
              <EntryForm onAdd={addEntry} />
              <RepeatedSection
                groups={groups}
                entries={entries}
                onSelect={(g) => { setQuestionFilter(g); setSelectedDate(null) }}
              />
            </div>
            <div className="lg:col-span-3 space-y-4 min-w-0">
              <CalendarView
                entries={entries}
                selectedDate={selectedDate}
                onSelectDate={(d) => { setSelectedDate(d); setQuestionFilter(null) }}
              />
              <EntryList
                entries={entries}
                onDelete={removeEntry}
                filterDate={selectedDate}
                questionFilter={questionFilter}
                onClearFilter={clearFilters}
                search={search}
              />
            </div>
          </div>
        )}

        <footer className="text-center text-[11px] text-slate-600 pt-4 pb-8">
          LeetCode Tracker PWA · data persisted in Cloud Firestore · installable from browser menu
        </footer>
      </main>
    </div>
  )
}
