/**
 * descriptionDraft — lightweight sessionStorage bridge
 *
 * Allows the AI Image Enhancer page to hand off a generated product
 * description to the AdminDashboard product form without needing a
 * global React context or URL query strings.
 *
 * Flow:
 *   1. ImageEnhancerPage calls `saveDescriptionDraft(data)` when the
 *      user clicks "استخدم هذا الوصف".
 *   2. AdminDashboard calls `readAndClearDescriptionDraft()` inside a
 *      useEffect on mount; if data is present it pre-fills the form
 *      and opens the add-product dialog.
 */

const STORAGE_KEY = "bader_ai_description_draft";

export interface DescriptionDraft {
  /** Arabic product title */
  title: string;
  /** Full marketing description */
  description: string;
  /** Short feature bullets */
  features: string[];
  /** Call-to-action phrase */
  cta: string;
  /** Arabic hashtags */
  hashtags: string[];
  /** Optional: enhanced image URL to pre-fill the product image field */
  imageUrl?: string;
}

/** Persist draft to sessionStorage so it survives navigation */
export function saveDescriptionDraft(draft: DescriptionDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage may be unavailable in some environments
  }
}

/** Read draft once and immediately clear it (consume pattern) */
export function readAndClearDescriptionDraft(): DescriptionDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as DescriptionDraft;
  } catch {
    return null;
  }
}

/** Check if a draft is waiting without consuming it */
export function hasDescriptionDraft(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
