import { BusinessHoursConfig } from '../types';

export const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  isOpen: true,
  mode: 'open',
  closedNotice: '目前店內打烊休息中，自助點餐機暫停開放。',
};

export function checkIsBusinessOpen(config?: BusinessHoursConfig | null): {
  isOpen: boolean;
  statusText: string;
  reason?: string;
} {
  if (!config) {
    return {
      isOpen: true,
      statusText: '🟢 營業中 (開放點餐)',
    };
  }

  // Determine open state: prioritize isOpen boolean, fallback to mode for backwards compatibility
  const isOpen =
    typeof config.isOpen === 'boolean'
      ? config.isOpen
      : config.mode === 'force_closed' || config.mode === 'closed'
      ? false
      : true;

  if (isOpen) {
    return {
      isOpen: true,
      statusText: '🟢 營業中 (開放點餐)',
    };
  } else {
    return {
      isOpen: false,
      statusText: '🔴 打烊中 (暫停點餐)',
      reason: config.closedNotice || '目前店內打烊休息中，自助點餐機暫停開放。',
    };
  }
}
