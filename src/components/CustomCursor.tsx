import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onEnterInteractive = () => {
      if (isHoveringRef.current) return;
      isHoveringRef.current = true;
      gsap.to(cursor, { width: 32, height: 32, backgroundColor: 'transparent', borderWidth: 2, duration: 0.2 });
    };

    const onLeaveInteractive = () => {
      isHoveringRef.current = false;
      gsap.to(cursor, { width: 12, height: 12, backgroundColor: 'var(--accent)', borderWidth: 0, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMove);

    // Event delegation for interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select')) {
        onEnterInteractive();
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select')) {
        onLeaveInteractive();
      }
    };

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2 hidden md:block"
      style={{
        width: 12,
        height: 12,
        backgroundColor: 'var(--accent)',
        border: '0px solid var(--accent)',
        mixBlendMode: 'difference',
      }}
    />
  );
}
