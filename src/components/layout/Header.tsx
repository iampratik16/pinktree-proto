"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/ui/TransitionLink";
import Logo from "@/components/layout/Logo";
import { NAV } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Hide on downward scroll past the hero; reveal on upward scroll.
      setHidden(y > 140 && y > last && !menuOpen);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  // Close menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    if (menuOpen) {
      window.__lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      window.__lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = useCallback(
    (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href)),
    [pathname],
  );

  // Routes that open with a dark, full-bleed hero need light header text
  // until the user scrolls into the solid paper header.
  const darkHero = pathname === "/" || /^\/work\/[^/]+$/.test(pathname);
  const overHero = darkHero && !scrolled;

  return (
    <>
      <header
        data-scrolled={scrolled}
        data-hidden={hidden}
        data-over-hero={overHero}
        className="group/header fixed inset-x-0 top-0 z-[800] text-(--color-ink) transition-[transform,background-color,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] data-[hidden=true]:-translate-y-full data-[over-hero=true]:text-(--color-paper-on-dark) data-[scrolled=true]:border-b data-[scrolled=true]:border-(--color-hairline) data-[scrolled=true]:bg-(--color-paper)/80 data-[scrolled=true]:backdrop-blur-md"
      >
        <div className="container-page flex h-[var(--header-h,5rem)] items-center justify-between">
          <TransitionLink href="/" aria-label="Pink Tree Media — home">
            <Logo />
          </TransitionLink>

          <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
            {NAV.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                data-active={isActive(item.href)}
                className="link-underline text-sm tracking-tight data-[active=true]:font-medium data-[active=true]:underline data-[active=true]:decoration-1 data-[active=true]:underline-offset-[6px]"
              >
                {item.label}
              </TransitionLink>
            ))}
            <TransitionLink
              href="/contact"
              className="rounded-full border border-current/30 px-5 py-2.5 text-sm tracking-tight transition-colors duration-500 hover:text-(--color-accent)"
            >
              Enquire
            </TransitionLink>
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            data-open={menuOpen}
            className="relative z-[1001] flex size-10 items-center justify-center data-[open=true]:text-(--color-paper-on-dark) md:hidden"
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <span
              className="absolute h-px w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: menuOpen ? "rotate(45deg)" : "translateY(-4px)" }}
            />
            <span
              className="absolute h-px w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: menuOpen ? "rotate(-45deg)" : "translateY(4px)" }}
            />
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        data-open={menuOpen}
        className="fixed inset-0 z-[900] flex flex-col bg-(--color-ink) text-(--color-paper-on-dark) transition-[opacity,visibility] duration-500 data-[open=false]:invisible data-[open=false]:opacity-0 data-[open=true]:visible data-[open=true]:opacity-100 md:hidden"
      >
        <nav
          aria-label="Mobile"
          className="container-page flex flex-1 flex-col justify-center gap-2"
        >
          {NAV.map((item, i) => (
            <TransitionLink
              key={item.href}
              href={item.href}
              className="font-[var(--font-display)] text-5xl font-light tracking-tight transition-transform duration-500"
              style={{
                transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                opacity: menuOpen ? 1 : 0,
                transitionDelay: `${menuOpen ? 120 + i * 70 : 0}ms`,
              }}
            >
              {item.label}
            </TransitionLink>
          ))}
        </nav>
      </div>
    </>
  );
}
