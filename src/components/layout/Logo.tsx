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
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/mark.png"
        alt="Pink Tree Media"
        width={26}
        height={26}
        priority
        className="h-[26px] w-auto shrink-0"
      />
      {wordmark && (
        <span className="font-[var(--font-display)] text-[1.15rem] font-normal tracking-tight">
          Pink Tree
        </span>
      )}
    </span>
  );
}
