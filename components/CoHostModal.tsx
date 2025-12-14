"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import Image from "next/image";

interface CoHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Creator {
  id: number;
  username: string;
  avatar: string;
  verified: boolean;
}

// Mock data for recommended creators
const mockCreators: Creator[] = [
  {
    id: 1,
    username: "@Micale clarke",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    verified: true,
  },
  {
    id: 2,
    username: "@Surgio martin",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    verified: true,
  },
  {
    id: 3,
    username: "@Micale clarke",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    verified: true,
  },
  {
    id: 4,
    username: "@Surgio martin",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    verified: true,
  },
  {
    id: 5,
    username: "@Micale clarke",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    verified: true,
  },
];

export default function CoHostModal({ isOpen, onClose }: CoHostModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const filteredCreators = mockCreators.filter((creator) =>
    creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (id: number) => {
    setInvitedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[90%] lg:max-w-[500px] max-h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header with Icon */}
        <div className="relative flex flex-col items-center pt-6 pb-4 px-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <HiX className="w-6 h-6 text-white/70" />
          </button>

          <div className="w-20 h-20 mb-4 flex items-center justify-center">
            <Image
              src="/images/3d-glossy-shape 2.svg"
              alt="Co-host"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Title and Description */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Co-host with Creators
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Co-host with recommended creators and friends to make amazing
              content for your followers.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm pl-5 pr-5 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/40"
            />
          </div>

          {/* Creators List */}
          <div className="space-y-1">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={creator.avatar}
                      alt={creator.username}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-normal">
                      {creator.username}
                    </span>
                    {creator.verified && (
                      <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleInvite(creator.id)}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                    invitedUsers.has(creator.id)
                      ? "bg-[#2a2a2a] text-white/50 hover:bg-[#3a3a3a]"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {invitedUsers.has(creator.id) ? "Invited" : "Invite"}
                </button>
              </div>
            ))}
          </div>

          {filteredCreators.length === 0 && (
            <div className="text-center py-12 text-white/40 text-sm">
              No creators found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
