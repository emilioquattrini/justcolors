import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'About', path: '/about' },
  { label: 'Visual Arts', path: '/visual-arts' },
  { label: 'Branding', path: '/branding' },
  { label: 'Photo-Graphic', path: '/photo-graphic' },
  { label: 'Contact', path: '/about' },
];

export default function Navigation() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = useCallback((path: string) => {
    setMobileOpen(false);
    const nav = (window as any).__navigate;
    if (nav) nav(path);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          // Sfondo leggermente visibile anche all'inizio per proteggere il testo
          backgroundColor: scrolled ? 'rgba(240, 237, 232, 0.95)' : 'rgba(240, 237, 232, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center justify-between h-16 px-6 lg:px-10">
          {/* Logo */}
          <button onClick={() => handleNav('/')} className="flex items-center">
            <img 
              src={`${import.meta.env.BASE_URL}assets/home/JUSTCOLORS_logo.png`} 
              alt="Logo" 
              className="h-8 md:h-9 w-auto object-contain"
            />
          </button>

          {/* Desktop Nav - Più visibile */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.path)}
                className="relative text-[11px] uppercase tracking-[0.2em] transition-all duration-200 hover:text-[var(--accent)]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: 'var(--text-primary)',
                  fontWeight: 600, // Aumentato spessore
                  opacity: isActive(link.path) ? 1 : 0.7,
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-0.5 bg-[var(--accent)] transition-transform duration-300 origin-left"
                  style={{
                    width: '100%',
                    transform: isActive(link.path) ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={`block w-6 h-0.5 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }} />
            <span className={`block w-6 h-0.5 transition-all ${mobileOpen ? 'opacity-0' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }} />
            <span className={`block w-6 h-0.5 transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }} />
          </button>
        </div>
      </nav>
      {/* ... resto del mobile menu overlay ... */}
    </>
  );
}
