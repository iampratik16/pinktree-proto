"use client";

import { useEffect, useState } from "react";
import TransitionLink from "@/components/ui/TransitionLink";
import { WhatsApp, ArrowUpRight } from "@/components/ui/icons";
import { whatsappHref } from "@/lib/site";

/**
 * Site-wide floating actions: Quick Enquiry + WhatsApp (client requirement).
 * Appear after a small scroll so they never compete with the hero. Tasteful,
 * low-clutter — labels expand on hover (pointer devices).
 */
export default function FloatingActions() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-shown={shown}
      className="fixed bottom-5 right-5 z-[700] flex flex-col items-end gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] data-[shown=false]:pointer-events-none data-[shown=false]:translate-y-4 data-[shown=false]:opacity-0 sm:bottom-8 sm:right-8"
    >
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Pink Tree Media on WhatsApp"
        className="group flex items-center gap-0 overflow-hidden rounded-full bg-(--color-ink) py-3.5 pl-4 pr-4 text-(--color-paper-on-dark) shadow-[0_8px_30px_rgba(20,17,15,0.18)] transition-colors duration-500 hover:bg-[#1f8a5b]"
      >
        <WhatsApp className="size-5 shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm tracking-tight opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:ml-2.5 group-hover:max-w-[8rem] group-hover:opacity-100">
          WhatsApp
        </span>
      </a>

      <TransitionLink
        href="/contact"
        aria-label="Quick enquiry"
        className="group flex items-center gap-0 overflow-hidden rounded-full bg-(--color-accent) py-3.5 pl-4 pr-4 text-(--color-paper) shadow-[0_8px_30px_rgba(168,107,114,0.3)] transition-colors duration-500 hover:bg-(--color-ink)"
      >
        <ArrowUpRight className="size-5 shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm tracking-tight opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:ml-2.5 group-hover:max-w-[8rem] group-hover:opacity-100">
          Enquire
        </span>
      </TransitionLink>
    </div>
  );
}
