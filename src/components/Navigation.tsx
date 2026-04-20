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
    const onScroll = () => setScrolled(window.scrollY > 100);
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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(240, 237, 232, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="flex items-center justify-between h-14 px-6 lg:px-10">
          {/* Logo */}
          <button
            onClick={() => handleNav('/')}
            className="font-serif text-xl tracking-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: isActive('/') ? 'var(--accent)' : 'var(--text-primary)',
            }}
          >
            justcolors
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.path)}
                className="relative text-sm uppercase tracking-widest font-light transition-colors duration-150 hover:text-[var(--accent)]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 300,
                  letterSpacing: '0.08em',
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-px bg-[var(--accent)] transition-transform duration-300 origin-left"
                  style={{
                    width: '100%',
                    transform: isActive(link.path) ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }} />
            <span className={`block w-6 h-0.5 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }} />
            <span className={`block w-6 h-0.5 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.path)}
              className="text-3xl transition-colors duration-150 hover:text-[var(--accent)]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: isActive(link.path) ? 'var(--accent)' : 'var(--text-primary)',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
