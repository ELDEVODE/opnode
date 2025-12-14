"use client";

import { useMemo } from "react";
import StreamCard from "@/components/StreamCard";
import StreamFilters from "@/components/StreamFilters";
import { useStreamFeedStore } from "@/stores/streamFeedStore";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function StreamFeed() {
  const { activeCategory, setActiveCategory } = useStreamFeedStore();

  // Fetch streams from Convex instead of mock data
  const liveStreams = useQuery(api.streams.getLiveStreams);

  const filteredStreams = useMemo(() => {
    if (!liveStreams) return [];

    if (activeCategory === "Following" || activeCategory === "Live") {
      return liveStreams;
    }
    
    return liveStreams.filter((stream) => stream.category === activeCategory);
  }, [liveStreams, activeCategory]);

  return (
    <section className="flex flex-col gap-6">
      <div className="hidden md:block">
        <StreamFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {!liveStreams ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#0C0C11] px-6 py-16 text-center text-sm text-white/60">
          Loading streams...
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#0C0C11] px-6 py-16 text-center text-sm text-white/60">
          Nothing to watch here yet. Pick another tab to continue exploring live
          streams.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStreams.map((stream) => (
            <StreamCard key={stream._id} stream={stream} />
          ))}
        </div>
      )}
    </section>
  );
}
