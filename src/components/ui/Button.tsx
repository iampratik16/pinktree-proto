import type { ReactNode } from "react";
import TransitionLink from "@/components/ui/TransitionLink";
import { ArrowRight } from "@/components/ui/icons";

type Variant = "solid" | "line" | "text";

const base =
  "group inline-flex items-center gap-3 font-medium tracking-tight transition-colors duration-500";

const variants: Record<Variant, string> = {
  solid:
    "rounded-full bg-(--color-ink) px-7 py-3.5 text-sm text-(--color-paper-on-dark) hover:bg-(--color-accent)",
  line:
    "rounded-full border border-(--color-ink)/25 px-7 py-3.5 text-sm text-(--color-ink) hover:border-(--color-accent) hover:text-(--color-accent)",
  text: "text-sm uppercase tracking-[0.12em] text-(--color-ink) hover:text-(--color-accent)",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  withArrow?: boolean;
  className?: string;
};

type AsLink = CommonProps & { href: string; external?: boolean };
type AsButton = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button(props: AsLink | AsButton) {
  const {
    children,
    variant = "solid",
    withArrow = false,
    className = "",
  } = props;
  const cls = `${base} ${variants[variant]} ${className}`;

  const inner = (
    <>
      <span>{children}</span>
      {withArrow && (
        <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
      )}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    if (props.external) {
      return (
        <a href={props.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {inner}
        </a>
      );
    }
    return (
      <TransitionLink href={props.href} className={cls}>
        {inner}
      </TransitionLink>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`${cls} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {inner}
    </button>
  );
}
