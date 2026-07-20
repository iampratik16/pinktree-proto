"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { useTransitionNavigate } from "@/components/providers/PageTransition";

type Props = ComponentProps<typeof Link> & { href: string };

/**
 * Drop-in for next/link that routes through the page-transition curtain.
 * External links, modified clicks and new-tab clicks fall through to default
 * behaviour. Prefetches on hover/viewport like next/link.
 */
export default function TransitionLink({ href, onClick, ...props }: Props) {
  const navigate = useTransitionNavigate();
  const router = useRouter();

  const isInternal = href.startsWith("/") && !href.startsWith("//");

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (!isInternal) return;
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    navigate(href);
  }

  return (
    <Link
      href={href}
      // Don't prefetch every in-viewport route on load (that pulls each linked
      // page's RSC + chunks up front, competing with the critical load). We
      // prefetch on hover instead — navigation stays instant, first load is lighter.
      prefetch={false}
      onClick={handleClick}
      onMouseEnter={() => isInternal && router.prefetch(href)}
      {...props}
    />
  );
}
