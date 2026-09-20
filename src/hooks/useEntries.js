import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc
} from 'firebase/firestore'
import { db } from '../firebase-config'

/**
 * Entries hook — reads/writes Cloud Firestore at users/{uid}/entries.
 * Entry: { id, title, slug, url, difficulty, date (YYYY-MM-DD), notes, createdAt }
 */
export function useEntries(user) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    const col = collection(db, 'users', user.uid, 'entries')
    const q = query(col, orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [user])

  const addEntry = useCallback(async (data) => {
    const col = collection(db, 'users', user.uid, 'entries')
    await addDoc(col, { ...data, createdAt: new Date().toISOString(), serverTs: serverTimestamp() })
  }, [user])

  const removeEntry = useCallback(async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'entries', id))
  }, [user])

  const updateEntry = useCallback(async (id, patch) => {
    await updateDoc(doc(db, 'users', user.uid, 'entries', id), patch)
  }, [user])

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [entries]
  )

  return { entries: sorted, loading, addEntry, removeEntry, updateEntry }
}