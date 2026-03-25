import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Newspaper, Calendar, MapPin, Phone, Mail,
  Search, X, ChevronRight, Clock, User,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const db = supabase as any

/* ── colour helpers ── */
const catColors: Record<string, string> = {
  Academic: '#3B82F6',
  Administrative: '#6366F1',
  'Campus Life': '#22C55E',
  Sports: '#F59E0B',
  Research: '#8B5CF6',
}

const eventCatColors: Record<string, string> = {
  academic: '#3B82F6',
  sports: '#F59E0B',
  cultural: '#EC4899',
  organization: '#22C55E',
  administrative: '#6366F1',
}

const CATEGORIES = ['All', 'Academic', 'Administrative', 'Campus Life', 'Sports', 'Research']

/* ── types ── */
interface Article {
  id: string
  title: string
  excerpt: string
  body: string
  category: string
  thumbnail_url: string | null
  author_name: string
  is_featured: boolean
  published_at: string
}

interface Event {
  id: string
  title: string
  description: string
  category: string
  venue: string
  start_date: string
  end_date: string
}

/* ── helpers ── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDateShort(iso: string) {
  const d = new Date(iso)
  return { month: d.toLocaleDateString('en-US', { month: 'short' }), day: String(d.getDate()) }
}

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop'

/* ═══════════════════════════════════════════════════ */
export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /* ── fetch data ── */
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [newsRes, eventsRes] = await Promise.all([
        db.from('news_articles').select('*').order('published_at', { ascending: false }),
        db.from('events').select('*').order('start_date', { ascending: true }).gte('end_date', new Date().toISOString()),
      ])
      if (newsRes.data) setArticles(newsRes.data)
      if (eventsRes.data) setEvents(eventsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  /* ── derived data ── */
  const featured = articles.find(a => a.is_featured) || null
  const filtered = articles.filter(a => {
    if (expandedId) return a.id === expandedId
    const matchesCat = activeCategory === 'All' || a.category === activeCategory
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch && (!featured || a.id !== featured.id)
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>

      {/* ═══ NAVBAR ═══ */}
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
            { label: 'Home', to: '/' },
            { label: 'About', to: '/about' },
            { label: 'Academics', to: '/academics' },
            { label: 'Admissions', to: '/admissions' },
            { label: 'News', to: '/public/news' },
          ].map(item => (
            <Link key={item.label} to={item.to} style={{
              color: item.label === 'News' ? '#C8A415' : '#CBD5E1',
              textDecoration: 'none', fontSize: 14, fontWeight: item.label === 'News' ? 700 : 500,
              transition: 'color 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.color = '#C8A415')}
              onMouseOut={e => { if (item.label !== 'News') e.currentTarget.style.color = '#CBD5E1' }}
            >{item.label}</Link>
          ))}
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #C8A415, #FFD280)', color: '#0077B6',
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            textDecoration: 'none',
          }}>Student Portal</Link>
        </div>
      </nav>

      {/* ═══ HERO BANNER ═══ */}
      <section style={{
        position: 'relative', height: 260, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0077B6 0%, #1a2d5a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,166,35,0.05)', top: -80, right: -60 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(245,166,35,0.04)', bottom: -60, left: -40 }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          borderRadius: 100, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.1)',
          marginBottom: 16, fontSize: 12, fontWeight: 700, color: '#C8A415', letterSpacing: 1,
        }}>
          <Newspaper size={14} /> NEWS &amp; EVENTS
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800, color: '#fff', textAlign: 'center',
        }}>News &amp; Events</h1>
        <p style={{ color: '#94A3B8', fontSize: 16, marginTop: 8, textAlign: 'center', maxWidth: 500 }}>
          Stay informed with the latest happenings at Angeles University Foundation
        </p>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 60px', display: 'flex', gap: 32 }}>

        {/* ── LEFT: articles ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 12, padding: '10px 16px', marginBottom: 20,
          }}>
            <Search size={18} color="var(--color-text-secondary)" />
            <input
              type="text" placeholder="Search articles by title..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setExpandedId(null) }}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 14, color: 'var(--color-text-primary)',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)',
                display: 'flex', alignItems: 'center',
              }}><X size={16} /></button>
            )}
          </div>

          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat
              return (
                <button key={cat} onClick={() => { setActiveCategory(cat); setExpandedId(null) }} style={{
                  padding: '7px 18px', borderRadius: 100,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: active ? 'none' : '1px solid var(--color-border)',
                  background: active ? '#C8A415' : 'var(--color-surface)',
                  color: active ? '#0077B6' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s',
                }}>{cat}</button>
              )
            })}
          </div>

          {/* Back button when article expanded */}
          {expandedId && (
            <button onClick={() => setExpandedId(null)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#C8A415', fontSize: 14, fontWeight: 600, marginBottom: 16, padding: 0,
            }}>
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to all articles
            </button>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-secondary)' }}>
              Loading articles...
            </div>
          )}

          {/* ── FEATURED ARTICLE ── */}
          {!loading && !expandedId && featured && (activeCategory === 'All' || featured.category === activeCategory) && !searchQuery && (
            <div
              onClick={() => setExpandedId(featured.id)}
              style={{
                borderRadius: 16, overflow: 'hidden', marginBottom: 28, cursor: 'pointer',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={featured.thumbnail_url || PLACEHOLDER_IMG} alt=""
                  style={{ width: '100%', height: 300, objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8,
                }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    color: '#fff', background: '#E11D48',
                  }}>FEATURED</span>
                  <span style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    color: '#fff', background: catColors[featured.category] || '#666',
                  }}>{featured.category}</span>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                  {featured.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={13} /> {featured.author_name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {fmtDate(featured.published_at)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── EXPANDED ARTICLE VIEW ── */}
          {expandedId && (() => {
            const art = articles.find(a => a.id === expandedId)
            if (!art) return null
            return (
              <article style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 16, overflow: 'hidden',
              }}>
                {art.thumbnail_url && (
                  <img src={art.thumbnail_url} alt="" style={{ width: '100%', height: 340, objectFit: 'cover' }} />
                )}
                <div style={{ padding: 32 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {art.is_featured && (
                      <span style={{
                        padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        color: '#fff', background: '#E11D48',
                      }}>FEATURED</span>
                    )}
                    <span style={{
                      padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      color: '#fff', background: catColors[art.category] || '#666',
                    }}>{art.category}</span>
                  </div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                    {art.title}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={14} /> {art.author_name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} /> {fmtDate(art.published_at)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 15, lineHeight: 1.8, color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {art.body}
                  </div>
                </div>
              </article>
            )
          })()}

          {/* ── ARTICLE GRID ── */}
          {!loading && !expandedId && (
            <>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
                  No articles found{searchQuery ? ` for "${searchQuery}"` : ' in this category'}.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                {filtered.map(art => (
                  <div
                    key={art.id}
                    onClick={() => setExpandedId(art.id)}
                    style={{
                      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <img
                      src={art.thumbnail_url || PLACEHOLDER_IMG} alt=""
                      style={{ width: '100%', height: 180, objectFit: 'cover' }}
                    />
                    <div style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                          color: '#fff', background: catColors[art.category] || '#666',
                        }}>{art.category}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          {fmtDate(art.published_at)}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 8 }}>
                        {art.title}
                      </h3>
                      <p style={{
                        fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {art.excerpt}
                      </p>
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={12} /> {art.author_name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT SIDEBAR: Events ── */}
        <aside style={{ width: 320, flexShrink: 0 }}>
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 16, padding: 24, position: 'sticky', top: 88,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Calendar size={18} color="#C8A415" />
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Upcoming Events</h3>
            </div>

            {loading && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                Loading events...
              </div>
            )}

            {!loading && events.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                No upcoming events.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.slice(0, 8).map(evt => {
                const { month, day } = fmtDateShort(evt.start_date)
                return (
                  <div key={evt.id} style={{
                    display: 'flex', gap: 14, padding: 12, borderRadius: 10,
                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = '#C8A415')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: 'rgba(245,166,35,0.1)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#C8A415', lineHeight: 1, textTransform: 'uppercase' }}>{month}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#C8A415', lineHeight: 1.1 }}>{day}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{evt.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <MapPin size={11} /> {evt.venue}
                      </div>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'capitalize',
                        background: eventCatColors[evt.category] || '#666',
                      }}>{evt.category}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ FOOTER ═══ */}
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
