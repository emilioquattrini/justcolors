import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current!.querySelectorAll('.footer-item'), {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          once: true,
        },
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative z-10"
      style={{ backgroundColor: 'var(--bg-inverse)', padding: '80px 32px 48px' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="h-px mb-12" style={{ backgroundColor: 'rgba(240, 237, 232, 0.2)' }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Left - Brand */}
          <div className="footer-item">
            <div
              className="text-xl mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: 'var(--text-inverse)',
              }}
            >
              justcolors
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
              Simple colors for complex works
            </p>
          </div>

          {/* Center - Social */}
          <div className="footer-item flex md:justify-center">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-150 hover:underline"
              style={{
                color: 'var(--accent-coral)',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Instagram
            </a>
          </div>

          {/* Right - Contact */}
          <div className="footer-item md:text-right">
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
              &copy; 2025 Chiara
            </p>
            <a
              href="mailto:chiara.czhu@gmail.com"
              className="transition-colors duration-150 hover:text-[var(--accent-coral)]"
              style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              chiara.czhu@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
