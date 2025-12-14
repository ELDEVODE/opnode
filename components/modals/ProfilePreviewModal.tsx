"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import {
  IoRefreshOutline,
  IoCloseOutline,
  IoImageOutline,
} from "react-icons/io5";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type ProfilePreviewModalProps = {
  username: string;
  onContinue: (
    avatarStorageId?: Id<"_storage">,
    bannerStorageId?: Id<"_storage">
  ) => void;
  isLoading?: boolean;
};

export default function ProfilePreviewModal({
  username,
  onContinue,
  isLoading = false,
}: ProfilePreviewModalProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarStorageId, setAvatarStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerStorageId, setBannerStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Convex storage
    setIsUploadingAvatar(true);
    try {
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await response.json();
      setAvatarStorageId(storageId);

      // Get the URL for preview
      const url = await fetch(`/api/storage-url?storageId=${storageId}`).then(
        (r) => r.json()
      );
      setAvatarPreview(url.url);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Upload failed. Please try again.");
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Convex storage
    setIsUploadingBanner(true);
    try {
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await response.json();
      setBannerStorageId(storageId);

      // Get the URL for preview
      const url = await fetch(`/api/storage-url?storageId=${storageId}`).then(
        (r) => r.json()
      );
      setBannerPreview(url.url);
    } catch (error) {
      console.error("Banner upload failed:", error);
      alert("Upload failed. Please try again.");
      setBannerPreview(null);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarStorageId(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = () => {
    setBannerPreview(null);
    setBannerStorageId(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  const handleContinue = () => {
    onContinue(avatarStorageId || undefined, bannerStorageId || undefined);
  };

  return (
    <div className="flex flex-col items-center text-center h-full w-full">
      {/* Banner Preview */}
      {bannerPreview && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerPreview}
            alt="Banner"
            fill
            unoptimized
            className="object-cover opacity-80"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center flex-1 justify-center w-full mt-10 sm:mt-0">
        {/* Avatar */}
        <div className="relative mb-6">
          <div className="h-32 w-32 sm:h-28 sm:w-28 rounded-full border-4 border-white overflow-hidden bg-white relative shrink-0">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Profile"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white">
                <IoImageOutline size={40} />
              </div>
            )}
          </div>

          {/* Upload Avatar Button (on hover) */}
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition"
            aria-label="Upload profile picture"
          >
            <span className="text-xs text-white font-medium">
              {isUploadingAvatar ? "Uploading..." : "Upload"}
            </span>
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            aria-label="Avatar image file"
          />
        </div>

        {/* Username */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-white mb-1">{username}</h2>
          <div className="h-px w-24 bg-white/20 mx-auto"></div>
        </div>

        {/* Action Buttons Row 1 */}
        <div className="flex items-center gap-3 mb-8 flex-wrap justify-center">
          {avatarPreview && (
            <>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-medium text-white/90 backdrop-blur-sm"
                onClick={() => avatarInputRef.current?.click()}
              >
                <IoRefreshOutline className="text-base" />
                CHANGE PICTURE
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-medium text-white/90 backdrop-blur-sm"
                onClick={handleRemoveAvatar}
              >
                <div className="border border-white/60 rounded-sm p-0.5">
                  <IoCloseOutline className="text-xs" />
                </div>
                REMOVE
              </button>
            </>
          )}

          {!avatarPreview && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-medium text-white/90 backdrop-blur-sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <IoImageOutline className="text-base" />
              ADD PICTURE
            </button>
          )}
        </div>

        {/* Action Buttons Row 2 - Banner */}
        <div className="mb-8">
          {!bannerPreview ? (
            <button
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-medium text-white/90 backdrop-blur-sm"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
            >
              {isUploadingBanner ? "UPLOADING..." : "ADD COVER"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-medium text-white/90 backdrop-blur-sm"
                onClick={() => bannerInputRef.current?.click()}
              >
                <IoRefreshOutline className="text-base" />
                CHANGE
              </button>
              <button
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-medium text-white/90 backdrop-blur-sm"
                onClick={handleRemoveBanner}
              >
                <div className="border border-white/60 rounded-sm p-0.5">
                  <IoCloseOutline className="text-xs" />
                </div>
                REMOVE
              </button>
            </div>
          )}
        </div>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className="hidden"
          aria-label="Banner image file"
        />
      </div>

      {/* Continue Button */}
      <div className="relative z-10 w-full mt-auto mb-8 sm:mb-0">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isLoading || isUploadingAvatar || isUploadingBanner}
          className="w-full rounded-full py-4 sm:py-3 text-lg sm:text-base font-bold transition disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200"
        >
          {isLoading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
