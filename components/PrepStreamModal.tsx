"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";
import Image from "next/image";

interface PrepStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (data: {
    title: string;
    tags: string[];
    isPrivate: boolean;
    thumbnailUrl: string | null;
    thumbnailFile: File | null;
  }) => void;
}

export default function PrepStreamModal({
  isOpen,
  onClose,
  onNext,
}: PrepStreamModalProps) {
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    onNext({
      title,
      tags,
      isPrivate,
      thumbnailUrl,
      thumbnailFile,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black md:bg-transparent md:p-4">
      {/* Backdrop - Desktop only */}
      <div
        className="hidden md:block absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[440px] h-full md:h-[90vh] md:max-h-[800px] flex flex-col">
        <div className="relative bg-black rounded-none md:rounded-3xl flex-1 flex flex-col overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 z-10"
            aria-label="Close modal"
          >
            <HiX className="w-7 h-7 text-white" />
          </button>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-20 md:pt-16 pb-32 md:pb-6">
            {/* Top Section - Image and Text */}
            <div className="flex flex-col items-center mb-6 md:mb-8">
              {/* Decorative Image */}
              <div className="mb-6 md:mb-8">
                <div className="relative w-28 h-28 md:w-32 md:h-32">
                  <Image
                    src="/images/3d-glossy-shape 2.svg"
                    alt="3D Shape"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                  Prep Your Stream
                </h2>
                <p className="text-base md:text-lg text-white/50 font-normal">
                  Edit your stream info.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6 flex-1">
              {/* Title Input */}
              <div>
                <label className="block text-white text-base font-medium mb-3">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title your stream"
                  className="w-full bg-transparent border-b border-white/20 text-white text-lg pb-3 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-white text-base font-medium mb-3">
                  Tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Enter your own tags"
                  className="w-full bg-transparent border-b border-white/20 text-white text-lg pb-3 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white/70 transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Private Toggle */}
              <div className="flex items-start justify-between py-4">
                <div>
                  <h3 className="text-white text-base font-medium mb-1">
                    Private
                  </h3>
                  <p className="text-white/40 text-sm max-w-[280px]">
                    Toggle on if you only want a select set of people to have
                    access to your stream.
                  </p>
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                    isPrivate ? "bg-white" : "bg-white/20"
                  }`}
                  role="switch"
                  aria-checked={isPrivate}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-black transition duration-200 ease-in-out ${
                      isPrivate ? "translate-x-6" : "translate-x-1"
                    } mt-1`}
                  />
                </button>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-white text-base font-medium mb-4">
                  Thumbnail
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="block w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 transition-colors cursor-pointer overflow-hidden"
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Stream thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                        <div className="text-white/40 text-sm font-medium">
                          UPLOAD
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-center text-sm mt-3">
                  <span className="text-white/50">Similar streams earn </span>
                  <span className="text-[#FF9100] font-medium">
                    ~500 sats/hr
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Next Button at Bottom */}
          <div className="shrink-0 px-6 md:px-12 py-4 md:py-6 bg-black border-t border-white/5">
            <button
              onClick={handleNext}
              disabled={!title.trim()}
              className={`w-full py-5 md:py-6 px-8 rounded-full font-semibold text-lg md:text-xl transition-all ${
                title.trim()
                  ? "bg-white text-black hover:bg-white/90 active:scale-[0.98]"
                  : "bg-white/20 text-white/40 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
