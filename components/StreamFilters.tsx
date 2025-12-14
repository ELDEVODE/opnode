"use client";

import type { StreamCategory } from "@/data/streams";
import { streamCategories } from "@/data/streams";
import { GoFlame } from "react-icons/go";

export type StreamFiltersProps = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
};

const badgeCategories: Record<string, "indicator" | "icon" | undefined> = {
  Live: "indicator",
  Recommended: "icon",
};

export default function StreamFilters({
  selectedCategory,
  onCategoryChange,
  className = "",
}: StreamFiltersProps) {
  return (
    <div className={`flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-4 md:gap-3 rounded-3xl px-2 md:px-4 py-2 md:py-4 md:backdrop-blur w-full ${className}`}>
      {["All", "Live", "Gaming", "Music", "Talk", "Tech"].map((category) => {
        const badge = badgeCategories[category];
        const isActive = category === selectedCategory;

        if (category === "Live") {
           return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-semibold transition ${
                isActive
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#FF3D71]" />
              <span>{category}</span>
            </button>
           )
        }

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-medium transition ${
              isActive
                ? "bg-white text-black font-semibold"
                : "text-[#A0A0A8] hover:text-white hover:bg-white/5"
            }`}
            aria-pressed={isActive ? "true" : "false"}
          >
            {badge === "icon" && <GoFlame className={`h-4 w-4 ${isActive ? "text-[#FFB347]" : "text-[#FFB347]/70"}`} />}
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
}
