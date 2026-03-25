import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, ArrowRight, MapPin, Phone, Mail,
  ClipboardList, FileText, Users, CalendarCheck, CheckCircle,
  ChevronDown, ChevronUp, DollarSign, Award, HelpCircle,
  BookOpen,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const db = supabase as any

/* ── Timeline Steps ── */
const TIMELINE = [
  {
    step: 1,
    icon: ClipboardList,
    title: 'Submit Application',
    desc: 'Complete and submit the online application form through the AUF Admissions Portal. Ensure all required fields are filled out accurately.',
    detail: 'Applications are accepted year-round. Priority deadline: May 31 for 1st Semester.',
  },
  {
    step: 2,
    icon: FileText,
    title: 'Entrance Exam',
    desc: 'Take the AUF College Admission Test (ASUCAT) at the designated testing center on your scheduled date.',
    detail: 'Schedule: Every Saturday, 8:00 AM — AUF Main Campus, Testing Center Bldg.',
  },
  {
    step: 3,
    icon: Users,
    title: 'Interview',
    desc: 'Shortlisted applicants for select programs (Nursing, Engineering, Education) will be invited for a panel interview.',
    detail: 'Interview schedules are sent via email within 5 business days after exam results.',
  },
  {
    step: 4,
    icon: CalendarCheck,
    title: 'Results Release',
    desc: 'Admission results are released online through the portal. Successful applicants receive a digital admission letter.',
    detail: 'Results are typically released 2–3 weeks after the entrance exam.',
  },
  {
    step: 5,
    icon: CheckCircle,
    title: 'Enrollment',
    desc: 'Confirm your slot by completing enrollment, paying the reservation fee, and submitting original documents.',
    detail: 'Reservation fee: ₱1,500 (non-refundable, deducted from tuition).',
  },
]

/* ── Requirements ── */
const REQUIREMENTS = [
  {
    category: 'Freshman',
    color: '#3B82F6',
    items: [
      'Report Card (Form 138 / SF9)',
      'PSA-authenticated Birth Certificate',
      '2x2 ID photos (4 copies, white background)',
      'Certificate of Good Moral Character',
      'Completed AUF Application Form',
      'ASUCAT result slip',
    ],
  },
  {
    category: 'Transferee',
    color: '#22C55E',
    items: [
      'Transcript of Records (original)',
      'Honorable Dismissal / Transfer Credentials',
      'Certificate of Grades (latest semester)',
      'PSA Birth Certificate',
      '2x2 ID photos (4 copies)',
      'Course description for credit evaluation',
    ],
  },
  {
    category: 'Graduate Studies',
    color: '#8B5CF6',
    items: [
      'Bachelor\'s Diploma (certified true copy)',
      'Official Transcript of Records',
      'Two (2) Recommendation Letters',
      'Statement of Purpose / Research Interest',
      'Updated CV / Resume',
      'PSA Birth Certificate',
    ],
  },
]

/* ── Tuition Rates ── */
const TUITION = [
  { program: 'General Education / Liberal Arts', range: '₱15,000 – ₱18,000', note: 'per semester' },
  { program: 'Business Administration', range: '₱16,000 – ₱20,000', note: 'per semester' },
  { program: 'Information Technology / Computer Science', range: '₱18,000 – ₱22,000', note: 'per semester, includes lab fees' },
  { program: 'Engineering Programs', range: '₱20,000 – ₱25,000', note: 'per semester, includes lab fees' },
  { program: 'Nursing', range: '₱22,000 – ₱25,000', note: 'per semester, includes clinical fees' },
  { program: 'Graduate Studies', range: '₱12,000 – ₱18,000', note: 'per semester (thesis fees separate)' },
]

/* ── Scholarships ── */
const SCHOLARSHIPS = [
  { name: 'ASU Academic Scholarship', desc: 'Full tuition waiver for students with a GWA of 1.25 or higher. Renewable every semester with maintained standing.', color: '#C8A415' },
  { name: 'Student Assistant Program', desc: 'Part-time campus work (4 hrs/day) in exchange for 100% tuition coverage. Open to all year levels.', color: '#3B82F6' },
  { name: 'CHED Tulong-Dunong', desc: 'Government-funded scholarship for financially disadvantaged but academically capable students.', color: '#22C55E' },
  { name: 'Athletic Scholarship', desc: 'For varsity athletes who represent AUF in regional and national competitions. Covers tuition and allowance.', color: '#EC4899' },
]

/* ── FAQ ── */
const FAQ = [
  { q: 'When is the application deadline?', a: 'Applications are accepted year-round, but the priority deadline for 1st Semester AY 2026–2027 is May 31, 2026. Late applications may be considered on a space-available basis.' },
  { q: 'Is there an application fee?', a: 'The ASUCAT entrance exam fee is ₱300. There is no separate application fee for the online form.' },
  { q: 'Can I apply to multiple programs?', a: 'You may indicate a first-choice and a second-choice program on your application form. If you do not qualify for your first choice, you will automatically be considered for the second.' },
  { q: 'How do I check my admission status?', a: 'You can check your admission status through the AUF Admissions Portal using the reference number provided during application.' },
  { q: 'Are there dormitory or housing options?', a: 'ASU offers limited on-campus dormitory spaces on a first-come, first-served basis. Off-campus boarding houses are also available in the vicinity, with rates starting at ₱2,500/month.' },
  { q: 'Is the campus accessible by public transport?', a: 'Yes. AUF Main Campus is located along a major highway in Angeles City and is accessible via jeepneys, tricycles, and buses from Clark and surrounding areas.' },
]

/* ── Component ── */
export default function AdmissionsPage() {
  const [expandedReq, setExpandedReq] = useState<number | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const { data, error } = await db.from('programs').select('*')
        if (!error && data) setPrograms(data)
      } catch {
        // silently fail — grid will just be empty
      } finally {
        setLoadingPrograms(false)
      }
    }
    fetchPrograms()
  }, [])

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
              color: item.label === 'Admissions' ? '#C8A415' : '#CBD5E1',
              textDecoration: 'none', fontSize: 14, fontWeight: item.label === 'Admissions' ? 700 : 500,
              transition: 'color 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.color = '#C8A415')}
              onMouseOut={e => { if (item.label !== 'Admissions') e.currentTarget.style.color = '#CBD5E1' }}
            >{item.label}</Link>
          ))}
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #C8A415, #FFD280)', color: '#0077B6',
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            textDecoration: 'none', transition: 'transform 0.2s',
          }}>Student Portal</Link>
        </div>
      </nav>

      {/* === HERO BANNER === */}
      <section style={{
        position: 'relative', height: 360, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0077B6 0%, #1a2d5a 50%, #0077B6 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=600&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.2,
        }} />
        <div style={{
          position: 'relative', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 24px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 100, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.1)',
            marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#C8A415', letterSpacing: 1,
          }}>
            <GraduationCap size={14} /> AY 2026–2027
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 12,
          }}>Admissions</h1>
          <p style={{ color: '#94A3B8', fontSize: 18, maxWidth: 520, lineHeight: 1.6 }}>
            Join the AUF community. Begin your journey toward academic excellence and a brighter future.
          </p>
        </div>
      </section>

      {/* === ADMISSION TIMELINE === */}
      <section style={{ padding: '64px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Admission Timeline</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>Follow these steps to become an AUF student</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          {TIMELINE.map((item) => (
            <div key={item.step} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 14, padding: 24, textAlign: 'center', position: 'relative',
              transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#C8A415' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #C8A415, #FFD280)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#0077B6', fontWeight: 800, fontSize: 18,
              }}>
                {item.step}
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(245,166,35,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <item.icon size={20} color="#C8A415" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{item.desc}</p>
              <p style={{ fontSize: 11, color: '#C8A415', fontWeight: 600, lineHeight: 1.5 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === REQUIREMENTS CHECKLIST === */}
      <section style={{ padding: '48px 48px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Admission Requirements</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>Prepare the following documents based on your applicant type</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {REQUIREMENTS.map((req, i) => {
              const isExpanded = expandedReq === i
              return (
                <div key={req.category} style={{
                  background: 'var(--color-bg)', border: `1px solid ${isExpanded ? req.color : 'var(--color-border)'}`,
                  borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s',
                }}>
                  <button
                    onClick={() => setExpandedReq(isExpanded ? null : i)}
                    style={{
                      width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: 'inherit', textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `${req.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FileText size={18} color={req.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{req.category}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{req.items.length} documents required</div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} color="var(--color-text-secondary)" /> : <ChevronDown size={18} color="var(--color-text-secondary)" />}
                  </button>
                  <div style={{
                    maxHeight: isExpanded ? 400 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}>
                    <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {req.items.map((item, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 8,
                          background: `${req.color}08`,
                          fontSize: 13,
                        }}>
                          <CheckCircle size={14} color={req.color} style={{ flexShrink: 0 }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* === PROGRAMS AVAILABLE (from Supabase) === */}
      <section style={{ padding: '64px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Programs Available</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>Explore our degree programs open for admission</p>
        </div>
        {loadingPrograms ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Loading programs...
          </div>
        ) : programs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {programs.map((prog: any) => (
              <div key={prog.id} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 14, padding: 24, transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#C8A415' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(245,166,35,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <BookOpen size={20} color="#C8A415" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#C8A415', marginBottom: 4 }}>
                  {prog.code || prog.abbreviation || ''}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  {prog.name || prog.title || prog.program_name || 'Untitled Program'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {prog.department || prog.college || prog.description || ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: 48,
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 14, color: 'var(--color-text-secondary)', fontSize: 14,
          }}>
            No programs found. Please check back later.
          </div>
        )}
      </section>

      {/* === TUITION INFORMATION === */}
      <section style={{ padding: '48px 48px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Tuition & Fees</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>
              Estimated tuition rates per semester (AY 2026–2027). Actual fees may vary.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {TUITION.map((t, i) => (
              <div key={i} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: 24, transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#C8A415' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(245,166,35,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <DollarSign size={18} color="#C8A415" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{t.program}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#C8A415', marginBottom: 4 }}>{t.range}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{t.note}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 24, padding: '16px 24px', borderRadius: 10,
            background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
            fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, textAlign: 'center',
          }}>
            Miscellaneous fees (ID, laboratory, library, etc.) are additional. Payment plans and installment options are available at the Cashier's Office.
          </div>
        </div>
      </section>

      {/* === SCHOLARSHIPS === */}
      <section style={{ padding: '64px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Scholarships & Financial Aid</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>
            We believe financial limitations should never hinder quality education
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {SCHOLARSHIPS.map((s, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 14, padding: 24, display: 'flex', gap: 16, transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = s.color }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Award size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === FAQ ACCORDION === */}
      <section style={{ padding: '48px 48px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>
              Common questions about the admissions process
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ.map((item, i) => {
              const isOpen = expandedFaq === i
              return (
                <div key={i} style={{
                  background: 'var(--color-bg)', border: `1px solid ${isOpen ? '#C8A415' : 'var(--color-border)'}`,
                  borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s',
                }}>
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : i)}
                    style={{
                      width: '100%', padding: '18px 24px', background: 'none', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: 'inherit', textAlign: 'left', gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <HelpCircle size={18} color={isOpen ? '#C8A415' : 'var(--color-text-secondary)'} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{item.q}</span>
                    </div>
                    {isOpen ? <ChevronUp size={18} color="#C8A415" /> : <ChevronDown size={18} color="var(--color-text-secondary)" />}
                  </button>
                  <div style={{
                    maxHeight: isOpen ? 200 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}>
                    <div style={{
                      padding: '0 24px 18px 54px',
                      fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7,
                    }}>
                      {item.a}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* === CTA BANNER === */}
      <section style={{ padding: '64px 48px', background: 'linear-gradient(135deg, #0077B6, #1a2d5a)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 100, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.1)',
            marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#C8A415', letterSpacing: 1,
          }}>
            <GraduationCap size={14} /> START YOUR JOURNEY
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12,
          }}>
            Ready to <span style={{ color: '#C8A415' }}>Apply</span>?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Take the first step toward your future. Create an account to start your application for AY 2026–2027. Our admissions team is here to help you every step of the way.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/login" style={{
              background: 'linear-gradient(135deg, #C8A415, #FFD280)', color: '#0077B6',
              padding: '14px 36px', borderRadius: 10, fontSize: 16, fontWeight: 700,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(245,166,35,0.3)',
            }}>Apply Now <ArrowRight size={18} /></Link>
            <a href="mailto:admissions@asu.edu.ph" style={{
              border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
              padding: '14px 36px', borderRadius: 10, fontSize: 16, fontWeight: 600,
              textDecoration: 'none',
            }}>Contact Us</a>
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} /> (045) 888-1234
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} /> admissions@asu.edu.ph
            </div>
          </div>
        </div>
      </section>

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
