"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { RiEdit2Line } from "react-icons/ri";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";

type ProfileDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  profile: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    lightningAddress?: string | null;
    bolt12Offer?: string | null;
  } | null;
};

export default function ProfileDropdown({
  isOpen,
  onClose,
  onEditProfile,
  profile,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { disconnect } = useEmbeddedWallet();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <>
      {/* Backdrop without blur to prevent navbar blur */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      <div
        ref={dropdownRef}
        className="absolute top-full right-0 mt-2 w-80 bg-[#1A1A1F] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
      >
        {/* Banner */}
        <div className="relative h-28 bg-gradient-to-br from-orange-500 to-pink-500">
          {profile.bannerUrl ? (
            <Image
              src={profile.bannerUrl}
              alt="Banner"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500" />
          )}
        </div>

        {/* Profile Info */}
        <div className="relative px-5 pb-5">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-[#1A1A1F] overflow-hidden bg-white shadow-xl">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.username}
                  width={96}
                  height={96}
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/images/profile.png"
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* Name and Username */}
          <div className="mb-4">
            <h3 className="text-white font-semibold text-xl">
              {profile.displayName}
            </h3>
            <p className="text-gray-400 text-sm">
              {profile.username}@opnode.io
            </p>
            {profile.lightningAddress && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                <span className="text-orange-500">⚡</span>
                <span className="font-mono truncate">{profile.lightningAddress}</span>
              </div>
            )}
            {profile.bolt12Offer && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                <span className="text-green-500">🔐</span>
                <span className="font-mono truncate" title={profile.bolt12Offer}>
                  {profile.bolt12Offer.substring(0, 30)}...
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-2" />

          {/* Menu Items */}
          <div className="space-y-1">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition text-white text-sm"
              onClick={() => {
                onEditProfile();
                onClose();
              }}
            >
              <RiEdit2Line className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition text-red-400 text-sm"
              onClick={handleDisconnect}
            >
              <IoLogOutOutline className="w-5 h-5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
