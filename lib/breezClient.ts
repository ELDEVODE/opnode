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
