import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { homepageData } from '../data/galleryData';

export default function HomePage() {
  const panelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const bgImages = homepageData.backgroundImages;

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', delay: 0.2 }
    );

    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.4 }
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

  return (
    <div className="min-h-screen flex items-center justify-end px-6 md:pr-16 lg:pr-24 py-20">
      <div
        ref={panelRef}
        className="w-full max-w-[380px] rounded-3xl px-8 py-10 md:px-10"
        style={{
          background: 'rgba(240, 237, 232, 0.15)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          opacity: 0,
        }}
      >
        {/* Contact Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 pb-2 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          <a
            href={`mailto:${homepageData.email}`}
            className="flex items-center gap-2 transition-colors duration-150 hover:text-[var(--accent)]"
            style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
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
            style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="hidden sm:inline">Instagram</span>
          </a>
        </div>

        {/* Logo, Tagline e Pulsante */}
        <div ref={logoRef} className="text-center mb-10 flex flex-col items-center" style={{ opacity: 0 }}>
          <img 
            src={`${import.meta.env.BASE_URL}assets/home/JUSTCOLORS_logo.png`} 
            alt="Justcolors Logo" 
            className="h-24 md:h-32 lg:h-36 object-contain mb-3" 
          />
          
          {/* Tagline testuale sotto il logo */}
          <p
            className="text-sm tracking-widest mb-8 text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: 'var(--text-primary)',
              fontWeight: 400,
              letterSpacing: '0.05em',
            }}
          >
            Simple colors for complex works
          </p>
          
          {/* Pulsante Impersonae (link esterno) */}
          <button
            onClick={() => window.open('https://impersonae.com', '_blank', 'noopener,noreferrer')}
            className="group relative px-6 py-3 w-full overflow-hidden rounded-full transition-all duration-300"
            style={{
              border: '1px solid var(--text-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="relative z-10 text-xs tracking-[0.15em] uppercase font-medium block w-full text-center">
              Impersonae - Design telling
            </span>
            <div className="absolute inset-0 bg-[var(--text-primary)] translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            <style>{`
              button:hover span { color: var(--bg-primary); }
            `}</style>
          </button>
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
