import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase-config'

const LS_KEY = 'lc-tracker-demo-entries'

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function seedIfEmpty() {
  const existing = loadLocal()
  if (existing.length > 0) return existing
  const today = new Date()
  const iso = (offset) => {
    const d = new Date(today)
    d.setDate(d.getDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const seed = [
    { id: 'seed-1', title: 'Two Sum', slug: 'two-sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', date: iso(0), notes: 'Hash map for O(n).', createdAt: new Date().toISOString() },
    { id: 'seed-2', title: 'Two Sum', slug: 'two-sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', date: iso(2), notes: 'Revised — edge cases.', createdAt: new Date().toISOString() },
    { id: 'seed-3', title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium', date: iso(1), notes: 'Sliding window + set.', createdAt: new Date().toISOString() }
  ]
  localStorage.setItem(LS_KEY, JSON.stringify(seed))
  return seed
}

/**
 * Entries hook — Firestore when Firebase is configured, else localStorage demo store.
 * Entry: { id, title, slug, url, difficulty, date (YYYY-MM-DD), notes, createdAt }
 */
export function useEntries(user, demoMode) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const useLocal = !isFirebaseConfigured || demoMode || !user || user.uid === 'demo-local'

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }
    if (useLocal) {
      setEntries(seedIfEmpty())
      setLoading(false)
      const onStorage = (e) => {
        if (e.key === LS_KEY) setEntries(loadLocal())
      }
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    }
    setLoading(true)
    const col = collection(db, 'users', user.uid, 'entries')
    const q = query(col, orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [user, useLocal])

  const addEntry = useCallback(async (data) => {
    if (useLocal) {
      const row = { ...data, id: `local-${Date.now()}`, createdAt: new Date().toISOString() }
      const next = [row, ...loadLocal()]
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      setEntries(next)
      return row
    }
    const col = collection(db, 'users', user.uid, 'entries')
    await addDoc(col, { ...data, createdAt: new Date().toISOString(), serverTs: serverTimestamp() })
  }, [useLocal, user])

  const removeEntry = useCallback(async (id) => {
    if (useLocal) {
      const next = loadLocal().filter((e) => e.id !== id)
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      setEntries(next)
      return
    }
    await deleteDoc(doc(db, 'users', user.uid, 'entries', id))
  }, [useLocal, user])

  const updateEntry = useCallback(async (id, patch) => {
    if (useLocal) {
      const next = loadLocal().map((e) => (e.id === id ? { ...e, ...patch } : e))
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      setEntries(next)
      return
    }
    await updateDoc(doc(db, 'users', user.uid, 'entries', id), patch)
  }, [useLocal, user])

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [entries]
  )

  return { entries: sorted, loading, addEntry, removeEntry, updateEntry, isLocal: useLocal }
}
