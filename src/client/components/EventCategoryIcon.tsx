interface EventCategoryIconProps {
  title: string;
}

export function EventCategoryIcon({ title }: EventCategoryIconProps) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("grocery") || lowerTitle.includes("market")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6h15l-1.5 8h-11L6 4H3" />
        <circle cx="10" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
      </svg>
    );
  }

  if (lowerTitle.includes("lunch") || lowerTitle.includes("dinner") || lowerTitle.includes("brunch")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 3v8M5 3v8M5 7h3M14 3v18M19 3c0 3-1 5-3 6v12" />
      </svg>
    );
  }

  if (lowerTitle.includes("walk") || lowerTitle.includes("run") || lowerTitle.includes("soccer") || lowerTitle.includes("yoga")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="14" cy="5" r="2" />
        <path d="M12 22l1.5-5-3-3 2-4 3 2 3-.5M8 13l4 1M6 20l3-4" />
      </svg>
    );
  }

  if (lowerTitle.includes("team") || lowerTitle.includes("review") || lowerTitle.includes("client") || lowerTitle.includes("budget")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v10H4zM8 20h8M12 16v4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-8 0v1H6a2 2 0 0 0-2 2v5h16v-5a2 2 0 0 0-2-2h-2v-1Z" />
      <path d="M9 12V9a3 3 0 0 1 6 0v3" />
    </svg>
  );
}
