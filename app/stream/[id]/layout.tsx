import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // Fetch stream data from Convex
    const stream = await fetchQuery(api.streams.getStream, {
      streamId: id as Id<"streams">,
    });

    if (!stream) {
      return {
        title: "Stream Not Found",
        description: "This stream could not be found.",
      };
    }

    // Fetch host profile
    const hostProfile = await fetchQuery(api.users.getProfile, {
      userId: stream.hostUserId,
    });

    const streamTitle = stream.title;
    const streamDescription = stream.description || `Watch ${hostProfile?.username || "this"} live on OPNODE`;
    const hostName = hostProfile?.username || "Unknown";
    const viewerCount = stream.viewers || 0;
    const isLive = stream.isLive;
    
    // Get thumbnail URL from storage if available
    let thumbnailUrl = "/images/500l.png"; // Default thumbnail
    if (stream.thumbnailStorageId) {
      // Use the storage URL API route
      thumbnailUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/storage-url?storageId=${stream.thumbnailStorageId}`;
    }

    const streamUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/stream/${id}`;

    return {
      title: streamTitle,
      description: streamDescription,
      
      openGraph: {
        type: "video.other",
        url: streamUrl,
        title: streamTitle,
        description: streamDescription,
        siteName: "OPNODE",
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: streamTitle,
          },
        ],
        videos: stream.muxPlaybackId
          ? [
              {
                url: `https://stream.mux.com/${stream.muxPlaybackId}.m3u8`,
                type: "application/x-mpegURL",
              },
            ]
          : undefined,
      },
      
      twitter: {
        card: "summary_large_image",
        title: streamTitle,
        description: streamDescription,
        images: [thumbnailUrl],
        creator: `@${hostName}`,
      },
      
      other: {
        "og:video:type": "application/x-mpegURL",
        "og:video:width": "1920",
        "og:video:height": "1080",
        "og:live_stream": isLive ? "true" : "false",
        ...(stream.startedAt && stream.endedAt 
          ? { "video:duration": String(Math.floor((stream.endedAt - stream.startedAt) / 1000)) }
          : {}),
      },
      
      alternates: {
        canonical: streamUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    return {
      title: "OPNODE Stream",
      description: "Watch live streams on OPNODE",
    };
  }
}

export default function StreamLayout({ children }: Props) {
  return <>{children}</>;
}
