"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StreamCard from "@/components/StreamCard";
import StreamFilters from "@/components/StreamFilters";
import Navbar from "@/components/nav";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Get all live streams (this is safe for SSR as it's just a query)
  const allStreams = useQuery(api.streams.getLiveStreams, {});
  
  // Filter streams based on search and category
  const filteredStreams = allStreams?.filter(stream => {
    const matchesSearch = searchQuery === "" || 
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || stream.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Live Streams</h1>
          <p className="text-white/60">Discover amazing live content</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search streams, tags..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <StreamFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-white/60 text-sm">
            {filteredStreams?.length || 0} live stream{filteredStreams?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stream Grid */}
        {filteredStreams && filteredStreams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredStreams.map(stream => (
              <StreamCard key={stream._id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No streams found</h3>
            <p className="text-white/60">
              {searchQuery ? "Try a different search term" : "No one is live right now"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
