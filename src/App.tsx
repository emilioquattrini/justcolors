import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { TransitionProvider, useTransition } from './context/TransitionContext';
import BackgroundArtwork from './components/BackgroundArtwork';
import Navigation from './components/Navigation';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import VisualArtsPage from './pages/VisualArtsPage';
import BrandingPage from './pages/BrandingPage';
import PhotoGraphicPage from './pages/PhotoGraphicPage';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentPath } = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayLocation, setDisplayLocation] = useState(location);

  // Sync currentPath with location
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname, setCurrentPath]);

  // Handle page transitions
  const handleNavigate = useCallback((path: string) => {
    if (path === location.pathname) return;

    const content = contentRef.current;
    if (!content) {
      navigate(path);
      setDisplayLocation({ ...location, pathname: path });
      return;
    }

    // Exit animation
    gsap.to(content, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'expo.in',
      onComplete: () => {
        navigate(path);
        setDisplayLocation({ ...location, pathname: path });
        window.scrollTo(0, 0);

        // Enter animation
        gsap.fromTo(content,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            delay: 0.1,
          }
        );
      },
    });
  }, [location, navigate]);

  // Expose navigate function globally for Navigation component
  useEffect(() => {
    (window as any).__navigate = handleNavigate;
    return () => { delete (window as any).__navigate; };
  }, [handleNavigate]);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative min-h-screen">
      <BackgroundArtwork currentPath={location.pathname} />
      <Navigation />
      <CustomCursor />

      {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}

      <div ref={contentRef} className="relative z-10">
        <Routes location={displayLocation}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/visual-arts" element={<VisualArtsPage />} />
          <Route path="/branding" element={<BrandingPage />} />
          <Route path="/photo-graphic" element={<PhotoGraphicPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <TransitionProvider>
      <AppContent />
    </TransitionProvider>
  );
}
