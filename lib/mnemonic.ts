import { generateMnemonic } from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english.js";

export function generateWalletMnemonic(strength: 128 | 256 = 128): string {
  return generateMnemonic(english, strength);
}
