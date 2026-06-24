"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WorkCard from "@/components/work/WorkCard";
import { loadGsap } from "@/lib/gsap";
import { DISCIPLINES, type CaseStudy, type Discipline } from "@/content/schema";

type Filter = "All" | Discipline;

export default function WorkGrid({ studies }: { studies: CaseStudy[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const gridRef = useRef<HTMLUListElement>(null);

  // Filter pills with live counts (only disciplines that actually appear).
  const filters = useMemo(() => {
    const counts = new Map<Discipline, number>();
    for (const s of studies)
      for (const d of s.disciplines) counts.set(d, (counts.get(d) ?? 0) + 1);
    const present = DISCIPLINES.filter((d) => counts.has(d));
    return [
      { key: "All" as Filter, count: studies.length },
      ...present.map((d) => ({ key: d as Filter, count: counts.get(d)! })),
    ];
  }, [studies]);

  const visible = useMemo(
    () =>
      filter === "All"
        ? studies
        : studies.filter((s) => s.disciplines.includes(filter)),
    [studies, filter],
  );

  // Reveal-on-scroll for grid items + a stagger when the filter changes.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const items = Array.from(grid.querySelectorAll<HTMLElement>("[data-grid-item]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      items.forEach((el) => (el.style.opacity = "1"));
      return;
    }

    let revert = () => {};
    let cancelled = false;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        gsap.set(items, { opacity: 0, y: 48 });
        items.forEach((el, i) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            delay: (i % 2) * 0.08 + Math.floor(i / 2) * 0.04,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      }, grid);
      revert = () => ctx.revert();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, [filter, visible.length]);

  return (
    <div className="relative">
      {/* Filter pills */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-[var(--gutter)] mb-14 bg-(--color-paper)/80 px-[var(--gutter)] py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              data-active={filter === f.key}
              className="group inline-flex items-center gap-1.5 rounded-full border border-(--color-ink)/15 px-4 py-2 text-sm tracking-tight transition-colors duration-400 data-[active=true]:border-(--color-ink) data-[active=true]:bg-(--color-ink) data-[active=true]:text-(--color-paper-on-dark) hover:border-(--color-ink)/50"
            >
              {f.key}
              <span className="text-xs text-(--color-ink-soft) group-data-[active=true]:text-(--color-paper-on-dark)/60">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={gridRef}
        className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24"
      >
        {visible.map((study, i) => (
          <li
            key={study.slug}
            data-grid-item
            className={i % 3 === 0 ? "md:col-span-2" : ""}
          >
            <WorkCard
              study={study}
              index={studies.indexOf(study) + 1}
              feature={i % 3 === 0}
              headingLevel="h2"
              bare
              sizes={i % 3 === 0 ? "100vw" : "(min-width: 768px) 48vw, 100vw"}
            />
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="py-20 text-center text-(--color-ink-soft)">
          No projects in this discipline yet.
        </p>
      )}
    </div>
  );
}
