"use client";

import { useEffect, useState } from "react";

interface GoLiveCountdownProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function GoLiveCountdown({
  isActive,
  onComplete,
}: GoLiveCountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isActive) {
      setCount(3);
      return;
    }

    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, count, onComplete]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {count > 0 ? (
        <div className="flex items-center justify-center">
          <span className="text-[200px] md:text-[300px] lg:text-[400px] font-bold text-white animate-scale-in">
            {count}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <span className="text-6xl md:text-7xl lg:text-8xl font-bold text-white animate-fade-in">
            Going Live...
          </span>
        </div>
      )}
    </div>
  );
}
