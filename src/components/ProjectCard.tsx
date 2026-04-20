import { useState } from 'react';

interface ProjectCardProps {
  src: string;
  title: string;
  category?: string;
  onClick?: () => void;
}

export default function ProjectCard({ src, title, category, onClick }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group"
      style={{ aspectRatio: '4/3' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
        style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
        loading="lazy"
      />
      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(26, 26, 26, 0.4)',
          opacity: hovered ? 1 : 0,
        }}
      >
        <span
          className="text-lg font-medium"
          style={{ color: 'var(--text-inverse)', fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </span>
        {category && (
          <span
            className="mt-1"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(240, 237, 232, 0.7)',
            }}
          >
            {category}
          </span>
        )}
      </div>
    </div>
  );
}
