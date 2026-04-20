import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { routeBackgrounds, homepageData, aboutData, visualArtsData, brandingData } from '../data/galleryData';
import { getAssetUrl } from '../utils/assets';

interface BackgroundArtworkProps {
  currentPath: string;
}

function getBackgroundImages(path: string): string[] {
  if (path === '/visual-arts' && visualArtsData.projects.length > 0) {
    return [getAssetUrl(visualArtsData.projects[0].image)];
  }
  if (path === '/branding' && brandingData.projects.length > 0) {
    return [getAssetUrl(brandingData.projects[0].image)];
  }
  if (path === '/about') {
    return [getAssetUrl(aboutData.backgroundImage)];
  }
  const config = routeBackgrounds[path];
  if (config?.images) return config.images.map(getAssetUrl);
  return homepageData.backgroundImages.map(getAssetUrl);
}

export default function BackgroundArtwork({ currentPath }: BackgroundArtworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const cycleIndexRef = useRef(0);
  const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHome = currentPath === '/';
  const config = routeBackgrounds[currentPath] || routeBackgrounds['/'];

  useEffect(() => {
    if (config.type === 'solid') {
      setCurrentImages([]);
      return;
    }
    const images = getBackgroundImages(currentPath);
    setCurrentImages(images);
  }, [currentPath, config]);

  useEffect(() => {
    if (!isHome || currentImages.length === 0) {
      if (cycleTimerRef.current) {
        clearInterval(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
      return;
    }

    imgRefs.current.forEach((img, i) => {
      if (img) gsap.set(img, { opacity: i === 0 ? 1 : 0, scale: 1 });
    });
    cycleIndexRef.current = 0;

    cycleTimerRef.current = setInterval(() => {
      const nextIndex = (cycleIndexRef.current + 1) % currentImages.length;
      const currentImg = imgRefs.current[cycleIndexRef.current];
      const nextImg = imgRefs.current[nextIndex];

      if (nextImg) {
        gsap.set(nextImg, { opacity: 0, scale: 1 });
        gsap.to(nextImg, { opacity: 1, duration: 1.2, ease: 'power2.inOut' });
        gsap.to(nextImg, { scale: 1.05, duration: 6, ease: 'none' });
      }
      if (currentImg) {
        gsap.to(currentImg, { opacity: 0, duration: 1.2, ease: 'power2.inOut' });
      }

      cycleIndexRef.current = nextIndex;
    }, 6000);

    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, [isHome, currentImages]);

  if (config.type === 'solid') {
    return <div className="fixed inset-0 z-0" style={{ backgroundColor: config.color }} />;
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden">
      {currentImages.map((src, i) => (
        <div
          key={`${currentPath}-${src}`}
          ref={(el) => { imgRefs.current[i] = el; }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === 0 ? 1 : 0,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.25) 100%)',
        }}
      />
    </div>
  );
}
