import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const existing = await convex.query(api.users.getProfileByUsername, {
      username,
    });

    return NextResponse.json({
      available: !existing,
      username,
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ available: true }, { status: 200 });
  }
}
