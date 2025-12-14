"use client";

import Image from "next/image";

type WalletSuccessModalProps = {
  onCreateProfile: () => void;
};

export default function WalletSuccessModal({
  onCreateProfile,
}: WalletSuccessModalProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6 h-32 w-32">
        <Image
          src="/images/3d-glossy-shape%202.svg"
          alt="Success"
          fill
          className="object-contain"
        />
      </div>
      <h2 className="mb-2 text-2xl sm:text-3xl font-semibold">
        Wallet Connected Successfully
      </h2>
      <p className="mb-8 text-sm text-white/60">
        Proceed to creating your profile and start streaming
      </p>
      <button
        type="button"
        onClick={onCreateProfile}
        className="w-full rounded-full bg-white py-3.5 text-base font-bold text-black transition hover:bg-gray-200"
      >
        Create Profile
      </button>
    </div>
  );
}
