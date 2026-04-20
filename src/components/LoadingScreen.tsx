import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete,
        });
      },
    });

    tl.fromTo(wordmarkRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' })
      .fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, '-=0.2');

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--bg-inverse)' }}
    >
      <div
        ref={wordmarkRef}
        className="text-3xl mb-6"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: 'var(--text-inverse)',
          fontWeight: 400,
        }}
      >
        justcolors
      </div>
      <div
        ref={lineRef}
        className="w-32 h-px origin-left"
        style={{ backgroundColor: 'var(--accent)', transformOrigin: 'left center' }}
      />
    </div>
  );
}
