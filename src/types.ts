export type CategoryType = '室內套餐' | '戶外套餐' | '室內外點心';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: CategoryType;
  description?: string;
  icon?: string;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  category: CategoryType;
}

export interface Order {
  id: string;
  shortId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed';
  handler: string;
  completedCategories?: Record<string, string>;
  timestamp: number;
}

export interface StaffStat {
  totalRevenue: number;
  completedOrdersCount: number;
  itemsMap: Record<string, number>;
}

export interface BusinessHoursConfig {
  isOpen: boolean;
  mode?: 'open' | 'closed' | 'auto' | 'force_open' | 'force_closed';
  openTime?: string;
  closeTime?: string;
  closedNotice?: string;
}
