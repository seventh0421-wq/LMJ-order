import { BusinessHoursConfig } from '../types';

export const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  mode: 'auto',
  openTime: '10:00',
  closeTime: '22:00',
  closedNotice: '目前非營業時間，自助點餐機暫停開放。',
};

export function checkIsBusinessOpen(config: BusinessHoursConfig): { isOpen: boolean; statusText: string; reason?: string } {
  if (config.mode === 'force_open') {
    return {
      isOpen: true,
      statusText: '🟢 手動強制營業中',
    };
  }

  if (config.mode === 'force_closed') {
    return {
      isOpen: false,
      statusText: '🔴 店主手動關閉 (打烊中)',
      reason: config.closedNotice || '店主已手動關閉自助點餐機。',
    };
  }

  // Auto mode
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = (config.openTime || '10:00').split(':').map(Number);
  const [closeH, closeM] = (config.closeTime || '22:00').split(':').map(Number);

  const openMinutes = (openH || 0) * 60 + (openM || 0);
  const closeMinutes = (closeH || 0) * 60 + (closeM || 0);

  let isOpen = false;

  if (openMinutes === closeMinutes) {
    isOpen = true; // 24小時營業
  } else if (openMinutes < closeMinutes) {
    isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else {
    // 跨夜營業，例如 18:00 ~ 02:00
    isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  if (isOpen) {
    return {
      isOpen: true,
      statusText: `🟢 自動營業中 (${config.openTime} - ${config.closeTime})`,
    };
  } else {
    return {
      isOpen: false,
      statusText: `🔴 休息打烊中 (${config.openTime} - ${config.closeTime})`,
      reason: `目前非營業時間 (每日營業時間：${config.openTime} - ${config.closeTime})`,
    };
  }
}
