import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { deleteLiveStream } from "@/lib/mux";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamId } = body;

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    // Get stream to find Mux ID
    const stream = await convex.query(api.streams.getStream, {
      streamId: streamId as Id<"streams">,
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    // Mark stream as ended in Convex
    await convex.mutation(api.streams.endStream, {
      streamId: streamId as Id<"streams">,
    });

    // Delete Mux stream if it exists
    if (stream.muxStreamId) {
      try {
        await deleteLiveStream(stream.muxStreamId);
      } catch (error) {
        console.error("Error deleting Mux stream:", error);
        // Continue even if Mux deletion fails
      }
    }

    return NextResponse.json({ 
      success: true,
      finalStats: {
        viewers: stream.viewers,
        totalViews: stream.totalViews,
        totalEarnings: stream.totalEarnings,
        totalGifts: stream.totalGifts,
      }
    });
  } catch (error) {
    console.error("Error ending stream:", error);
    return NextResponse.json(
      { error: "Failed to end stream" },
      { status: 500 }
    );
  }
}
