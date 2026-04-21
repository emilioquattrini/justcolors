import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { homepageData } from '../data/galleryData';

export default function HomePage() {
  const panelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const bgImages = homepageData.backgroundImages;

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.2 }
    );

    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.4 }
      );
    }

    if (navRef.current) {
      const dividers = navRef.current.querySelectorAll('.nav-divider');
      const links = navRef.current.querySelectorAll('.nav-link');
      gsap.fromTo(dividers,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, ease: 'expo.out', stagger: 0.06, delay: 0.6, transformOrigin: 'left' }
      );
      gsap.fromTo(links,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.06, delay: 0.7 }
      );
    }

    if (dotsRef.current) {
      gsap.fromTo(dotsRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: 0.9 }
      );
    }

    const interval = setInterval(() => {
      setActiveDot(prev => (prev + 1) % bgImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [bgImages.length]);

  const handleNav = (path: string, external: boolean) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    const nav = (window as any).__navigate;
    if (nav) nav(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div
        ref={panelRef}
        className="w-full max-w-[540px] rounded-3xl px-8 py-10 md:px-12 md:py-12"
        style={{
          background: 'rgba(240, 237, 232, 0.08)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          opacity: 0,
        }}
      >
        {/* Contact Bar */}
        <div className="flex items-center justify-between pb-4 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          <a
            href={`mailto:${homepageData.email}`}
            className="flex items-center gap-2 transition-colors duration-150 hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13L2 4" />
            </svg>
            <span className="hidden sm:inline">{homepageData.email}</span>
          </a>
          <a
            href={homepageData.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-150 hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="hidden sm:inline">Instagram</span>
          </a>
        </div>

        {/* Logo */}
        <div ref={logoRef} className="text-center mb-12 flex flex-col items-center" style={{ opacity: 0 }}>
          <img 
            src={`${import.meta.env.BASE_URL}assets/home/JUSTCOLORS_logo.png`} 
            alt="Justcolors Logo" 
            className="h-24 md:h-32 lg:h-40 object-contain mb-4" 
          />
          <p
            className="text-sm tracking-widest"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: 'var(--text-secondary)',
              letterSpacing: '0.05em',
            }}
          >
            {homepageData.tagline}
          </p>
        </div>

        {/* Navigation Menu */}
        <div ref={navRef} className="space-y-0 mb-10">
          {homepageData.navItems.map((item) => (
            <div key={item.label}>
              <div
                className="nav-divider h-px w-full"
                style={{ backgroundColor: 'var(--border)', transformOrigin: 'left' }}
              />
              <button
                className="nav-link w-full text-left py-3 flex items-center gap-3 group transition-all duration-150 hover:text-[var(--accent)]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '18px',
                  fontWeight: 300,
                  color: 'var(--text-primary)',
                  opacity: 0,
                }}
                onClick={() => handleNav(item.path, item.external)}
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-sm">
                  &rarr;
                </span>
                <span className="group-hover:translate-x-4 transition-transform duration-150">
                  {item.label}
                </span>
              </button>
            </div>
          ))}
          <div className="nav-divider h-px w-full" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Progress Dots */}
        <div ref={dotsRef} className="flex items-center justify-center gap-2" style={{ opacity: 0 }}>
          {bgImages.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeDot === i ? 8 : 6,
                height: activeDot === i ? 8 : 6,
                backgroundColor: activeDot === i ? 'var(--accent)' : 'transparent',
                border: activeDot === i ? 'none' : '1px solid var(--border)',
                transform: activeDot === i ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
