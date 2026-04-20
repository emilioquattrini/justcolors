import React from 'react';

interface BioTextProps {
  text: string;
  links: Record<string, string>;
}

export default function BioText({ text, links }: BioTextProps) {
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Find all **bold** patterns
  const boldRegex = /\*\*(.+?)\*\*/g;
  const tokens: Array<{ type: 'text' | 'bold' | 'link'; value: string; url?: string; index: number; endIndex: number }> = [];

  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    tokens.push({ type: 'bold', value: match[1], index: match.index, endIndex: match.index + match[0].length });
  }

  // Check if any bold token should be a link
  for (const linkName of Object.keys(links)) {
    for (const token of tokens) {
      if (token.value === linkName) {
        token.type = 'link';
        token.url = links[linkName];
      }
    }
  }

  // Sort tokens by index
  tokens.sort((a, b) => a.index - b.index);

  let lastIndex = 0;
  for (const token of tokens) {
    if (token.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, token.index)}</span>);
    }

    if (token.type === 'link' && token.url) {
      parts.push(
        <a
          key={key++}
          href={token.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline hover:text-[var(--accent-coral)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {token.value}
        </a>
      );
    } else {
      parts.push(<strong key={key++}>{token.value}</strong>);
    }
    lastIndex = token.endIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts.length > 0 ? parts : text}</>;
}
