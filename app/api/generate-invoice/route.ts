import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amountSats, description } = body;

    if (!userId || !amountSats) {
      return NextResponse.json(
        { error: "userId and amountSats are required" },
        { status: 400 }
      );
    }

    // Get wallet profile for the user
    const walletProfile = await convex.query(api.wallets.getProfile, { userId });
    
    if (!walletProfile) {
      return NextResponse.json(
        { error: "User does not have a wallet set up" },
        { status: 404 }
      );
    }

    // For now, return a message that invoice generation needs to happen client-side
    // The streamer's wallet should generate the invoice, not server-side
    return NextResponse.json(
      {
        error: "Invoice generation must happen client-side with Breez SDK",
        message: "Streamer needs to generate invoice using their connected wallet"
      },
      { status: 501 }
    );

  } catch (error) {
    console.error("Error in generate-invoice:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
