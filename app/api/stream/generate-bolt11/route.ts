import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Generate a BOLT11 invoice for a gift payment
 * 
 * NOTE: This endpoint stores the invoice request in Convex.
 * The actual invoice generation happens client-side when the broadcaster's
 * wallet SDK receives a notification and generates the invoice.
 * 
 * For a simpler approach in development, we return a signal that the invoice
 * should be generated, and the client polls or uses websockets to get it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamId, amountSats, description } = body;

    console.log("📥 BOLT11 invoice request:", { streamId, amountSats });

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

    // For now, return an error explaining the limitation
    // In production, you'd have a service that manages wallet instances
    return NextResponse.json(
      {
        error: "Invoice generation requires broadcaster's wallet access",
        message: "This feature requires server-side wallet management or a different payment flow",
        suggestion: "Consider using Lightning Address or implementing a hosted wallet solution",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("❌ Error generating BOLT11:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
