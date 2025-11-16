import Image from "next/image";
import type { Stream } from "@/data/streams";
import { PiEye, PiCheckCircleFill } from "react-icons/pi";

const viewerFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type StreamCardProps = {
  stream: Stream;
};

export default function StreamCard({ stream }: StreamCardProps) {
  const viewers = viewerFormatter.format(stream.viewerCount);
  const engagementDisplay = stream.engagementLabel.replace("+", " +");

  return (
    <article className="mx-auto flex h-full w-full flex-col gap-4 rounded-4xl border border-[#F4F2F9] bg-white p-3 pb-4 text-[#0A0A0F] shadow-[0_25px_45px_rgba(0,0,0,0.2)]">
      <div className="relative min-h-[366px] w-full overflow-hidden rounded-3xl bg-gray-200">
        <Image
          src={stream.thumbnail}
          alt={stream.title}
          fill
          className="rounded-3xl object-cover"
          //   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          priority={false}
        />
        {stream.isLive && (
          <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-[#FF3D71] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
            Live
            <span className="text-white/70">•</span>
          </span>
        )}
        <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/70 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm">
          <PiEye className="h-4 w-4" />
          {viewers}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-2">
        <div className="flex flex-1 items-start gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-4 ring-[#FFB347]/30">
            <Image
              src={stream.hostAvatar}
              alt={stream.host}
              fill
              className="object-cover rounded-lg"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <p className="min-h-[46px] text-[17px] font-semibold uppercase leading-snug tracking-[-0.01em] text-[#121117]">
              {stream.title}
            </p>

            <div className="flex min-h-6 items-center gap-1.5 text-sm font-semibold text-[#5A5565]">
              <span className="truncate text-[#2C2633]">{stream.host}</span>
              {stream.isVerified && (
                <PiCheckCircleFill className="h-4 w-4 shrink-0 text-[#FF2DD4]" />
              )}
            </div>

            <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 text-[13px] font-semibold">
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#FF9533]">
                {stream.tags.map((tag) => (
                  <span key={`${stream.id}-${tag}`}>#{tag}</span>
                ))}
                <span className=" text-[14px] text-[#8C8A96]">
                  {engagementDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
