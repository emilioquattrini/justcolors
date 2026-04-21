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
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        loading="lazy"
      />
      
      {/* Overlay Ibrido:
        - Mobile: Sfumatura nera in basso (bg-gradient), sempre visibile (opacity-100), testo in basso (justify-end)
        - Desktop: Sfondo piatto scuro (md:bg-[#1a1a1a]/40), invisibile di base (md:opacity-0), appare al centro in hover
      */}
      <div
        className="absolute inset-0 flex flex-col items-center transition-all duration-300
                   justify-end pb-4 md:justify-center md:pb-0
                   bg-gradient-to-t from-[#1a1a1a]/80 via-[#1a1a1a]/20 to-transparent 
                   md:bg-none md:bg-[#1a1a1a]/40
                   opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <span
          className="text-sm md:text-lg font-medium text-center px-4 transition-transform duration-300"
          style={{ color: '#F0EDE8', fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </span>
        {category && (
          <span
            className="mt-0.5 md:mt-1 text-center px-4 text-[9px] md:text-[11px]"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
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
