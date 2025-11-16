"use client";

import Image from "next/image";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";

export default function StreamEarnComponent({ className = "" }) {
  const { openModal } = useWalletModal();
  const { status } = useEmbeddedWallet();
  const isWalletReady = status === "ready";
  const gradientStyle = {
    background:
      "linear-gradient(130.18deg, #F3BE1D -2.77%, #FF35C9 66.36%, #A84DFF 119.09%)",
  };

  const handleCta = () => {
    if (isWalletReady) {
      console.info("Go Live clicked");
      return;
    }
    openModal();
  };

  return (
    <section
      style={gradientStyle}
      className={`relative flex h-full w-full flex-col justify-center overflow-hidden rounded-4xl pl-10 py-8 text-white shadow-[0_25px_45px_rgba(10,10,10,0.35)] ${className}`}
    >
      <div className="relative z-10 flex flex-1 flex-col gap-6 max-w-[500px]">
        <p
          className="font-bold text-white leading-[1.1]"
          style={{
            fontFamily: "Adecion, sans-serif",
            fontWeight: 700,
            fontStyle: "normal",
            fontSize: "56px",
            lineHeight: "100%",
            letterSpacing: "-0.01em",
          }}
        >
          Stream, Earn,
          <br />
          Create, Share
        </p>
        <p className="text-[22px] text-white font-normal px-4">
          {isWalletReady
            ? "Wallet connected. Start your stream and earn instantly."
            : "Get paid while streaming"}
        </p>
        <button
          type="button"
          onClick={handleCta}
          className="mt-4 w-fit rounded-full bg-white px-12 py-4 text-[18px] font-bold text-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:translate-y-px"
        >
          {isWalletReady ? "Go Live" : "Connect Wallet"}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 top-10 flex items-center pr-0">
        <div
          className="relative h-[278px] w-[295px] overflow-hidden rounded-3xl"
          style={{ boxShadow: "-20px 35px 0 0 rgba(0,0,0,0.95)" }}
        >
          <Image
            src="/images/glassEYE.svg"
            alt="Creators holding coins"
            fill
            sizes="295px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
