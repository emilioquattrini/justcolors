import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionLabel from '../components/SectionLabel';
import { photoGraphicData } from '../data/galleryData';
import { getAssetUrl } from '../utils/assets';

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        setHasAnimated(true);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: value,
          duration: 1.5,
          ease: 'expo.out',
          snap: { val: 1 },
          onUpdate: () => {
            if (ref.current) ref.current.textContent = Math.round(obj.val) + (suffix || '');
          },
        });
      },
    });
    return () => trigger.kill();
  }, [value, suffix, hasAnimated]);

  return <span ref={ref}>0</span>;
}

export default function PhotoGraphicPage() {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const data = photoGraphicData;

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.1 }
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

      if (galleryRef.current) {
        const images = galleryRef.current.querySelectorAll('.photo-item');
        gsap.from(images, {
          x: 50, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: galleryRef.current, start: 'top 85%', once: true },
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const handleGalleryScroll = () => {
    if (scrollHintRef.current) {
      gsap.to(scrollHintRef.current, { opacity: 0, duration: 0.3 });
    }
  };

  const handleNav = (path: string) => {
    const nav = (window as any).__navigate;
    if (nav) nav(path);
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-20">
      <div
        ref={panelRef}
        className="w-full max-w-[1200px] rounded-3xl px-8 md:px-16 py-16 md:py-24"
        style={{
          background: 'rgba(240, 237, 232, 0.80)',
          backdropFilter: 'blur(60px) saturate(110%)',
          WebkitBackdropFilter: 'blur(60px) saturate(110%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          opacity: 0,
        }}
      >
        <div ref={contentRef} className="max-w-3xl mx-auto">
          <div className="reveal-item">
            <SectionLabel text="PHOTO-GRAPHIC" />
          </div>

          <div className="reveal-item mb-8">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.0 }}
            >
              {data.pageTitle}
            </h1>
          </div>

          <div className="reveal-item mb-10" style={{ maxWidth: 600 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: '1.7em', color: 'var(--text-primary)' }}>
              {data.description}
            </p>
          </div>

          {/* Horizontal Scroll Gallery */}
          <div className="reveal-item mb-6">
            <div
              ref={galleryRef}
              className="flex gap-4 overflow-x-auto pb-4"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
              onScroll={handleGalleryScroll}
            >
              {data.projects.map((image) => (
                <div
                  key={image.image}
                  className="photo-item flex-shrink-0 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg"
                  style={{ scrollSnapAlign: 'start', height: '400px', width: 'auto' }}
                >
                  <img
                    src={getAssetUrl(image.image)}
                    alt={image.title}
                    className="h-full w-auto object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Hint */}
          <div ref={scrollHintRef} className="text-center mb-10">
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 400,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
            }}>
              &larr; Scroll to explore &rarr;
            </span>
          </div>

          {/* Stats */}
          <div className="reveal-item flex flex-wrap justify-center gap-12 md:gap-20 mb-12">
            {data.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: 'var(--text-primary)' }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 400,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Back */}
          <div className="reveal-item text-center">
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
