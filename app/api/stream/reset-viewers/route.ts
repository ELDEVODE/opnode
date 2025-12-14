import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { streamId } = await req.json();

    if (!streamId) {
      return NextResponse.json(
        { error: "Missing streamId" },
        { status: 400 }
      );
    }

    // Reset viewers to 0
    await convex.mutation(api.streams.updateViewers, {
      streamId: streamId as Id<"streams">,
      viewers: 0,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting viewers:", error);
    return NextResponse.json(
      { error: "Failed to reset viewers" },
      { status: 500 }
    );
  }
}
