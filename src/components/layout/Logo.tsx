import Image from "next/image";

type Props = {
  className?: string;
  /** Show the wordmark text alongside the mark. */
  wordmark?: boolean;
};

/**
 * Pink Tree brand lockup: the rosewood tree mark (client-supplied) + optional
 * wordmark. The mark is a transparent PNG so it sits on light or dark sections;
 * the wordmark uses currentColor and adapts with the header theme.
 */
export default function Logo({ className = "", wordmark = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src="/brand/mark.png"
        alt="Pink Tree Media"
        width={48}
        height={48}
        priority
        className="h-12 w-auto shrink-0"
      />
      {wordmark && (
        <span className="font-display text-[1.6rem] font-semibold tracking-tight">
          Pink Tree
        </span>
      )}
    </span>
  );
}
