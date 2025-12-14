import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId") as Id<"_storage">;

    if (!storageId) {
      return NextResponse.json(
        { error: "No storageId provided" },
        { status: 400 }
      );
    }

    const url = await convex.query(api.users.getFileUrl, { storageId });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Storage URL error:", error);
    return NextResponse.json(
      { error: "Failed to get storage URL" },
      { status: 500 }
    );
  }
}
