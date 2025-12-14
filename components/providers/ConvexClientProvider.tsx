"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";

export default function ConvexClientProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is missing. Update your environment variables."
      );
    }
    return new ConvexReactClient(convexUrl);
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
