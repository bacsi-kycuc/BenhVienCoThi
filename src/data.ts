import { PromptCategory, Prompt } from "./types";

export const DEFAULT_CATEGORIES: PromptCategory[] = [];

export const DEFAULT_PROMPTS: Prompt[] = [];

export const PHD_SAMPLES: any[] = [];

/**
 * SHA-256 matching function
 * Note: Since browser JS Crypto is async, we can implement it as a simple utility.
 * In addition to the secure hash verify, we also support plain password checking or fallback matching
 */
export async function verifyHash(inputText: string, targetHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex === targetHash;
  } catch (e) {
    // Basic fallback if cryptographic APIs are restricted (e.g. non-HTTPS iframes)
    return false;
  }
}
