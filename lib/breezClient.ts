class BrowserLogger {
  log(logEntry: { level: string; line: string }) {
    console.debug(`[Breez ${logEntry.level}] ${logEntry.line}`);
  }
}

const breezApiKey = process.env.NEXT_PUBLIC_BREEZ_API_KEY;
const breezNetwork = (process.env.NEXT_PUBLIC_BREEZ_NETWORK ?? "regtest") as
  | "mainnet"
  | "testnet"
  | "regtest";

let breezModulePromise: Promise<
  typeof import("@breeztech/breez-sdk-spark/web")
> | null = null;

async function loadBreezWebSdk() {
  if (typeof window === "undefined") {
    throw new Error(
      "The Breez SDK can only be loaded in the browser environment"
    );
  }

  if (!breezModulePromise) {
    breezModulePromise = (async () => {
      const module = await import("@breeztech/breez-sdk-spark/web");
      await module.default();
      await module.initLogging(new BrowserLogger());
      return module;
    })();
  }

  return breezModulePromise;
}

export type BreezSdkInstance = Awaited<ReturnType<typeof buildBreezSdk>>;

// Export for server-side use (API routes)
export async function buildBreezSdk(mnemonic: string) {
  if (!breezApiKey) {
    throw new Error(
      "NEXT_PUBLIC_BREEZ_API_KEY is missing. Add it to your .env.local file."
    );
  }

  const breez = await loadBreezWebSdk();
  const config = breez.defaultConfig(
    breezNetwork as Parameters<typeof breez.defaultConfig>[0]
  );
  config.apiKey = breezApiKey;

  let builder = breez.SdkBuilder.new(config, { type: "mnemonic", mnemonic });
  builder = await builder.withDefaultStorage("OPNodeEmbeddedWallet");

  return builder.build();
}

// Payment helper functions

/**
 * Parse payment input (BOLT11, Lightning address, BTC address, etc.)
 */
export async function parsePaymentInput(sdk: BreezSdkInstance, input: string) {
  try {
    return await sdk.parse(input);
  } catch (error) {
    console.error("Failed to parse payment input:", error);
    throw new Error("Invalid payment request");
  }
}

/**
 * Prepare a payment (BOLT11, Bitcoin address, Spark address, etc.)
 */
export async function prepareSendPayment(
  sdk: BreezSdkInstance,
  paymentRequest: string,
  amountSats?: bigint
) {
  try {
    return await sdk.prepareSendPayment({
      paymentRequest,
      amount: amountSats,
    });
  } catch (error) {
    console.error("Failed to prepare payment:", error);
    throw error;
  }
}

/**
 * Send a payment
 */
export async function sendPayment(
  sdk: BreezSdkInstance,
  prepareResponse: any,
  options?: any,
  idempotencyKey?: string
) {
  try {
    return await sdk.sendPayment({
      prepareResponse,
      options,
      idempotencyKey,
    });
  } catch (error) {
    console.error("Failed to send payment:", error);
    throw error;
  }
}

/**
 * Prepare LNURL-Pay payment
 */
export async function prepareLnurlPay(
  sdk: BreezSdkInstance,
  amountSats: number,
  payRequest: any,
  comment?: string
) {
  try {
    return await sdk.prepareLnurlPay({
      amountSats,
      payRequest,
      comment,
      validateSuccessActionUrl: true,
    });
  } catch (error) {
    console.error("Failed to prepare LNURL payment:", error);
    throw error;
  }
}

/**
 * Send LNURL-Pay payment
 */
export async function lnurlPay(
  sdk: BreezSdkInstance,
  prepareResponse: any,
  idempotencyKey?: string
) {
  try {
    return await sdk.lnurlPay({
      prepareResponse,
      idempotencyKey,
    });
  } catch (error) {
    console.error("Failed to send LNURL payment:", error);
    throw error;
  }
}

/**
 * Get node info (includes Lightning address components)
 */
export async function getNodeInfo(sdk: BreezSdkInstance) {
  try {
    return await sdk.getInfo({ ensureSynced: false });
  } catch (error) {
    console.error("Failed to get node info:", error);
    throw error;
  }
}
