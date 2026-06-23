import type { SVGProps } from "react";

export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden {...props}>
      <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.84.98h.01A7.94 7.94 0 0 0 17.6 6.32ZM12.05 18.5h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09Zm3.62-4.94c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.51.64-.63.78-.23.15-.43.05a5.4 5.4 0 0 1-1.59-.98 6 6 0 0 1-1.1-1.37c-.11-.2 0-.3.09-.4l.3-.35c.1-.12.13-.2.2-.35a.36.36 0 0 0 0-.35c0-.1-.45-1.08-.62-1.48s-.33-.34-.45-.34h-.38a.74.74 0 0 0-.53.24 2.23 2.23 0 0 0-.69 1.65 3.87 3.87 0 0 0 .81 2.05 8.85 8.85 0 0 0 3.38 2.99c.47.2.84.32 1.13.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.33-.94s.17-.86.12-.94-.18-.14-.38-.24Z" />
    </svg>
  );
}

export function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
