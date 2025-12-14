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

    // Get current viewers from Mux Data API
    // Using the monitoring endpoint to get real-time metrics
    const response = await mux.data.monitoring.listBreakdownValues(
      "current-viewers",
      {
        filters: [`live_stream_id:${liveStreamId}`],
        timeframe: ["1h"], // Last hour
      }
    );

    // Get the current concurrent viewers
    let currentViewers = 0;
    
    if (response.data && response.data.length > 0) {
      // The first item contains the most recent viewer count
      const latestData = response.data[0];
      currentViewers = latestData.value || 0;
    }

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
