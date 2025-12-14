/**
 * LNURL and Lightning Address utilities for Breez SDK
 */

/**
 * Generate a Lightning address from username and domain
 * @param username - User's chosen username
 * @param domain - Your LNURL server domain (e.g., "yourdomain.com")
 * @returns Lightning address in the format username@domain.com
 */
export function generateLightningAddress(username: string, domain: string): string {
  return `${username.toLowerCase()}@${domain}`;
}

/**
 * Parse Lightning address into components
 * @param lightningAddress - Lightning address (username@domain.com)
 * @returns Object with username and domain
 */
export function parseLightningAddress(lightningAddress: string): {
  username: string;
  domain: string;
} {
  const [username, domain] = lightningAddress.split("@");
  if (!username || !domain) {
    throw new Error("Invalid Lightning address format");
  }
  return { username, domain };
}

/**
 * Get LNURL-Pay well-known URL for a Lightning address
 * @param lightningAddress - Lightning address (username@domain.com)
 * @returns LNURL-Pay well-known URL
 */
export function getLnurlPayUrl(lightningAddress: string): string {
  const { username, domain } = parseLightningAddress(lightningAddress);
  const protocol = domain.includes("localhost") ? "http" : "https";
  return `${protocol}://${domain}/.well-known/lnurlp/${username}`;
}

/**
 * Fetch LNURL-Pay data from a Lightning address
 * @param lightningAddress - Lightning address
 * @returns LNURL-Pay data including callback URL and limits
 */
export async function fetchLnurlPayData(lightningAddress: string) {
  const url = getLnurlPayUrl(lightningAddress);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch LNURL data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching LNURL-Pay data:", error);
    throw error;
  }
}

/**
 * Register a Lightning address with the LNURL server (Breez-hosted)
 * This requires API authentication - typically done server-side
 * @param username - Desired username
 * @param sparkPubkey - User's Spark public key
 * @param domain - LNURL server domain
 * @param apiKey - LNURL server API key
 */
export async function registerLightningAddress(
  username: string,
  sparkPubkey: string,
  domain: string,
  apiKey: string
): Promise<{ success: boolean; lightningAddress?: string; error?: string }> {
  const protocol = domain.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${domain}/lnurlpay/${sparkPubkey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ username }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }
    
    return {
      success: true,
      lightningAddress: generateLightningAddress(username, domain),
    };
  } catch (error) {
    console.error("Error registering Lightning address:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if a username is available on the LNURL server
 * @param username - Username to check
 * @param domain - LNURL server domain
 */
export async function checkUsernameAvailable(
  username: string,
  domain: string
): Promise<boolean> {
  const protocol = domain.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${domain}/lnurlpay/available/${username}`;
  
  try {
    const response = await fetch(url);
    if (response.status === 404) {
      return true; // Username available
    }
    return false; // Username taken
  } catch (error) {
    console.error("Error checking username availability:", error);
    return false;
  }
}

/**
 * Validate Lightning address format
 * @param address - Lightning address to validate
 * @returns true if valid format
 */
export function isValidLightningAddress(address: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(address);
}
