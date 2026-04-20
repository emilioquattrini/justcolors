interface SectionLabelProps {
  text: string;
  className?: string;
}

export default function SectionLabel({ text, className = '' }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 mb-8 ${className}`}>
      <span
        className="block w-8 h-px flex-shrink-0"
        style={{ backgroundColor: 'var(--border)' }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {text}
      </span>
    </div>
  );
}
