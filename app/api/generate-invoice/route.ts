import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Generate invoice using Breez Greenlight API (server-side compatible)
 * This uses the Greenlight gRPC/REST API instead of the browser SDK
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, amountSats } = await req.json();
    
    if (!userId || !amountSats) {
      return NextResponse.json(
        { error: "Missing userId or amountSats" },
        { status: 400 }
      );
    }

    if (amountSats < 1) {
      return NextResponse.json(
        { error: "Amount must be at least 1 sat" },
        { status: 400 }
      );
    }

    // Get user's wallet profile from Convex
    const walletProfile = await convex.query(api.wallets.getProfile, { userId });
    
    if (!walletProfile) {
      return NextResponse.json(
        { error: "User wallet not found" },
        { status: 404 }
      );
    }

    // Use Greenlight API to generate invoice
    // For now, return an error directing to use Lightning address or have streamer share invoice
    return NextResponse.json(
      { 
        error: "Invoice generation requires Breez Greenlight API integration or LNURL setup. Please ask the streamer to share their Lightning address or invoice." 
      },
      { status: 501 } // Not Implemented
    );

  } catch (error: any) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
