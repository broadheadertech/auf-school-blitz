import { Link } from 'react-router-dom'
import {
  GraduationCap, BookOpen, FlaskConical, Dumbbell, Users, Monitor, Music,
  MapPin, Phone, Mail, Target, Eye, Heart, Clock, User,
} from 'lucide-react'

const STATS = [
  { value: '12,500+', label: 'Students Enrolled' },
  { value: '450+', label: 'Faculty Members' },
  { value: '38', label: 'Degree Programs' },
  { value: '95%', label: 'Employment Rate' },
]

const TIMELINE = [
  { year: '1985', title: 'University Founded', desc: 'Angeles State University was established as a public higher education institution in Angeles City, Pampanga.' },
  { year: '1992', title: 'First Graduate Programs', desc: 'Launched Master of Arts in Education and MBA programs, expanding into graduate-level instruction.' },
  { year: '1998', title: 'CHED Center of Excellence', desc: 'Received CHED recognition as Center of Excellence in Teacher Education and Information Technology.' },
  { year: '2005', title: 'Science Complex Inaugurated', desc: 'Opened the state-of-the-art Science Complex with modern laboratories for research and instruction.' },
  { year: '2012', title: 'International Partnerships', desc: 'Signed exchange agreements with universities in Japan, South Korea, and Australia.' },
  { year: '2020', title: 'Digital Transformation', desc: 'Launched full online learning infrastructure and the integrated student portal system.' },
  { year: '2025', title: '40th Anniversary & Expansion', desc: 'Celebrated 40 years of excellence with groundbreaking for the new Innovation and Technology Hub.' },
]

const LEADERSHIP = [
  { name: 'Dr. Ricardo M. Santos', title: 'University President', desc: 'Leading ASU since 2019, Dr. Santos has championed research innovation and international collaboration.' },
  { name: 'Dr. Maria Elena V. Cruz', title: 'VP for Academic Affairs', desc: 'Oversees curriculum development, faculty welfare, and academic quality assurance across all colleges.' },
  { name: 'Atty. Fernando L. Reyes', title: 'VP for Administration', desc: 'Manages university operations, facilities development, and institutional partnerships.' },
]

const FACILITIES = [
  { icon: BookOpen, name: 'University Library', desc: 'Digital and physical collections with over 120,000 volumes and 24/7 e-resource access.' },
  { icon: FlaskConical, name: 'Science Complex', desc: 'Advanced laboratories for chemistry, physics, biology, and engineering research.' },
  { icon: Dumbbell, name: 'Sports Center', desc: 'Olympic-size pool, gymnasium, track and field, and multi-purpose courts.' },
  { icon: Users, name: 'Student Center', desc: 'Co-working spaces, cafeteria, student org offices, and recreation facilities.' },
  { icon: Monitor, name: 'IT Laboratories', desc: '10 computer labs with 500+ workstations, high-speed internet, and specialized software.' },
  { icon: Music, name: 'Auditorium', desc: '2,000-seat auditorium for convocations, cultural events, and academic conferences.' },
]

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Academics', to: '/academics' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'News', to: '/public/news' },
]

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>

      {/* === NAVBAR === */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0D1B3E', color: '#fff',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff' }}>
          <GraduationCap size={28} color="#F5A623" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
            Angeles State University
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {NAV_LINKS.map(item => (
            <Link key={item.label} to={item.to} style={{
              color: item.label === 'About' ? '#F5A623' : '#CBD5E1',
              textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.color = '#F5A623')}
              onMouseOut={e => (e.currentTarget.style.color = item.label === 'About' ? '#F5A623' : '#CBD5E1')}
            >{item.label}</Link>
          ))}
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #F5A623, #FFD280)', color: '#0D1B3E',
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            textDecoration: 'none', transition: 'transform 0.2s',
          }}>Student Portal</Link>
        </div>
      </nav>

      {/* === HERO BANNER === */}
      <section style={{
        position: 'relative', height: 360, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0D1B3E 0%, #1a2d5a 60%, #0D1B3E 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 48px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 50%, #F5A623 1px, transparent 1px), radial-gradient(circle at 80% 50%, #F5A623 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          borderRadius: 100, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.1)',
          marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#F5A623', letterSpacing: 1,
        }}>
          <GraduationCap size={14} /> ABOUT ASU
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 16,
        }}>
          Angeles State University
        </h1>
        <p style={{ color: '#CBD5E1', fontSize: 18, maxWidth: 640, lineHeight: 1.6 }}>
          Empowering students with quality education, research excellence, and community service since 1985.
        </p>
      </section>

      {/* === MISSION, VISION, VALUES === */}
      <section style={{ padding: '60px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Our Foundation</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>The principles that guide everything we do</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            {
              icon: Target, title: 'Mission', color: '#3B82F6',
              text: 'To provide accessible, quality higher education that develops competent, morally upright, and socially responsible professionals who contribute to national development and global competitiveness.',
            },
            {
              icon: Eye, title: 'Vision', color: '#F5A623',
              text: 'A leading university in the Asia-Pacific region recognized for academic excellence, cutting-edge research, and transformative community engagement by 2035.',
            },
            {
              icon: Heart, title: 'Core Values', color: '#22C55E',
              text: 'Academic Integrity, Social Responsibility, Innovation, Inclusivity, and Excellence — the pillars that shape our culture and inspire our community of scholars.',
            },
          ].map(item => (
            <div key={item.title} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 14, padding: 28, transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = item.color }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <item.icon size={22} color={item.color} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === UNIVERSITY HISTORY TIMELINE === */}
      <section style={{ padding: '60px 48px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>University History</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>Four decades of academic excellence</p>
          </div>
          <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 24, top: 0, bottom: 0, width: 2,
              background: 'var(--color-border)',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {TIMELINE.map((item, i) => (
                <div key={item.year} style={{ display: 'flex', gap: 24, position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                    background: i === TIMELINE.length - 1 ? '#F5A623' : 'var(--color-bg)',
                    border: `3px solid ${i === TIMELINE.length - 1 ? '#F5A623' : '#0D1B3E'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    <Clock size={16} color={i === TIMELINE.length - 1 ? '#0D1B3E' : '#0D1B3E'} />
                  </div>
                  {/* Content */}
                  <div style={{
                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                    borderRadius: 12, padding: '18px 24px', flex: 1,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#F5A623', marginBottom: 4 }}>{item.year}</div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === LEADERSHIP === */}
      <section style={{ padding: '60px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>University Leadership</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>Guiding ASU towards its vision of excellence</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {LEADERSHIP.map(person => (
            <div key={person.name} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 14, padding: 28, textAlign: 'center', transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D1B3E, #1a2d5a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <User size={28} color="#F5A623" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{person.name}</h3>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F5A623', marginBottom: 10 }}>{person.title}</div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{person.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === CAMPUS FACILITIES === */}
      <section style={{ padding: '60px 48px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Campus Facilities</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 6 }}>World-class infrastructure for learning and growth</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {FACILITIES.map(fac => (
              <div key={fac.name} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 14, padding: 24, transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#F5A623' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: 'rgba(245,166,35,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                }}>
                  <fac.icon size={22} color="#F5A623" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{fac.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === STATS BAR === */}
      <section style={{ padding: '48px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          background: 'linear-gradient(135deg, #0D1B3E, #1a2d5a)', borderRadius: 16,
          padding: '32px 40px',
        }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#F5A623' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === FOOTER === */}
      <footer style={{
        background: '#0D1B3E', color: '#94A3B8', padding: '48px 48px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <GraduationCap size={24} color="#F5A623" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                Angeles State University
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
          <span>&copy; 2026 Angeles State University. All rights reserved.</span>
          <span>Privacy Policy &middot; Terms of Service</span>
        </div>
      </footer>
    </div>
  )
}
