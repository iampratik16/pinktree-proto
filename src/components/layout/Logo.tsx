type Props = { className?: string };

/**
 * Pink Tree wordmark with a minimal canopy glyph. Uses currentColor so it
 * inverts cleanly on dark sections.
 */
export default function Logo({ className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="20"
        height="22"
        viewBox="0 0 20 22"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M10 1c3.6 0 6 2.4 6 5.3 0 2-1.2 3.5-2.7 4.3 1.9.5 3.2 2 3.2 3.9 0 2.5-2.3 4.2-5.3 4.2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M10 1C6.4 1 4 3.4 4 6.3c0 2 1.2 3.5 2.7 4.3C4.8 11.1 3.5 12.6 3.5 14.5c0 2.5 2.3 4.2 5.3 4.2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M10 9v12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="font-[var(--font-display)] text-[1.15rem] font-normal tracking-tight">
        Pink Tree
      </span>
    </span>
  );
}
