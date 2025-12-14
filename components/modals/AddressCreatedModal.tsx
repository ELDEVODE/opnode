"use client";

import Image from "next/image";

type AddressCreatedModalProps = {
  username: string;
  onContinue: () => void;
};

export default function AddressCreatedModal({
  username,
  onContinue,
}: AddressCreatedModalProps) {
  return (
    <div className="flex flex-col items-center text-center h-full justify-center sm:justify-center">
      <div className="flex flex-col items-center flex-1 justify-center sm:flex-none">
        <div className="relative mb-2 sm:mb-6 h-32 w-32 sm:h-28 sm:w-28">
          <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
          <div className="absolute inset-2 overflow-hidden rounded-full bg-white">
            <Image
              src="/images/profile_account_created.svg"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          {/* <div className="absolute -bottom-1 -right-1 h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-[#0B0B10]">
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div> */}
        </div>

        <h2 className="mb-16 sm:mb-4 text-2xl sm:text-xl text-white/80">
          {username} <span className="text-white/40">@opnode.io</span>
        </h2>

        <h3 className="mb-4 sm:mb-3 text-4xl sm:text-xl font-bold">
          Address Created
        </h3>
        <p className="max-w-md sm:max-w-sm text-base sm:text-sm text-white/60 leading-relaxed px-4">
          You've claimed access to this username.
          <br />
          You now have an account and a lightning address to receive payments.
        </p>
      </div>

      <div className="mb-8 sm:mb-0 mt-8 sm:mt-6 w-full">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-full py-5 sm:py-3 text-xl sm:text-base font-bold transition bg-white text-black hover:bg-gray-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
