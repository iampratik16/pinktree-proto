"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type Navigate = (href: string) => void;

const TransitionContext = createContext<Navigate | null>(null);

/** Hook used by TransitionLink to trigger a covered route change. */
export function useTransitionNavigate(): Navigate {
  const ctx = useContext(TransitionContext);
  // Fallback to a hard navigation if the provider is somehow absent.
  return ctx ?? ((href: string) => { window.location.href = href; });
}

const COVER_MS = 620;
const REVEAL_MS = 720;

/**
 * Cinematic cover/wipe between routes — no white flash. A warm panel sweeps up
 * to cover the viewport, the route swaps underneath, then the panel wipes away
 * revealing the new page. Under reduced motion it falls back to an instant push.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const targetRef = useRef<string | null>(null);
  const firstRender = useRef(true);

  const navigate = useCallback(
    (href: string) => {
      if (!href || href === pathname) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        router.push(href);
        return;
      }
      targetRef.current = href;
      setPhase("cover");
    },
    [pathname, router],
  );

  // When the cover finishes, perform the actual route change.
  useEffect(() => {
    if (phase !== "cover" || !targetRef.current) return;
    const id = window.setTimeout(() => {
      if (targetRef.current) router.push(targetRef.current);
    }, COVER_MS);
    return () => window.clearTimeout(id);
  }, [phase, router]);

  // Once the new route's pathname is live (we were covering), reveal it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (targetRef.current) {
      targetRef.current = null;
      setPhase("reveal");
      const id = window.setTimeout(() => setPhase("idle"), REVEAL_MS);
      return () => window.clearTimeout(id);
    }
  }, [pathname]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <div
        aria-hidden
        data-phase={phase}
        className="page-curtain"
      >
        <span className="page-curtain__mark">Pink Tree</span>
      </div>
    </TransitionContext.Provider>
  );
}
