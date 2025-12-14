# OPNode

Next.js 16 dashboard wired to the Breez Spark SDK (embedded wallet) and a Convex backend for persisting encrypted wallet metadata. Clicking **Connect Wallet** now provisions or resumes a Breez wallet, stores the encrypted mnemonic in Convex, and reconnects automatically on refresh.

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js) for running scripts.
- [Convex CLI](https://docs.convex.dev/quickstart/install) authenticated against your project.
- Breez Spark SDK API key.
- A 32-byte secret (can be any long random string) for encrypting mnemonics before they hit Convex.

## Environment Variables

Set these in `.env.local` (see the checked-in template):

| Variable                     | Description                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`     | URL of your Convex deployment.                                                     |
| `CONVEX_EMBEDDED_WALLET_KEY` | Secret used by Convex functions to encrypt mnemonics (store via `convex env set`). |
| `NEXT_PUBLIC_BREEZ_API_KEY`  | Breez Spark API key.                                                               |
| `NEXT_PUBLIC_BREEZ_NETWORK`  | `mainnet`, `testnet`, or `regtest` (defaults to `regtest`).                        |

## Running Locally

```bash
# Install deps
bun install

# Generate Convex types / run the dev deployment (keeps schema + DB in sync)
bunx convex dev

# In a second terminal start Next.js
dev_server="bun dev"
$dev_server
```

Visit `http://localhost:3000/dashboard` to use the UI. The wallet modal will provision a Breez wallet with a fresh mnemonic, sync it to Convex, and close when ready. Choosing **Resume Saved Wallet** loads the encrypted mnemonic from Convex and rebuilds the SDK instance so returning users keep the same wallet.

## Useful Scripts

```bash
# Type-check everything
bunx tsc --noEmit

# Build for production
bun run build
```

## Wallet Flow Overview

1. `Connect Wallet` → `Create Embedded Wallet` calls Breez WebAssembly, generates a mnemonic via `@scure/bip39`, stores the encrypted secret in the `walletProfiles` Convex table, and returns a live SDK handle.
2. Wallet metadata (walletId, publicKey, network) is persisted so Convex queries can rebuild the wallet later.
3. On load, `EmbeddedWalletProvider` silently asks Convex for an existing wallet and reconnects if one is present; the modal button reflects the current state.

## Notes

- Convex encryption uses Web Crypto AES-GCM; make sure `CONVEX_EMBEDDED_WALLET_KEY` is set in the Convex deployment environment or the mutations will fail.
- The Breez SDK runs only in the browser; server components access it indirectly through the client-side provider.
