import { useEffect, useCallback } from 'react';
import gsap from 'gsap';
import type { GalleryImage } from '../data/galleryData';

interface LightboxModalProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function LightboxModal({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
    if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
  }, [isOpen, onClose, onNavigate, currentIndex, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Entrance animation
  useEffect(() => {
    if (!isOpen) return;
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-image');
    if (modal) gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    if (img) gsap.fromTo(img, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out', delay: 0.1 });
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <div
      id="lightbox-modal"
      className="fixed inset-0 z-[150] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.95)' }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-6 right-6 text-white hover:text-[var(--accent-coral)] transition-colors z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </svg>
      </button>

      {/* Previous */}
      <button
        className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-[var(--accent-coral)] transition-colors z-10"
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + images.length) % images.length); }}
        aria-label="Previous"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next */}
      <button
        className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-[var(--accent-coral)] transition-colors z-10"
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % images.length); }}
        aria-label="Next"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Image */}
      <div
        className="flex flex-col items-center max-w-[90vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          id="lightbox-image"
          key={current.src}
          src={current.src}
          alt={current.title}
          className="max-w-full max-h-[75vh] object-contain rounded-lg"
        />
        <p className="mt-4 text-white text-base font-medium">{current.title}</p>
        {current.category && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{current.category}</p>
        )}
      </div>
    </div>
  );
}
