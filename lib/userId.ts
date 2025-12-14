const STORAGE_KEY = "opnode:wallet:userId";

function generateFallbackId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getExistingWalletUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEY);
}

export function getOrCreateWalletUserId(): string {
  if (typeof window === "undefined") {
    throw new Error("Wallet user IDs can only be accessed in the browser");
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated = generateFallbackId();
  window.localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}

export function clearWalletUserId() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
