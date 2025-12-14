"use client";

import Image from "next/image";

type CreatingProfileModalProps = {
  username: string;
};

export default function CreatingProfileModal({
  username,
}: CreatingProfileModalProps) {
  return (
    <div className="flex flex-col items-center text-center pt-8 h-full justify-between sm:justify-center">
      <div className="flex flex-col items-center">
        <div className="relative mb-6 h-24 w-24">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30 animate-spin [animation-duration:4s]"></div>
          <div className="absolute inset-1 overflow-hidden rounded-full bg-white">
            <Image
              src="/images/profile.png"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <h2 className="mb-8 text-xl text-white/80">
          {username} <span className="text-white/40">@opnode.io</span>
        </h2>

        <h3 className="mb-2 text-2xl font-bold">
          Creating profile
          <span className="inline-block animate-pulse">...</span>
        </h3>
        <p className="max-w-xs text-sm text-white/50">
          This might take a minute. Meanwhile, see how your OpNode profile
          differs from other socials.
        </p>
      </div>

      <div className="mt-8 sm:mt-12 w-full flex-1 flex items-end sm:items-center justify-center">
        <div className="relative w-full h-full min-h-[200px] sm:min-h-[150px]">
          <Image
            src="/images/info%20mobile.svg"
            alt="Info"
            fill
            className="object-contain sm:hidden"
          />
          <Image
            src="/images/info%20desktop.svg"
            alt="Info"
            fill
            className="object-contain hidden sm:block"
          />
        </div>
      </div>
    </div>
  );
}
