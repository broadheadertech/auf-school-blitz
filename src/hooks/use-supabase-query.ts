/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

async function getStudentId(userId: string): Promise<string | null> {
  const { data } = await (supabase.from('students').select('id').eq('user_id', userId).maybeSingle() as any)
  return data?.id ?? null
}

async function getFacultyId(userId: string): Promise<string | null> {
  const { data } = await (supabase.from('faculty').select('id').eq('user_id', userId).maybeSingle() as any)
  return data?.id ?? null
}

export function useStudentGrades() {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)

  useEffect(() => {
    if (!user || role !== 'student') { setLoading(false); return }
    (async () => {
      const studentId = await getStudentId(user.id)
      if (!studentId) { setLoading(false); return }
      const { data } = await (supabase.from('grades').select('*, subjects(code, name, units)').eq('student_id', studentId).order('semester') as any)
      if (data) {
        setGrades(data.map((g: any) => ({ ...g, subject: g.subjects ?? { code: '?', name: '?', units: 0 } })))
      }
      setLoading(false)
    })()
  }, [user, role])

  return { grades, loading }
}

export function useFacultySections() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)

  useEffect(() => {
    if (!user || role !== 'faculty') { setLoading(false); return }
    (async () => {
      const facultyId = await getFacultyId(user.id)
      if (!facultyId) { setLoading(false); return }
      const { data } = await (supabase.from('sections').select('*, subjects(code, name, units)').eq('faculty_id', facultyId).order('semester') as any)
      if (data) setSections(data)
      setLoading(false)
    })()
  }, [user, role])

  return { sections, loading }
}

export function useNews() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('news_articles').select('*').order('published_at', { ascending: false }) as any)
      if (data) setArticles(data)
      setLoading(false)
    })()
  }, [])

  return { articles, loading }
}

export function useEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('events').select('*').order('start_date', { ascending: true }) as any)
      if (data) setEvents(data)
      setLoading(false)
    })()
  }, [])

  return { events, loading }
}

export function useStudentPayments() {
  const [fees, setFees] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    (async () => {
      const studentId = await getStudentId(user.id)
      if (!studentId) { setLoading(false); return }
      const [feesRes, paymentsRes] = await Promise.all([
        (supabase.from('fees').select('*').eq('student_id', studentId) as any),
        (supabase.from('payments').select('*').eq('student_id', studentId).order('created_at', { ascending: false }) as any),
      ])
      if (feesRes.data) setFees(feesRes.data)
      if (paymentsRes.data) setPayments(paymentsRes.data)
      setLoading(false)
    })()
  }, [user])

  return { fees, payments, loading }
}

/**
 * Fetch available sections for enrollment from Supabase.
 */
export function useSections() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('sections').select('*, subjects(code, name, units)').eq('status', 'open').order('section_code') as any)
      if (data) {
        setSections(data.map((s: any) => ({
          ...s,
          subject: s.subjects ?? { code: '?', name: '?', units: 0 },
        })))
      }
      setLoading(false)
    })()
  }, [])

  return { sections, loading }
}

/**
 * Fetch academic settings from Supabase.
 */
export function useAcademicSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('academic_settings').select('key, value') as any)
      if (data) {
        const map: Record<string, string> = {}
        for (const s of data) map[s.key] = s.value
        setSettings(map)
      }
      setLoading(false)
    })()
  }, [])

  return { settings, loading }
}
