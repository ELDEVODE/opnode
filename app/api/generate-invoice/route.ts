import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamId, amountSats } = body;

    console.log("📥 Invoice generation request:", { streamId, amountSats });

    if (!streamId || !amountSats) {
      return NextResponse.json(
        { error: "streamId and amountSats are required" },
        { status: 400 }
      );
    }

    // Get stream to find the host
    const stream = await convex.query(api.streams.getStream, {
      streamId: streamId as Id<"streams">,
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    console.log("📡 Stream found, host:", stream.hostUserId);

    // Get host's wallet profile
    const walletProfile = await convex.query(api.wallets.getProfile, {
      userId: stream.hostUserId,
    });

    if (!walletProfile) {
      return NextResponse.json(
        { error: "Streamer does not have a wallet set up" },
        { status: 404 }
      );
    }

    console.log("✅ Wallet profile found");

    // Return success - the actual invoice generation will happen client-side
    // We just needed to verify the stream and wallet exist
    return NextResponse.json({
      success: true,
      hostUserId: stream.hostUserId,
      message: "Ready to generate invoice client-side",
    });
  } catch (error) {
    console.error("❌ Error in generate-invoice:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
