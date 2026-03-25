import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, BookOpen, ChevronDown, ChevronUp, Search,
  MapPin, Phone, Mail, Monitor, Stethoscope,
  Briefcase, Palette, Cpu, Clock, BookMarked, Layers,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const db = supabase as any

/* ── college definitions (hardcoded names, icon, color) ── */
const COLLEGES = [
  { name: 'College of Computing', icon: Monitor, color: '#3B82F6', codes: ['BSCS', 'BSIT'] },
  { name: 'College of Nursing', icon: Stethoscope, color: '#22C55E', codes: ['BSN'] },
  { name: 'College of Business', icon: Briefcase, color: '#F59E0B', codes: ['BSBA'] },
  { name: 'College of Education', icon: Palette, color: '#EC4899', codes: ['BSED'] },
  { name: 'College of Engineering', icon: Cpu, color: '#8B5CF6', codes: ['BSECE'] },
]

/* ── types ── */
interface Program {
  id: string
  code: string
  name: string
  total_units: number
  duration_years: number
}

interface Subject {
  id: string
  code: string
  name: string
  units: number
  type: string
}

interface CurriculumEntry {
  id: string
  program_id: string
  subject_id: string
  year_level: number
  semester: string
  subject_type: string
  subjects: { code: string; name: string; units: number; type: string } | null
}

/* ── badge color by subject type ── */
const DEFAULT_BADGE = { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' }
const typeBadge: Record<string, { bg: string; text: string }> = {
  core: DEFAULT_BADGE,
  ge: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  elective: { bg: 'rgba(245,166,35,0.15)', text: '#C8A415' },
}

export default function AcademicsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [curriculumMap, setCurriculumMap] = useState<CurriculumEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCollege, setActiveCollege] = useState<string>(COLLEGES[0]!.name)

  /* ── fetch data ── */
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [pRes, sRes, cRes] = await Promise.all([
        db.from('programs').select('id, code, name, total_units, duration_years').order('code'),
        db.from('subjects').select('id, code, name, units, type').order('code'),
        db.from('curriculum_map').select('id, program_id, subject_id, year_level, semester, subject_type, subjects(code, name, units, type)').order('year_level').order('semester'),
      ])
      if (pRes.data) setPrograms(pRes.data)
      if (sRes.data) setSubjects(sRes.data)
      if (cRes.data) setCurriculumMap(cRes.data)
      setLoading(false)
    }
    load()
  }, [])

  /* ── helpers ── */
  const programsForCollege = (codes: string[]) =>
    programs.filter(p => codes.includes(p.code))

  const curriculumForProgram = (programId: string) =>
    curriculumMap.filter(c => c.program_id === programId)

  const groupByYearSemester = (entries: CurriculumEntry[]) => {
    const grouped: Record<string, CurriculumEntry[]> = {}
    entries.forEach(e => {
      const key = `Year ${e.year_level} — ${e.semester}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(e)
    })
    return grouped
  }

  const filteredSubjects = subjects.filter(s =>
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentCollege = COLLEGES.find(c => c.name === activeCollege) ?? COLLEGES[0]!

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>

      {/* === NAVBAR === */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0077B6', color: '#fff',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff' }}>
          <GraduationCap size={28} color="#C8A415" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
            Angeles University Foundation
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Academics', href: '/academics' },
            { label: 'Admissions', href: '/admissions' },
            { label: 'News', href: '/public/news' },
          ].map(item => (
            <Link key={item.label} to={item.href} style={{
              color: item.label === 'Academics' ? '#C8A415' : '#CBD5E1',
              textDecoration: 'none', fontSize: 14, fontWeight: item.label === 'Academics' ? 700 : 500,
              transition: 'color 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.color = '#C8A415')}
              onMouseOut={e => { if (item.label !== 'Academics') e.currentTarget.style.color = '#CBD5E1' }}
            >{item.label}</Link>
          ))}
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #C8A415, #FFD280)', color: '#0077B6',
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            textDecoration: 'none', transition: 'transform 0.2s',
          }}>Student Portal</Link>
        </div>
      </nav>

      {/* === HERO === */}
      <section style={{
        position: 'relative', height: 340, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0077B6 0%, #1a2d5a 60%, #0077B6 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 24px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle at 20% 80%, #C8A415 1px, transparent 1px), radial-gradient(circle at 80% 20%, #C8A415 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          borderRadius: 100, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.1)',
          marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#C8A415', letterSpacing: 1,
        }}>
          <BookOpen size={14} /> ACADEMICS
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 16,
        }}>Academic Programs</h1>
        <p style={{ color: '#94A3B8', fontSize: 17, maxWidth: 600, lineHeight: 1.6 }}>
          Explore degree programs across five colleges, review curriculum maps, and browse our complete subject directory.
        </p>
      </section>

      {/* === LOADING STATE === */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid var(--color-border)',
            borderTopColor: '#C8A415', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading academic data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* === COLLEGE TABS === */}
          <section style={{ padding: '48px 48px 0', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Our Colleges</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>
                {programs.length} degree programs across {COLLEGES.length} colleges
              </p>
            </div>

            {/* College tab buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
              {COLLEGES.map(college => {
                const isActive = activeCollege === college.name
                return (
                  <button
                    key={college.name}
                    onClick={() => { setActiveCollege(college.name); setExpandedProgram(null) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px', borderRadius: 10,
                      border: isActive ? `2px solid ${college.color}` : '2px solid var(--color-border)',
                      background: isActive ? `${college.color}12` : 'var(--color-surface)',
                      color: isActive ? college.color : 'var(--color-text-primary)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    <college.icon size={16} />
                    {college.name}
                  </button>
                )
              })}
            </div>

            {/* College card + programs */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              {/* College header */}
              <div style={{
                background: `linear-gradient(135deg, ${currentCollege.color}18, ${currentCollege.color}08)`,
                padding: '28px 32px', borderBottom: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${currentCollege.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <currentCollege.icon size={24} color={currentCollege.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>{currentCollege.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {programsForCollege(currentCollege.codes).length} program{programsForCollege(currentCollege.codes).length !== 1 ? 's' : ''} offered
                  </p>
                </div>
              </div>

              {/* Program list */}
              <div style={{ padding: '16px 0' }}>
                {programsForCollege(currentCollege.codes).length === 0 && (
                  <p style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--color-text-secondary)', fontSize: 14 }}>
                    No programs found in the database for this college.
                  </p>
                )}
                {programsForCollege(currentCollege.codes).map(prog => {
                  const isExpanded = expandedProgram === prog.id
                  const curriculum = curriculumForProgram(prog.id)
                  const grouped = groupByYearSemester(curriculum)

                  return (
                    <div key={prog.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {/* Program row */}
                      <button
                        onClick={() => setExpandedProgram(isExpanded ? null : prog.id)}
                        style={{
                          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                          padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          color: 'inherit', textAlign: 'left', transition: 'background 0.2s',
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--color-bg)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'none')}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: currentCollege.color,
                              background: `${currentCollege.color}15`, padding: '2px 8px', borderRadius: 4,
                            }}>{prog.code}</span>
                            <span style={{ fontSize: 16, fontWeight: 700 }}>{prog.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              <BookMarked size={13} /> {prog.total_units} units
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              <Clock size={13} /> {prog.duration_years} year{prog.duration_years !== 1 ? 's' : ''}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              <Layers size={13} /> {curriculum.length} subjects mapped
                            </span>
                          </div>
                        </div>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: isExpanded ? `${currentCollege.color}15` : 'var(--color-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}>
                          {isExpanded ? <ChevronUp size={16} color={currentCollege.color} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {/* Curriculum (expanded) */}
                      {isExpanded && (
                        <div style={{ padding: '0 32px 24px' }}>
                          {Object.keys(grouped).length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', padding: '16px 0' }}>
                              No curriculum data available for this program yet.
                            </p>
                          ) : (
                            Object.entries(grouped).map(([key, entries]) => (
                              <div key={key} style={{ marginBottom: 20 }}>
                                <h4 style={{
                                  fontSize: 13, fontWeight: 700, color: currentCollege.color,
                                  marginBottom: 10, paddingBottom: 6,
                                  borderBottom: `2px solid ${currentCollege.color}30`,
                                }}>{key}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                                  {entries.map(entry => {
                                    const subj = entry.subjects
                                    const badge = typeBadge[entry.subject_type] || DEFAULT_BADGE
                                    return (
                                      <div key={entry.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 14px', borderRadius: 8,
                                        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                      }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                              {subj?.code || '—'}
                                            </span>
                                            <span style={{
                                              fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 3,
                                              background: badge.bg, color: badge.text, textTransform: 'uppercase',
                                            }}>{entry.subject_type}</span>
                                          </div>
                                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {subj?.name || 'Unknown Subject'}
                                          </div>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                                          {subj?.units || 0}u
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* === SUBJECTS DIRECTORY === */}
          <section style={{ padding: '56px 48px 64px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Subjects Directory</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>
                  Browse all {subjects.length} subjects offered at the university
                </p>
              </div>
              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 10, padding: '8px 14px', width: 300,
              }}>
                <Search size={16} color="var(--color-text-secondary)" />
                <input
                  type="text"
                  placeholder="Search by code, name, or type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: 13, color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 80px 100px',
                padding: '12px 24px', background: '#0077B6', color: '#94A3B8',
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>
                <span>Code</span>
                <span>Subject Name</span>
                <span style={{ textAlign: 'center' }}>Units</span>
                <span style={{ textAlign: 'center' }}>Type</span>
              </div>

              {/* Rows */}
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {filteredSubjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--color-text-secondary)', fontSize: 14 }}>
                    {searchQuery ? `No subjects matching "${searchQuery}"` : 'No subjects found.'}
                  </div>
                ) : (
                  filteredSubjects.map((subj, i) => {
                    const badge = typeBadge[subj.type] || DEFAULT_BADGE
                    return (
                      <div key={subj.id} style={{
                        display: 'grid', gridTemplateColumns: '120px 1fr 80px 100px',
                        padding: '12px 24px', alignItems: 'center',
                        borderBottom: '1px solid var(--color-border)',
                        background: i % 2 === 0 ? 'transparent' : 'var(--color-bg)',
                        transition: 'background 0.15s',
                      }}
                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(245,166,35,0.04)')}
                        onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--color-bg)')}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>{subj.code}</span>
                        <span style={{ fontSize: 13 }}>{subj.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{subj.units}</span>
                        <span style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                            background: badge.bg, color: badge.text, textTransform: 'uppercase',
                          }}>{subj.type}</span>
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* === FOOTER === */}
      <footer style={{
        background: '#0077B6', color: '#94A3B8', padding: '48px 48px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <GraduationCap size={24} color="#C8A415" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                Angeles University Foundation
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 300 }}>
              Empowering students with quality education, research excellence, and community service since 1985.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <MapPin size={14} /> Angeles City, Pampanga, Philippines
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Phone size={14} /> (045) 888-1234
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Mail size={14} /> info@asu.edu.ph
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14, letterSpacing: 0.5 }}>ACADEMICS</div>
            {['Colleges', 'Graduate School', 'Research', 'Library', 'Academic Calendar'].map(link => (
              <a key={link} href="#" style={{ display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: 13, marginBottom: 10 }}>{link}</a>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14, letterSpacing: 0.5 }}>STUDENTS</div>
            {['Student Portal', 'Enrollment', 'Scholarships', 'Student Handbook', 'Organizations'].map(link => (
              <a key={link} href="#" style={{ display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: 13, marginBottom: 10 }}>{link}</a>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14, letterSpacing: 0.5 }}>CONNECT</div>
            {['Facebook', 'Twitter/X', 'Instagram', 'YouTube', 'LinkedIn'].map(link => (
              <a key={link} href="#" style={{ display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: 13, marginBottom: 10 }}>{link}</a>
            ))}
          </div>
        </div>
        <div style={{
          maxWidth: 1200, margin: '32px auto 0', paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', fontSize: 12,
        }}>
          <span>&copy; 2026 Angeles University Foundation. All rights reserved.</span>
          <span>Privacy Policy &middot; Terms of Service</span>
        </div>
      </footer>
    </div>
  )
}
