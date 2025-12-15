"use client";

import { useEffect, useState } from "react";

/**
 * Hook to get current Bitcoin price in USD
 * Updates every 60 seconds
 */
export function useBitcoinPrice() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Using CoinGecko free API (no API key needed)
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await response.json();
        setBtcPrice(data.bitcoin.usd);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch BTC price:", error);
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Update price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  return { btcPrice, loading };
}

/**
 * Convert sats to USD
 */
export function satsToUSD(sats: number, btcPrice: number | null): string {
  if (!btcPrice || !sats) return "$0.00";
  
  // 1 BTC = 100,000,000 sats
  const btcAmount = sats / 100_000_000;
  const usdAmount = btcAmount * btcPrice;
  
  return `$${usdAmount.toFixed(2)}`;
}
