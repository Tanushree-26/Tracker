import { useState } from 'react'
import { Chrome, LogIn, UserPlus, Code2 } from 'lucide-react'

export default function AuthScreen({ auth }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setBusy(true)
    try {
      await auth.loginEmail(email.trim(), password, mode)
    } catch { /* error surfaced via auth.error */ }
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
            <Code2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">LeetCode Tracker</h1>
            <p className="text-xs text-slate-400">Private problem log · streaks · repeats</p>
          </div>
        </div>

        {auth.error && (
          <div className="mt-4 text-xs rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 p-3">{auth.error}</div>
        )}

        <button
          onClick={auth.loginGoogle}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 font-semibold py-2.5 hover:bg-slate-200 transition text-sm"
        >
          <Chrome className="w-4 h-4" /> Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4 text-[11px] text-slate-500">
          <div className="h-px flex-1 bg-slate-800" /> OR WITH EMAIL <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg py-1.5 font-medium capitalize transition ${mode === m ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email" required placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm placeholder:text-slate-600 focus:border-amber-400/60"
          />
          <input
            type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm placeholder:text-slate-600 focus:border-amber-400/60"
          />
          <button
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 text-slate-950 font-bold py-2.5 text-sm hover:bg-amber-300 disabled:opacity-60 transition"
          >
            {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500 text-center">Your data stays private to your account.</p>
      </div>
    </div>
  )
}