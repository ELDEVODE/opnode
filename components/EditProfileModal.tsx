"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FiUpload } from "react-icons/fi";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getOrCreateWalletUserId } from "@/lib/userId";
import { toast } from "sonner";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EditProfileModal({
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const userId = getOrCreateWalletUserId();
  
  const userProfile = useQuery(
    api.users.getProfile,
    userId ? { userId } : "skip"
  );

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const upsertProfile = useMutation(api.users.upsertProfile);

  // Load current profile data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setBio(userProfile.bio || "");
      setAvatarPreview(userProfile.avatarUrl || null);
      setBannerPreview(userProfile.bannerUrl || null);
    }
  }, [userProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    setIsSaving(true);
    try {
      let avatarStorageId: Id<"_storage"> | undefined;
      let bannerStorageId: Id<"_storage"> | undefined;

      // Upload new images if selected
      if (avatarFile) {
        avatarStorageId = await uploadFile(avatarFile);
      }
      if (bannerFile) {
        bannerStorageId = await uploadFile(bannerFile);
      }

      // Update profile
      await upsertProfile({
        userId,
        username: userProfile?.username || `user_${userId.slice(0, 8)}`,
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        avatarStorageId: avatarStorageId || userProfile?.avatarStorageId,
        bannerStorageId: bannerStorageId || userProfile?.bannerStorageId,
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center sm:px-4 bg-[#0B0B10] sm:bg-black/70 sm:backdrop-blur-md">
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-[#0B0B10] px-6 py-8 sm:px-8 sm:py-10 text-white sm:rounded-4xl sm:shadow-[0_35px_60px_rgba(0,0,0,0.35)] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1B21] text-white/80 transition hover:bg-white/20 z-10"
        >
          <IoClose className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6 h-24 w-24 sm:h-32 sm:w-32">
            <Image
              src="/images/3d-glossy-shape%202.svg"
              alt="Edit Profile"
              fill
              className="object-contain"
            />
          </div>
          
          <h2 className="mb-2 text-2xl sm:text-3xl font-semibold">
            Edit Profile
          </h2>
          <p className="mb-6 sm:mb-8 text-sm text-white/60">
            Update your profile information
          </p>

          <div className="w-full space-y-6">
            {/* Banner Upload */}
            <div>
              <label className="block text-left text-sm font-medium text-white/70 mb-2">
                Banner Image
              </label>
              <div className="relative h-32 bg-[#1A1A1F] border border-white/10 rounded-2xl overflow-hidden">
                {bannerPreview ? (
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500" />
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition cursor-pointer">
                  <FiUpload className="w-8 h-8" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-left text-sm font-medium text-white/70 mb-2">
                Profile Picture
              </label>
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#1A1A1F] bg-white">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/images/profile.png"
                      alt="Default avatar"
                      fill
                      className="object-cover"
                    />
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition cursor-pointer">
                    <FiUpload className="w-6 h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-left text-sm font-medium text-white/70 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Username (readonly) */}
            <div>
              <label className="block text-left text-sm font-medium text-white/70 mb-2">
                Username
              </label>
              <input
                type="text"
                value={`${userProfile?.username || ""}@opnode.io`}
                readOnly
                className="w-full bg-[#1A1A1F]/50 border border-white/10 rounded-2xl px-4 py-3 text-white/60 cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-left text-sm font-medium text-white/70 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 py-3.5 text-base font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-full bg-white py-3.5 text-base font-bold text-black transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
