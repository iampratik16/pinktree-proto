"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import WorkCard from "@/components/work/WorkCard";
import GooeyNav from "@/components/layout/GooeyNav";
import { loadGsap } from "@/lib/gsap";
import { DISCIPLINES, type CaseStudy, type Discipline } from "@/content/schema";

type Filter = "All" | Discipline;

// GooeyNav is vendored (@ts-nocheck); type its props for this filter usage.
const FilterNav = GooeyNav as unknown as ComponentType<{
  items: { label: string; href: string }[];
  onSelect?: (index: number) => void;
  initialActiveIndex?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
}>;

export default function WorkGrid({ studies }: { studies: CaseStudy[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const gridRef = useRef<HTMLDivElement>(null);

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

  // Cuberto-style asymmetric masonry: two columns, the right one dropped down so
  // the cards interlock rather than sit on a rigid grid line.
  const columns: CaseStudy[][] = [[], []];
  visible.forEach((s, i) => columns[i % 2].push(s));

  return (
    <div className="relative">
      {/* Filter — gooey nav (the same effect as the header) */}
      <div className="sticky top-[var(--header-h)] z-20 mb-16 flex justify-start overflow-x-auto py-4">
        <FilterNav
          items={filters.map((f) => ({ label: f.key, href: "#" }))}
          onSelect={(index) => setFilter(filters[index].key)}
          initialActiveIndex={0}
          particleCount={12}
          particleDistances={[60, 10]}
          particleR={80}
        />
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-x-[clamp(1.5rem,5vw,5.5rem)] md:grid-cols-2"
      >
        {columns.map((col, c) => (
          <div
            key={c}
            className={`flex flex-col gap-[clamp(4rem,10vh,9rem)] ${
              c === 1 ? "md:mt-[16vh]" : ""
            }`}
          >
            {col.map((study, i) => (
              <div key={study.slug} data-grid-item>
                <WorkCard
                  study={study}
                  index={studies.indexOf(study) + 1}
                  headingLevel="h2"
                  bare
                  noBend
                  hoverPlay
                  ratio={i % 2 === 0 ? "4 / 5" : "5 / 6"}
                  sizes="(min-width: 768px) 46vw, 100vw"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-20 text-center text-(--color-ink-soft)">
          No projects in this discipline yet.
        </p>
      )}
    </div>
  );
}
