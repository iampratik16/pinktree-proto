"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/ui/TransitionLink";
import Logo from "@/components/layout/Logo";
import GooeyNav from "@/components/layout/GooeyNav";
import { Instagram, TikTok, LinkedIn } from "@/components/ui/icons";
import { NAV, CONTACT } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Pinned at the top at all times; just track whether we've scrolled past the
    // hero so the bar can go from transparent to solid (it never hides).
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Routes that open with a dark, full-bleed hero need light header text
  // until the user scrolls into the solid paper header.
  const darkHero = pathname === "/" || /^\/work\/[^/]+$/.test(pathname);
  const overHero = darkHero && !scrolled;

  return (
    <>
      <header
        data-scrolled={scrolled}
        data-over-hero={overHero}
        className={`group/header fixed inset-x-0 top-0 transition-[background-color,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen
            ? // Above the menu overlay (z-900) so the close button + logo stay visible.
              "z-[1000] text-(--color-paper-on-dark)"
            // No backdrop-blur: this bar is fixed, so Safari re-blurs the
            // backdrop on every scroll frame (a top cause of janky scrolling).
            // At 96% opacity the blur was barely visible anyway.
            : "z-[800] text-(--color-ink) data-[over-hero=true]:text-(--color-paper-on-dark) data-[scrolled=true]:border-b data-[scrolled=true]:border-(--color-hairline) data-[scrolled=true]:bg-(--color-paper)/96"
        }`}
      >
        <div className="container-page flex h-[var(--header-h,5rem)] items-center justify-between">
          <TransitionLink href="/" aria-label="Pink Tree Media home">
            <Logo />
          </TransitionLink>

          <div className="hidden items-center gap-6 md:flex">
            <GooeyNav items={NAV} initialActiveIndex={-1} />
            <div className="flex items-center gap-4">
              <a
                href={CONTACT.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pink Tree Media on Instagram"
                className="transition-colors duration-500 hover:text-(--color-accent)"
              >
                <Instagram className="size-[1.35rem]" />
              </a>
              <a
                href={CONTACT.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pink Tree Media on TikTok"
                className="transition-colors duration-500 hover:text-(--color-accent)"
              >
                <TikTok className="size-[1.35rem]" />
              </a>
              <a
                href={CONTACT.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pink Tree Media on LinkedIn"
                className="transition-colors duration-500 hover:text-(--color-accent)"
              >
                <LinkedIn className="size-[1.35rem]" />
              </a>
            </div>
          </div>

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
              className="font-display text-5xl font-light tracking-tight transition-transform duration-500"
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
