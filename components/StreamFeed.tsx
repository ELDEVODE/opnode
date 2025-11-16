"use client";

import { useMemo, useState } from "react";
import StreamCard from "@/components/StreamCard";
import StreamFilters from "@/components/StreamFilters";
import type { StreamCategory } from "@/data/streams";
import { streams } from "@/data/streams";

export default function StreamFeed() {
  const [activeCategory, setActiveCategory] = useState<StreamCategory>("Live");

  const filteredStreams = useMemo(() => {
    if (activeCategory === "Following") {
      return streams;
    }
    return streams.filter((stream) => stream.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="flex flex-col gap-6">
      <StreamFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {filteredStreams.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#0C0C11] px-6 py-16 text-center text-sm text-white/60">
          Nothing to watch here yet. Pick another tab to continue exploring live
          streams.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStreams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}
    </section>
  );
}
