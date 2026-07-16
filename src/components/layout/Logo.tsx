import Image from "next/image";

type Props = {
  /** Height + any extra classes. Callers own the height so it never conflicts. */
  className?: string;
  /** Use the light variant (pink icon + cream text) for dark surfaces. */
  onDark?: boolean;
};

/**
 * Pink Tree Media brand lockup (client-supplied). Always shown in colour: on light
 * surfaces the full-colour PNG (dark wordmark); on dark surfaces / over the dark
 * hero the light variant (pink icon kept, wordmark recoloured to cream) so it stays
 * legible without going monochrome white.
 */
export default function Logo({ className = "h-14 sm:h-[4.25rem]", onDark = false }: Props) {
  const base = `w-auto shrink-0 ${className}`;

  if (onDark) {
    return (
      <Image src="/brand/logo-light.png" alt="Pink Tree Media" width={400} height={99} priority className={base} />
    );
  }

  // Header (auto): colour on the solid/light bar, light variant over the dark hero.
  return (
    <>
      <Image
        src="/brand/logo.png"
        alt="Pink Tree Media"
        width={400}
        height={99}
        priority
        className={`${base} group-data-[over-hero=true]/header:hidden`}
      />
      <Image
        src="/brand/logo-light.png"
        alt=""
        aria-hidden
        width={400}
        height={99}
        className={`${base} hidden group-data-[over-hero=true]/header:block`}
      />
    </>
  );
}
