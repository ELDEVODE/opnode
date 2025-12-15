import { NextRequest, NextResponse } from "next/server";
import { getCurrentViewers } from "@/lib/mux";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playbackId = searchParams.get("playbackId");

    if (!playbackId) {
      return NextResponse.json(
        { error: "playbackId is required" },
        { status: 400 }
      );
    }

    const viewers = await getCurrentViewers(playbackId);

    return NextResponse.json({ 
      viewers,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error in viewers API:", error);
    return NextResponse.json(
      { error: "Failed to fetch viewer count", viewers: 0 },
      { status: 500 }
    );
  }
}
