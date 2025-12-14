import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { liveStreamId } = await req.json();

    if (!liveStreamId) {
      return NextResponse.json(
        { error: "Missing liveStreamId" },
        { status: 400 }
      );
    }

    // TODO: Implement proper Mux Data API viewer tracking
    // The listBreakdownValues method is not available in the current SDK version
    // For now, return 0 viewers. This should be replaced with actual Mux metrics API calls
    // using mux.data.metrics.listBreakdownValues or a similar available method
    const currentViewers = 0;

    return NextResponse.json({
      currentViewers,
      liveStreamId,
    });
  } catch (error: any) {
    console.error("Error fetching Mux viewer data:", error);
    
    // Return 0 viewers on error to prevent breaking the UI
    return NextResponse.json({
      currentViewers: 0,
      error: error.message,
    });
  }
}
