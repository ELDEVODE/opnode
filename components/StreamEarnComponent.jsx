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
      className={`relative flex h-full w-full flex-col justify-center overflow-hidden rounded-[24px] md:rounded-[32px] px-5 py-5 md:pl-10 md:py-8 text-white shadow-[0_25px_45px_rgba(10,10,10,0.35)] ${className}`}
    >
      <div className="relative z-10 flex flex-1 flex-col gap-4 md:gap-6 max-w-[60%] md:max-w-[500px]">
        <p
          className="font-bold text-white leading-[1.1] text-[24px] sm:text-[32px] md:text-[56px]"
          style={{
            fontFamily: "Adecion, sans-serif",
            fontWeight: 700,
            fontStyle: "normal",
            lineHeight: "100%",
            letterSpacing: "-0.01em",
          }}
        >
          Stream, Earn,
          <br />
          Create, Share
        </p>
        <p className="text-[13px] sm:text-[15px] md:text-[22px] text-white font-normal px-1 md:px-4">
          Get paid while streaming
        </p>
        <button
          type="button"
          onClick={handleCta}
          className="mt-2 md:mt-4 w-fit rounded-full bg-white px-5 py-2 sm:px-6 sm:py-2.5 md:px-12 md:py-4 text-[12px] sm:text-[14px] md:text-[18px] font-bold text-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:translate-y-px"
        >
          {isWalletReady ? "Go Live" : "Connect Wallet"}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 -right-4 md:right-0 top-4 md:top-10 flex items-center pr-0">
        <div
          className="relative h-[180px] w-[190px] md:h-[278px] md:w-[295px] overflow-hidden rounded-3xl md:shadow-[-20px_35px_0_0_rgba(0,0,0,0.95)]"
        >
          <Image
            src="/images/8.svg"
            alt="Creators holding coins"
            fill
            sizes="(max-width: 768px) 190px, 295px"
            className="object-cover md:hidden"
            priority
          />
          <Image
            src="/images/glassEYE.svg"
            alt="Creators holding coins"
            fill
            sizes="(max-width: 768px) 190px, 295px"
            className="object-cover hidden md:block"
            priority
          />
        </div>
      </div>
    </section>
  );
}
