// Shared webview utilities — used by main.ts, inputController.ts, and other webview modules.

/** Escape a string for safe use inside HTML attribute values. */
export function escapeAttr(text: string): string {
  return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Layout constants ────────────────────────────────────────────────

export const TEXTAREA_MIN_HEIGHT = 28;
export const TEXTAREA_MAX_HEIGHT = 200;
export const COMPOSER_MIN_INSET = 140;
export const COMPOSER_INSET_PADDING = 24;
