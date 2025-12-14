import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

    // Initialize Breez SDK with user's mnemonic
    const { buildBreezSdk } = await import("@/lib/breezClient");
    const sdk = await buildBreezSdk(walletProfile.mnemonic);


    // Generate invoice
    const invoice = await sdk.receivePayment({
      paymentMethod: {
        type: "bolt11Invoice",
        description: `Gift of ${amountSats} sats`,
        amountSats: amountSats, // Should be number, not BigInt
      },
    }) as any;

    const bolt11 = invoice.invoice || invoice.bolt11 || invoice.paymentRequest || "";

    if (!bolt11) {
      console.error("Failed to extract invoice:", invoice);
      return NextResponse.json(
        { error: "Failed to generate invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invoice: bolt11,
      amountSats,
    });

  } catch (error: any) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
