"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { PiBellSimpleFill } from "react-icons/pi";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useNotificationPanel } from "@/components/providers/NotificationPanelProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getOrCreateWalletUserId } from "@/lib/userId";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function Navbar() {
  const { status } = useEmbeddedWallet();
  const { openPanel } = useNotificationPanel();
  const isReady = status === "ready";
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Only get userId after mount to avoid SSR issues
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getOrCreateWalletUserId());
    }
  }, []);

  const userProfile = useQuery(
    api.users.getProfile,
    isReady && userId ? { userId } : "skip"
  );

  return (
    <div className="bg-black px-6 py-4 flex items-center gap-8 border-b border-white/5">
      {/* Logo */}
      <Link href="/" className="cursor-pointer">
        <Image
          src="/images/Logo.svg"
          alt="OPNODE LOGO"
          width={364}
          height={43.07}
          className="w-auto h-8"
        />
      </Link>

      {/* Search Bar + Actions */}
      <div className="flex flex-1 items-center gap-3 justify-end">
        <div className="relative flex-1 max-w-2xl mr-auto">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#131313] text-gray-200 rounded-full px-6 py-3 border border-[#2A2828] focus:outline-none focus:border-gray-800 placeholder:text-[#ACACAC] text-sm"
          />
        </div>

        <Link
          href="/explore"
          className="bg-[#2C2C35] w-12 h-12 hover:bg-gray-700 rounded-full flex justify-center items-center transition-colors"
          aria-label="Explore"
        >
          <HiOutlineMagnifyingGlass className="w-5 h-5 text-white/70" />
        </Link>

        <button
          onClick={openPanel}
          className="bg-[#2C2C35] w-12 h-12 hover:bg-gray-700 rounded-full flex justify-center items-center transition-colors"
          aria-label="Notifications"
        >
          <PiBellSimpleFill className="w-5 h-5 text-white/70" />
        </button>

        {isReady && (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#2A2828] hover:border-white/20 transition-colors"
              aria-label="Profile"
            >
              {userProfile?.avatarUrl ? (
                <Image
                  src={userProfile.avatarUrl}
                  alt={userProfile.username || "Profile"}
                  fill
                  sizes="50px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {userProfile?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </button>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              profile={
                userProfile
                  ? {
                      username: userProfile.username,
                      displayName: userProfile.displayName,
                      avatarUrl: userProfile.avatarUrl,
                      bannerUrl: userProfile.bannerUrl,
                    }
                  : null
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
