interface ProjectCardProps {
  src: string;
  title: string;
  category?: string;
  onClick?: () => void;
}

export default function ProjectCard({ src, title, category, onClick }: ProjectCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group"
      style={{ aspectRatio: '4/3' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <img
        src={src}
        alt={title}
        // Aggiunto group-hover:scale-[1.04] per gestire l'animazione CSS al posto del React state
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
        loading="lazy"
      />
      {/* Hover overlay */}
      <div
        // Aggiunto opacity-0 e group-hover:opacity-100
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          backgroundColor: 'rgba(26, 26, 26, 0.4)',
        }}
      >
        <span
          className="text-lg font-medium text-center px-4"
          style={{ color: 'var(--text-inverse)', fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </span>
        {category && (
          <span
            className="mt-1 text-center px-4"
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
