import Image from "next/image";
import type { Stream } from "@/data/streams";
import { PiEye, PiCheckCircleFill } from "react-icons/pi";
import type { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const viewerFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type StreamCardProps = {
  stream: Stream | Doc<"streams">;
};

// Type guard to check if it's a Convex stream
function isConvexStream(stream: Stream | Doc<"streams">): stream is Doc<"streams"> {
  return "_id" in stream;
}

export default function StreamCard({ stream }: StreamCardProps) {
  // If it's a Convex stream, fetch the host profile
  const hostProfile = useQuery(
    api.users.getProfile,
    isConvexStream(stream) ? { userId: stream.hostUserId } : "skip"
  );
  
  // Fetch thumbnail URL from storage if available
  const thumbnailUrl = useQuery(
    api.users.getFileUrl,
    isConvexStream(stream) && stream.thumbnailStorageId 
      ? { storageId: stream.thumbnailStorageId } 
      : "skip"
  );

  // Adapt Convex stream to match old interface
  const streamData = isConvexStream(stream)
    ? {
        id: stream._id,
        title: stream.title,
        description: stream.description || "",
        host: hostProfile?.displayName || hostProfile?.username || stream.hostUserId.substring(0, 8),
        hostAvatar: hostProfile?.avatarUrl || "/images/avatar1.png",
        engagementLabel: `${stream.totalGifts}+`,
        tags: stream.tags,
        viewerCount: stream.viewers,
        isLive: stream.isLive,
        thumbnail: thumbnailUrl || 
          (stream.muxPlaybackId
            ? `https://image.mux.com/${stream.muxPlaybackId}/thumbnail.png`
            : "/images/500l.png"),
        category: stream.category as any,
        isVerified: hostProfile?.isVerified || false,
      }
    : stream;

  const viewers = viewerFormatter.format(streamData.viewerCount);
  const engagementDisplay = streamData.engagementLabel.replace("+", " +");
  const streamUrl = `/stream/${streamData.id}`;

  return (
    <Link href={streamUrl}>
      <article className="mx-4 md:mx-0 flex h-full w-auto md:w-full flex-col gap-4 rounded-[32px] bg-white p-3 pb-5 text-[#0A0A0F] shadow-[0_25px_45px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-shadow cursor-pointer">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-gray-200">
          <Image
            src={streamData.thumbnail}
            alt={streamData.title}
            fill
            className="object-cover"
            priority={false}
          />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            {streamData.isLive && (
              <span className="flex items-center justify-center rounded-2xl bg-[#F04438] px-2.5 py-0.5 text-[12px] font-bold text-white">
                LIVE
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-2xl bg-black/30 px-2.5 py-1 text-[13px] font-medium text-white backdrop-blur-sm">
              <PiEye className="h-4 w-4" />
              {viewers}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 px-1">
          <div className="flex flex-1 items-start gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[#FFB347] ring-offset-2">
              {!streamData.hostAvatar || streamData.hostAvatar === "/images/avatar1.png" ? (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {streamData.host?.charAt(0).toUpperCase() || "U"}
                </div>
              ) : (
                <Image
                  src={streamData.hostAvatar}
                  alt={streamData.host}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[18px] font-bold leading-tight tracking-tight text-[#121117]">
                {streamData.title}
              </p>

              <div className="flex items-center gap-1.5 text-[15px] font-medium text-[#5A5565]">
                <span className="truncate">{streamData.host}</span>
                {streamData.isVerified && (
                  <PiCheckCircleFill className="h-4 w-4 shrink-0 text-[#FF3D71]" />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] font-medium text-[#FF9533]">
                {streamData.tags.map((tag, idx) => (
                  <span key={`${streamData.id}-${tag}-${idx}`}>#{tag}</span>
                ))}
                <span className="text-[#121117] font-semibold">
                  {engagementDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
