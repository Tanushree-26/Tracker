import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase-config'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const logout = async () => {
    setError('')
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

  return { user, loading, error, loginGoogle, loginEmail, logout }
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