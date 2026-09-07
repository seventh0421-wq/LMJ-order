// Staff names blacklist validation for customer order identification
export const FORBIDDEN_STAFF_NAMES = [
  '曜恆',
  '起司貓',
  '犬本丸',
  '索爾恩',
  '皮到深處',
  '花生神魔術',
  '車力之巨人',
] as const;

export const DEFAULT_STAFF_NAMES = [...FORBIDDEN_STAFF_NAMES];

export const FORBIDDEN_STAFF_WARNING = '你連自己名字都忘了？';

/**
 * Checks if the given customer name contains or resembles any forbidden staff name.
 * Handles cases where customers append or insert numbers, spaces, or punctuation/symbols.
 * e.g., "曜恆123", "99起司貓", "犬1本2丸", "車力之巨人01" will all be caught.
 */
export function checkIsForbiddenStaffName(
  input: string,
  extraStaffNames: string[] = []
): {
  isForbidden: boolean;
  matchedName?: string;
  warningMessage: string;
} {
  if (!input || !input.trim()) {
    return { isForbidden: false, warningMessage: FORBIDDEN_STAFF_WARNING };
  }

  const raw = input.toLowerCase().trim();
  // Strip numbers, spaces, and all common punctuation/symbols
  const stripped = input.replace(/[\d\s\p{P}\p{S}_]/gu, '').toLowerCase();

  const allStaffNames = Array.from(new Set([...FORBIDDEN_STAFF_NAMES, ...extraStaffNames]));

  for (const staffName of allStaffNames) {
    const target = staffName.toLowerCase();
    if (raw.includes(target) || stripped.includes(target)) {
      return {
        isForbidden: true,
        matchedName: staffName,
        warningMessage: FORBIDDEN_STAFF_WARNING,
      };
    }
  }

  return { isForbidden: false, warningMessage: FORBIDDEN_STAFF_WARNING };
}
