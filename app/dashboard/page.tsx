import BalanceComponent from "@/components/balanceComponent";
import StreamEarnComponent from "@/components/StreamEarnComponent";
import StreamFeed from "@/components/StreamFeed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Discover live streams, earn and send sats on OPNODE.",
  openGraph: {
    title: "Dashboard - OPNODE",
    description: "Discover live streams, earn and send sats.",
    images: ["/images/500l.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - OPNODE",
    description: "Discover live streams, earn and send sats.",
    images: ["/images/500l.png"],
  },
};


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 pr-0 md:pr-8 pb-28 md:pb-0">
      <div className="flex w-full flex-col md:flex-row items-stretch gap-6">
        <div className="hidden md:flex min-w-lg max-w-[420px] flex-none">
          <BalanceComponent className="h-full" />
        </div>
        <div className="flex-1 min-w-0 px-3">
          <StreamEarnComponent className="h-full" />
        </div>
      </div>

      <StreamFeed />
    </div>
  );
}
