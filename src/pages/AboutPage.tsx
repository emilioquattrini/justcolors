import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionLabel from '../components/SectionLabel';
import BioText from '../components/BioText';
import { aboutData, homepageData } from '../data/galleryData';
import { getAssetUrl } from '../utils/assets';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', delay: 0.1 }
    );

    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      const elements = contentRef.current!.querySelectorAll('.reveal-item');
      elements.forEach((el) => {
        gsap.from(el, {
          y: 20, opacity: 0, duration: 0.5, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      const awardItems = contentRef.current!.querySelectorAll('.award-item');
      if (awardItems.length > 0) {
        gsap.from(awardItems, {
          y: 15, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'expo.out',
          scrollTrigger: { trigger: awardItems[0], start: 'top 85%', once: true },
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const handleNav = (path: string) => {
    const nav = (window as any).__navigate;
    if (nav) nav(path);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:block lg:w-[45%] min-h-screen" />

      <div
        ref={panelRef}
        className="w-full lg:w-[55%] lg:fixed lg:right-0 lg:top-0 lg:h-screen overflow-y-auto z-20"
        style={{
          background: 'rgba(240, 237, 232, 0.75)',
          backdropFilter: 'blur(50px) saturate(110%)',
          WebkitBackdropFilter: 'blur(50px) saturate(110%)',
          scrollbarWidth: 'thin',
        }}
      >
        <div ref={contentRef} className="px-8 md:px-12 lg:px-16 py-20 lg:py-28 max-w-2xl">
          <div className="reveal-item">
            <SectionLabel text={aboutData.sectionLabel} />
          </div>

          {/* Portrait */}
          <div className="reveal-item flex flex-col items-center mb-10">
            <img
              src={getAssetUrl(aboutData.portrait)}
              alt="Chiara portrait"
              className="w-48 h-48 object-contain mb-3"
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
              {aboutData.portraitCaption}
            </span>
          </div>

          {/* Heading */}
          <div className="reveal-item mb-8">
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              {aboutData.heading.map((line, i) => (
                <span key={i}>{line}{i < aboutData.heading.length - 1 && <br />}</span>
              ))}
            </h2>
          </div>

          {/* Bio */}
          <div className="space-y-5 mb-16">
            {aboutData.bio.map((paragraph, i) => (
              <p
                key={i}
                className="reveal-item"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: '1.7em', color: 'var(--text-primary)' }}
              >
                <BioText text={paragraph} links={aboutData.links} />
              </p>
            ))}
          </div>

          {/* Awards */}
          <div className="reveal-item">
            <SectionLabel text={aboutData.awardsLabel} />
          </div>

          <div className="mb-12">
            {aboutData.awards.map((award, i) => (
              <div
                key={i}
                className="award-item py-4 transition-transform duration-150 hover:translate-x-2"
                style={{ borderBottom: '1px solid var(--border-light)' }}
              >
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 400,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px',
                }}>
                  {award.date}
                </div>
                <div className="font-medium" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: 'var(--text-primary)' }}>
                  {award.award}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {award.project}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="reveal-item flex flex-wrap gap-4 mb-10">
            <button
              className="px-7 py-3 rounded-full text-sm transition-all duration-200 hover:bg-[var(--text-primary)] hover:text-[var(--text-inverse)]"
              style={{ fontFamily: "'Inter', sans-serif", border: '1px solid var(--text-primary)', color: 'var(--text-primary)', fontSize: '13px' }}
            >
              Download CV
            </button>
            <button
              className="px-7 py-3 rounded-full text-sm transition-all duration-200 hover:brightness-110"
              style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'var(--accent)', color: 'var(--text-inverse)', fontSize: '13px' }}
              onClick={() => window.location.href = `mailto:${homepageData.email}`}
            >
              Get in Touch
            </button>
          </div>

          {/* Back */}
          <div className="reveal-item">
            <button
              onClick={() => handleNav('/')}
              className="text-sm transition-colors duration-150 hover:text-[var(--accent)]"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', fontSize: '13px' }}
            >
              &larr; Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
