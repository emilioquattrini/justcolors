import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionLabel from '../components/SectionLabel';
import ProjectCard from '../components/ProjectCard';
import LightboxModal from '../components/LightboxModal';
import { brandingData } from '../data/galleryData';
import type { GalleryImage } from '../data/galleryData';
import { getAssetUrl } from '../utils/assets';

gsap.registerPlugin(ScrollTrigger);

export default function BrandingPage() {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const data = brandingData;
  const galleryImages: GalleryImage[] = data.projects.map(p => ({
    src: getAssetUrl(p.image),
    title: p.title,
    category: p.category,
  }));

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

      if (galleryRef.current) {
        const cards = galleryRef.current.querySelectorAll('.gallery-card');
        gsap.from(cards, {
          y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'expo.out',
          scrollTrigger: { trigger: galleryRef.current, start: 'top 85%', once: true },
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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
            <SectionLabel text="BRANDING" />
          </div>

          <div className="reveal-item mb-8">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.0 }}
            >
              {data.pageTitle}
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', lineHeight: '1.7em', color: 'var(--text-secondary)' }}>
              {data.pageSubtitle}
            </p>
          </div>

          <div className="reveal-item mb-10">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: '1.7em', color: 'var(--text-primary)' }}>
              {data.description}
            </p>
            <p className="mt-4" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: '1.7em', color: 'var(--text-primary)' }}>
              {data.contactNote}{' '}
              <a href={`mailto:${data.email}`} className="underline hover:text-[var(--accent-coral)]" style={{ color: 'var(--accent-coral)' }}>
                {data.email}
              </a>
            </p>
          </div>

          {/* Gallery Grid - 2 columns */}
          <div ref={galleryRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {galleryImages.map((image, index) => (
              <div key={image.src} className="gallery-card">
                <ProjectCard
                  src={image.src}
                  title={image.title}
                  category={image.category}
                  onClick={() => openLightbox(index)}
                />
              </div>
            ))}
          </div>

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

      <LightboxModal
        images={galleryImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
