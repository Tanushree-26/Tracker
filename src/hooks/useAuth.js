import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../firebase-config'

export const DEMO_USER = { uid: 'demo-local', email: 'demo@local', displayName: 'Demo User' }
const DEMO_KEY = 'lc-tracker-demo-session'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      try {
        const saved = localStorage.getItem(DEMO_KEY)
        if (saved) {
          setUser(JSON.parse(saved))
          setDemoMode(true)
        }
      } catch { /* ignore */ }
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setDemoMode(false)
      setLoading(false)
    })
    return unsub
  }, [])

  const loginDemo = () => {
    localStorage.setItem(DEMO_KEY, JSON.stringify(DEMO_USER))
    setUser(DEMO_USER)
    setDemoMode(true)
  }

  const logout = async () => {
    setError('')
    if (demoMode || !isFirebaseConfigured) {
      localStorage.removeItem(DEMO_KEY)
      setUser(null)
      setDemoMode(false)
      return
    }
    await signOut(auth)
  }

  const loginGoogle = async () => {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      setError(friendlyAuthError(e))
    }
  }

  const loginEmail = async (email, password, mode = 'signin') => {
    setError('')
    try {
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email, password)
      else await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      setError(friendlyAuthError(e))
      throw e
    }
  }

  return { user, loading, error, demoMode, loginGoogle, loginEmail, loginDemo, logout }
}

function friendlyAuthError(e) {
  const code = e?.code || ''
  if (code.includes('popup-closed')) return 'Sign-in popup closed. Try again.'
  if (code.includes('unauthorized-domain')) return 'Domain not authorized in Firebase Auth settings.'
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Invalid email or password.'
  if (code.includes('email-already-in-use')) return 'Email already registered — sign in instead.'
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.'
  if (code.includes('invalid-email')) return 'Enter a valid email address.'
  return e?.message || 'Authentication failed.'
}
