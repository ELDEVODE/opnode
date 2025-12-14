"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

type ChooseUsernameModalProps = {
  username: string;
  usernameStatus: "idle" | "checking" | "available" | "unavailable";
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContinue: () => void;
  onStatusChange?: (
    status: "idle" | "checking" | "available" | "unavailable"
  ) => void;
};

export default function ChooseUsernameModal({
  username,
  usernameStatus,
  onUsernameChange,
  onContinue,
  onStatusChange,
}: ChooseUsernameModalProps) {
  const isAvailable = useQuery(
    api.users.checkUsernameAvailable,
    username && username.length >= 3 ? { username } : "skip"
  );

  // Update parent component when availability changes
  useEffect(() => {
    if (username.length < 3) {
      onStatusChange?.("idle");
    } else if (isAvailable === undefined) {
      onStatusChange?.("checking");
    } else if (isAvailable) {
      onStatusChange?.("available");
    } else {
      onStatusChange?.("unavailable");
    }
  }, [isAvailable, username.length, onStatusChange]);

  return (
    <div className="flex flex-col items-center text-center h-full justify-center sm:justify-center sm:pt-4">
      <div className="w-full flex-1 flex flex-col justify-center sm:flex-none">
        <h2 className="mb-16 sm:mb-12 text-4xl sm:text-3xl font-bold leading-tight">
          Choose your
          <br /> username
        </h2>

        <div className="relative mb-8 sm:mb-6 w-full flex justify-center">
          <div className="text-center border-b border-white/20 inline-block">
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={onUsernameChange}
              className="inline bg-transparent py-2 sm:py-2 text-center text-2xl sm:text-lg font-medium text-white placeholder-white/30 focus:outline-none w-auto min-w-[120px] sm:min-w-[100px] max-w-[150px] sm:max-w-[120px] border-none"
              autoFocus
            />
            <span className="text-2xl sm:text-lg text-white/40 ml-1">
              @opnode.io
            </span>
          </div>
        </div>

        <div className="mb-0 flex flex-col items-center gap-2 mt-6 sm:mt-4 min-h-8 sm:min-h-6">
          {usernameStatus === "checking" && (
            <p className="text-lg sm:text-sm text-yellow-500 flex items-center gap-1.5">
              <span>⏳</span> Checking availability...
            </p>
          )}
          {usernameStatus === "unavailable" && (
            <p className="text-lg sm:text-sm text-red-500 flex items-center gap-1.5">
              <span>✕</span> Username is unavailable
            </p>
          )}
          {usernameStatus === "available" && (
            <p className="text-lg sm:text-sm text-green-500 flex items-center gap-1.5">
              <span>✓</span> Username is available
            </p>
          )}
        </div>
      </div>

      <div className="mb-8 sm:mb-0 mt-8 sm:mt-6 w-full">
        <button
          type="button"
          disabled={usernameStatus !== "available"}
          onClick={onContinue}
          className={`w-full rounded-full py-5 sm:py-4  text-xl sm:text-base font-bold transition ${
            usernameStatus === "available"
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-[#3A3A42] text-white/50 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
