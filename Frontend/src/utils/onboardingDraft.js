const DRAFT_KEY = 'tortillon.onboarding.draft.v1';
const DRAFT_VERSION = 1;

/**
 * @returns {{ version: number, currentStep: number, updatedAt: string, values: object } | null}
 */
export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.version !== DRAFT_VERSION ||
      typeof parsed.values !== 'object' ||
      parsed.values === null ||
      typeof parsed.currentStep !== 'number'
    ) {
      return null;
    }

    const step = Math.min(4, Math.max(1, Math.floor(parsed.currentStep)));
    return {
      version: DRAFT_VERSION,
      currentStep: step,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      values: parsed.values
    };
  } catch {
    return null;
  }
}

/**
 * @param {{ currentStep: number, values: object }} draft
 */
export function saveDraft({ currentStep, values }) {
  try {
    const payload = {
      version: DRAFT_VERSION,
      currentStep: Math.min(4, Math.max(1, Math.floor(currentStep) || 1)),
      updatedAt: new Date().toISOString(),
      values
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
    return true;
  } catch {
    return false;
  }
}

export { DRAFT_KEY, DRAFT_VERSION };
