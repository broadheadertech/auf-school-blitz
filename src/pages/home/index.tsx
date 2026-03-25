import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Calendar, Newspaper, Users, ChevronLeft, ChevronRight,
  ArrowRight, MapPin, Phone, Mail, Globe, Award, Shield, Heart,
  Beaker, Palette, Stethoscope, Monitor, Briefcase, Building2, GraduationCap
} from 'lucide-react'
import aufLogo from '@/images/logo.png'

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&h=600&fit=crop',
    title: 'Shaping Tomorrow\'s Leaders',
    subtitle: 'Angeles University Foundation provides world-class education rooted in Filipino values and academic excellence.',
    cta: 'Apply Now',
  },
  {
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=600&fit=crop',
    title: 'Enrollment is Now Open',
    subtitle: '1st Semester AY 2026–2027 — Secure your slot today. Online enrollment available through the student portal.',
    cta: 'Enroll Now',
  },
  {
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=600&fit=crop',
    title: 'Research & Innovation',
    subtitle: 'Pushing boundaries in science, technology, and the humanities. Join our growing research community.',
    cta: 'Learn More',
  },
]

const NEWS = [
  { id: 1, category: 'Academic', title: 'University Rankings 2026: AUF Climbs to Top 15 Nationally', date: 'March 20, 2026', excerpt: 'Angeles University Foundation continues its upward trajectory in the latest national university rankings, reflecting improvements in research output and graduate employability.', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=250&fit=crop' },
  { id: 2, category: 'Campus Life', title: 'New Student Center Grand Opening Set for April', date: 'March 18, 2026', excerpt: 'The state-of-the-art student center featuring co-working spaces, a cafeteria, and recreation facilities will open its doors next month.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop' },
  { id: 3, category: 'Sports', title: 'ASU Eagles Win Regional Basketball Championship', date: 'March 15, 2026', excerpt: 'The men\'s basketball team clinched the Central Luzon Athletic Association title with a thrilling overtime victory.', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop' },
  { id: 4, category: 'Research', title: 'Faculty Awarded ₱5M Grant for Renewable Energy Study', date: 'March 12, 2026', excerpt: 'Dr. Elena Reyes and her team received a major DOST grant for their research on solar energy optimization in tropical climates.', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop' },
]

const EVENTS = [
  { date: 'Mar 28', title: 'University Foundation Day', venue: 'Main Auditorium' },
  { date: 'Apr 2', title: 'Career Fair 2026', venue: 'Student Center' },
  { date: 'Apr 10', title: 'Research Symposium', venue: 'Science Complex' },
  { date: 'Apr 15', title: 'Cultural Night: Pamaskong Angeleno', venue: 'Open Grounds' },
  { date: 'Apr 22', title: 'Midterm Examination Week', venue: 'All Campuses' },
]

const PROGRAMS = [
  { icon: Monitor, code: 'BSCS', name: 'BS Computer Science', dept: 'College of Computing', color: '#3B82F6' },
  { icon: Globe, code: 'BSIT', name: 'BS Information Technology', dept: 'College of Computing', color: '#06B6D4' },
  { icon: Stethoscope, code: 'BSN', name: 'BS Nursing', dept: 'College of Nursing', color: '#22C55E' },
  { icon: Briefcase, code: 'BSBA', name: 'BS Business Administration', dept: 'College of Business', color: '#F59E0B' },
  { icon: Palette, code: 'BSED', name: 'BS Education', dept: 'College of Education', color: '#EC4899' },
  { icon: Beaker, code: 'BSECE', name: 'BS Electronics Engineering', dept: 'College of Engineering', color: '#8B5CF6' },
]

const STATS = [
  { value: '12,500+', label: 'Students Enrolled' },
  { value: '450+', label: 'Faculty Members' },
  { value: '38', label: 'Degree Programs' },
  { value: '95%', label: 'Employment Rate' },
]

const QUICK_LINKS = [
  { icon: BookOpen, label: 'Student Portal', href: '/login', desc: 'Access grades, enrollment & more' },
  { icon: GraduationCap, label: 'Admissions', href: '/login', desc: 'Apply for AY 2026-2027' },
  { icon: Calendar, label: 'Academic Calendar', href: '/login', desc: 'View semester schedules' },
  { icon: Newspaper, label: 'News & Updates', href: '/login', desc: 'Latest university news' },
]

const catColors: Record<string, string> = {
  Academic: '#3B82F6',
  'Campus Life': '#22C55E',
  Sports: '#F59E0B',
  Research: '#8B5CF6',
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => setCurrentSlide(p => (p + 1) % SLIDES.length), [])
  const prevSlide = useCallback(() => setCurrentSlide(p => (p - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={aufLogo} alt="AUF Logo" style={{ height: 56, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[
            { label: 'Home', path: '/' },
            { label: 'About', path: '/about' },
            { label: 'Academics', path: '/academics' },
            { label: 'Admissions', path: '/admissions' },
            { label: 'News', path: '/public/news' },
          ].map(item => (
            <Link key={item.label} to={item.path} style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = '#C8A415')}
              onMouseOut={e => (e.currentTarget.style.color = '#CBD5E1')}
            >{item.label}</Link>
          ))}
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #C8A415, #FFD280)', color: '#0077B6',
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            textDecoration: 'none', transition: 'transform 0.2s',
          }}>Student Portal</Link>
        </div>
      </nav>

      {/* === HERO CAROUSEL === */}
      <section style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
        {SLIDES.map((slide, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === currentSlide ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}>
            <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(13,27,62,0.85), rgba(13,27,62,0.5))',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '0 80px',
            }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 800, color: '#fff', lineHeight: 1.1, maxWidth: 700,
                marginBottom: 16,
              }}>{slide.title}</h1>
              <p style={{ color: '#CBD5E1', fontSize: 18, maxWidth: 600, lineHeight: 1.6, marginBottom: 28 }}>
                {slide.subtitle}
              </p>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content',
                background: 'linear-gradient(135deg, #C8A415, #FFD280)', color: '#0077B6',
                padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 20px rgba(245,166,35,0.3)',
              }}>{slide.cta} <ArrowRight size={16} /></Link>
            </div>
          </div>
        ))}
        <button onClick={prevSlide} aria-label="Previous" style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', zIndex: 10,
        }}><ChevronLeft size={20} /></button>
        <button onClick={nextSlide} aria-label="Next" style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', zIndex: 10,
        }}><ChevronRight size={20} /></button>
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} aria-label={`Slide ${i+1}`} style={{
              width: i === currentSlide ? 28 : 8, height: 8, borderRadius: 4,
              background: i === currentSlide ? '#C8A415' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </section>

      {/* === QUICK LINKS === */}
      <section style={{ padding: '0 48px', marginTop: -40, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 1200, margin: '0 auto' }}>
          {QUICK_LINKS.map(link => (
            <Link key={link.label} to={link.href} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 12, padding: '20px 24px', textDecoration: 'none', color: 'inherit',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <link.icon size={20} color="#C8A415" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{link.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* === STATS BAR === */}
      <section style={{ padding: '48px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          background: 'linear-gradient(135deg, #0077B6, #1a2d5a)', borderRadius: 16,
          padding: '32px 40px',
        }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#C8A415' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === NEWS SECTION === */}
      <section style={{ padding: '24px 48px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Latest News</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>Stay updated with campus happenings</p>
          </div>
          <Link to="/login" style={{ color: '#C8A415', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Featured */}
          {NEWS[0] && (
          <div style={{
            gridRow: 'span 2', borderRadius: 14, overflow: 'hidden',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          }}>
            <img src={NEWS[0].image} alt="" style={{ width: '100%', height: 280, objectFit: 'cover' }} />
            <div style={{ padding: 24 }}>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 10,
                background: catColors[NEWS[0].category] || '#666',
              }}>{NEWS[0].category}</span>
              <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{NEWS[0].title}</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{NEWS[0].excerpt}</p>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 12 }}>{NEWS[0].date}</div>
            </div>
          </div>
          )}
          {/* Side cards */}
          {NEWS.slice(1).map(item => (
            <div key={item.id} style={{
              display: 'flex', gap: 16, borderRadius: 12, overflow: 'hidden',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 12,
            }}>
              <img src={item.image} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{
                  display: 'inline-block', width: 'fit-content', padding: '2px 8px', borderRadius: 4,
                  fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 6,
                  background: catColors[item.category] || '#666',
                }}>{item.category}</span>
                <h4 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{item.title}</h4>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === PROGRAMS SECTION === */}
      <section style={{ padding: '48px 48px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Academic Programs</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>Explore our degree programs across 6 colleges</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {PROGRAMS.map(prog => (
              <div key={prog.code} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 14, padding: 24, transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = prog.color }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${prog.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <prog.icon size={22} color={prog.color} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: prog.color, marginBottom: 4 }}>{prog.code}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{prog.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{prog.dept}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === EVENTS SECTION === */}
      <section style={{ padding: '48px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Upcoming Events</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>Don't miss what's happening on campus</p>
          </div>
          <Link to="/login" style={{ color: '#C8A415', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View calendar <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EVENTS.map((evt, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 12, transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#C8A415' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 12, background: 'rgba(245,166,35,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C8A415', lineHeight: 1 }}>{evt.date.split(' ')[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#C8A415', lineHeight: 1 }}>{evt.date.split(' ')[1]}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{evt.title}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> {evt.venue}
                </div>
              </div>
              <ArrowRight size={16} color="var(--color-text-secondary)" />
            </div>
          ))}
        </div>
      </section>

      {/* === ANNOUNCEMENTS BANNER === */}
      <section style={{ padding: '48px 48px', background: 'linear-gradient(135deg, #0077B6, #1a2d5a)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 100, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.1)',
            marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#C8A415', letterSpacing: 1,
          }}>
            <Award size={14} /> ANNOUNCEMENT
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Enrollment for 1st Sem AY 2026–2027 is <span style={{ color: '#C8A415' }}>NOW OPEN</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 600, margin: '0 auto 28px', lineHeight: 1.6 }}>
            New and returning students can now enroll through the student portal. Enrollment period: April 1 – April 30, 2026.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/login" style={{
              background: 'linear-gradient(135deg, #C8A415, #FFD280)', color: '#0077B6',
              padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>Enroll Now <ArrowRight size={16} /></Link>
            <a href="#" style={{
              border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
              padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
            }}>View Requirements</a>
          </div>
        </div>
      </section>

      {/* === WHY CHOOSE US === */}
      <section style={{ padding: '48px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Why Choose ASU?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { icon: Award, title: 'Academic Excellence', desc: 'Nationally recognized programs with CHED Centers of Excellence and Development in multiple disciplines.' },
            { icon: Users, title: 'Industry Partnerships', desc: '50+ MOAs with companies for internship, job placement, and collaborative research opportunities.' },
            { icon: Shield, title: 'Modern Facilities', desc: 'Smart classrooms, state-of-the-art laboratories, and a fully digital library system.' },
            { icon: Heart, title: 'Student Welfare', desc: 'Comprehensive scholarship programs, counseling services, and student organizations.' },
            { icon: Globe, title: 'Global Exposure', desc: 'International exchange programs and partnerships with universities across Asia and Europe.' },
            { icon: Building2, title: 'Strategic Location', desc: 'Located in the heart of Angeles City with easy access to Clark Freeport Zone industries.' },
          ].map(item => (
            <div key={item.title} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 14, padding: 24, textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'rgba(245,166,35,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <item.icon size={22} color="#C8A415" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
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
