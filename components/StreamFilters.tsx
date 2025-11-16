"use client";

import type { StreamCategory } from "@/data/streams";
import { streamCategories } from "@/data/streams";
import { GoFlame } from "react-icons/go";

export type StreamFiltersProps = {
  activeCategory: StreamCategory;
  onCategoryChange: (category: StreamCategory) => void;
};

const badgeCategories: Record<string, "indicator" | "icon" | undefined> = {
  Live: "indicator",
  Recommended: "icon",
};

export default function StreamFilters({
  activeCategory,
  onCategoryChange,
}: StreamFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-3xl  px-4 py-4 backdrop-blur">
      {streamCategories.map((category) => {
        const badge = badgeCategories[category];
        const isActive = category === activeCategory;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
              isActive
                ? "border-white bg-white text-black"
                : "border-white/10 text-white/70 hover:text-white"
            }`}
            aria-pressed={isActive ? "true" : "false"}
          >
            {badge === "indicator" && (
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
            {badge === "icon" && <GoFlame className="h-4 w-4 text-[#FFB347]" />}
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
}
