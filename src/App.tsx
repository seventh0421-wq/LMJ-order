import React, { useState, useEffect } from 'react';
import { MenuItem, CartItem, Order, CategoryType, BusinessHoursConfig } from './types';
import { INITIAL_MENU } from './data/initialMenu';
import { RetroHeader } from './components/RetroHeader';
import { FrontView } from './components/FrontView';
import { BackView } from './components/BackView';
import { DEFAULT_BUSINESS_HOURS, checkIsBusinessOpen } from './lib/businessHours';
import {
  subscribeOrders,
  pushOrderToFirebase,
  updateOrderInFirebase,
  deleteSingleOrderInFirebase,
  clearAllOrdersInFirebase,
} from './lib/firebase';
import { sendNewOrderDiscordNotification } from './lib/webhook';
import { checkIsForbiddenStaffName } from './lib/validation';

import {
  AlertModal,
  CustomerModal,
  PasswordModal,
  StaffModal,
  AddItemModal,
} from './components/Modals';
import { CelebrationModal, CelebrationOrderData } from './components/CelebrationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [celebrationOrder, setCelebrationOrder] = useState<CelebrationOrderData | null>(null);

  const DEFAULT_DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1536593869272256543/Oos0-Url4hj9nKV9OMmA_Y7qCtIfhS9yq20qcULQZuWkSMmGIQirEj2PtD4HdR49MLk9';

  const [discordWebhookUrl, setDiscordWebhookUrl] = useState<string>(() => {
    const saved = localStorage.getItem('discord_webhook_url');
    if (saved) return saved;
    localStorage.setItem('discord_webhook_url', DEFAULT_DISCORD_WEBHOOK);
    return DEFAULT_DISCORD_WEBHOOK;
  });

  const [businessHoursConfig, setBusinessHoursConfig] = useState<BusinessHoursConfig>(() => {
    const saved = localStorage.getItem('longmai_business_hours');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_BUSINESS_HOURS;
  });

  const handleUpdateBusinessHoursConfig = (newConfig: BusinessHoursConfig) => {
    setBusinessHoursConfig(newConfig);
    localStorage.setItem('longmai_business_hours', JSON.stringify(newConfig));
  };

  // Load stored state or set defaults with auto-migration
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('longmai_menu');
    let items: MenuItem[] = saved ? JSON.parse(saved) : INITIAL_MENU;
    let updated = false;

    items = items.map((item) => {
      let cat = item.category as string;
      if (cat === '室外套餐') {
        cat = '戶外套餐';
        updated = true;
      }
      if (item.name === '炸魚我最行套餐' && cat !== '室內套餐') {
        cat = '室內套餐';
        updated = true;
      }
      let stock = item.stock;
      if (stock === undefined) {
        stock = item.isSoldOut ? 0 : 20;
        updated = true;
      }
      return { ...item, category: cat as CategoryType, stock };
    });

    if (!items.some((i) => i.name === '戶外享用套餐')) {
      items.push({
        id: 'm7',
        name: '戶外享用套餐',
        price: 25000,
        category: '戶外套餐',
        description: '戶外享用風味餐點包，配料豐富適合露營與戶外饗宴',
      });
      updated = true;
    }

    if (updated || !saved) {
      localStorage.setItem('longmai_menu', JSON.stringify(items));
    }

    return items;
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('longmai_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [password, setPassword] = useState<string>(() => {
    const saved = localStorage.getItem('longmai_password');
    if (!saved || saved === '0000' || saved === 'ff140822' || saved !== 'ff1408221213') {
      localStorage.setItem('longmai_password', 'ff1408221213');
      return 'ff1408221213';
    }
    return saved;
  });

  // Helper to remove duplicate orders by ID
  const deduplicateOrders = (ordersList: Order[]): Order[] => {
    const seen = new Set<string>();
    return ordersList.filter((o) => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  };

  // Modal States
  const [alertInfo, setAlertInfo] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '系統提示',
    message: '',
  });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetTabAfterPassword, setTargetTabAfterPassword] = useState<'back' | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [activeHandlingOrder, setActiveHandlingOrder] = useState<{
    orderId: string;
    category: CategoryType;
  } | null>(null);

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Subscribe to Realtime Firebase Cloud Sync
  useEffect(() => {
    const unsubscribe = subscribeOrders((cloudOrders) => {
      setOrders(deduplicateOrders(cloudOrders));
    });
    return () => unsubscribe();
  }, []);

  // Persistence Sync to LocalStorage as secondary local fallback
  useEffect(() => {
    localStorage.setItem('longmai_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('longmai_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('longmai_password', password);
  }, [password]);

  // Audio effect generator using Web Audio API for interactive chimes
  const playChime = (type: 'cart' | 'submit' | 'complete') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'cart') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'submit') {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'complete') {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio fallback ignored
    }
  };

  const showAlert = (message: string, title = '系統提示') => {
    setAlertInfo({ isOpen: true, title, message });
  };

  const handleTabChangeRequest = (tab: 'front' | 'back') => {
    if (tab === 'front') {
      setActiveTab('front');
    } else {
      if (activeTab === 'back') return;
      setTargetTabAfterPassword('back');
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSubmit = (inputPassword: string) => {
    setIsPasswordModalOpen(false);
    if (inputPassword === password) {
      if (targetTabAfterPassword) {
        setActiveTab(targetTabAfterPassword);
      }
    } else {
      showAlert('密碼錯誤，禁止進入後台！', '驗證失敗');
    }
    setTargetTabAfterPassword(null);
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    const status = checkIsBusinessOpen(businessHoursConfig);
    if (!status.isOpen) {
      showAlert(status.reason || '目前店內打烊休息中，無法將餐點加入購物車！', '店內打烊中');
      return;
    }

    const isSoldOut = Boolean(item.isSoldOut) || (item.stock !== undefined && item.stock !== null && item.stock <= 0);
    if (isSoldOut) {
      showAlert(`【${item.name}】目前已賣完售罄，無法點購！`, '餐點已售完');
      return;
    }

    if (item.stock !== undefined && item.stock !== null) {
      const currentInCart = cart.filter((c) => c.menuItemId === item.id).length;
      if (currentInCart >= item.stock) {
        showAlert(
          `【${item.name}】目前庫存僅剩 ${item.stock} 份，購物車數量已達庫存上限，無法再增加了！`,
          '庫存已達上限'
        );
        return;
      }
    }

    const newCartItem: CartItem = {
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
    };
    setCart((prev) => [...prev, newCartItem]);
    playChime('cart');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSubmitOrder = () => {
    const status = checkIsBusinessOpen(businessHoursConfig);
    if (!status.isOpen) {
      showAlert(status.reason || '目前店內打烊休息中，暫不開放點餐！', '店內打烊中');
      return;
    }

    if (cart.length === 0) {
      showAlert('購物車是空的喔！請先選擇餐點。');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (total < 25000) {
      showAlert(
        `店內最低消費金額為 $25,000 G！\n\n您目前的消費總額為 $${total.toLocaleString()} G（還差 $${(
          25000 - total
        ).toLocaleString()} G），請增加餐點品項以滿足低消限制。`,
        '⚠️ 未達店內低消'
      );
      return;
    }

    setIsCustomerModalOpen(true);
  };

  const handleUpdateDiscordWebhookUrl = (url: string) => {
    setDiscordWebhookUrl(url);
    localStorage.setItem('discord_webhook_url', url);
  };

  const handleCustomerNameConfirm = async (customerTitle: string) => {
    setIsCustomerModalOpen(false);

    const status = checkIsBusinessOpen(businessHoursConfig);
    if (!status.isOpen) {
      showAlert(status.reason || '目前非營業時間，點餐系統已關閉。', '非營業時間');
      return;
    }

    if (cart.length === 0) return;

    // Double check forbidden staff names
    const forbidden = checkIsForbiddenStaffName(customerTitle);
    if (forbidden.isForbidden) {
      showAlert('你連自己名字都忘了？\n\n禁止使用店員名稱進行點餐，請輸入您真實的遊戲 ID！', '⚠️ 警告');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (total < 25000) {
      showAlert(
        `店內最低消費金額為 $25,000 G！\n您目前的消費總額為 $${total.toLocaleString()} G，無法送出訂單。`,
        '⚠️ 未達店內低消'
      );
      return;
    }

    // Verify stock limits before placing order
    for (const item of menuItems) {
      const isSoldOut = Boolean(item.isSoldOut) || (item.stock !== undefined && item.stock !== null && item.stock <= 0);
      const countInCart = cart.filter((c) => c.menuItemId === item.id).length;
      if (countInCart > 0 && isSoldOut) {
        showAlert(`【${item.name}】已售罄賣完，無法完成下單！請先自購物車移除。`, '餐點已售完');
        return;
      }
      if (countInCart > 0 && item.stock !== undefined && item.stock !== null && countInCart > item.stock) {
        showAlert(
          `【${item.name}】目前庫存僅剩 ${item.stock} 份，但購物車內有 ${countInCart} 份，請調整數量後再下單！`,
          '庫存不足'
        );
        return;
      }
    }

    const shortId = customerTitle;

    const newOrderData = {
      shortId: shortId,
      items: [...cart],
      total,
      status: 'pending' as const,
      handler: '',
      timestamp: Date.now(),
    };

    // Push to Firebase and local state
    const createdId = await pushOrderToFirebase(newOrderData);
    const newOrder: Order = {
      id: createdId,
      ...newOrderData,
    };

    // Deduct stock for ordered items
    setMenuItems((prev) => {
      const updated = prev.map((item) => {
        const countOrdered = cart.filter((c) => c.menuItemId === item.id).length;
        if (countOrdered > 0 && item.stock !== undefined && item.stock !== null) {
          const newStock = Math.max(0, item.stock - countOrdered);
          const isSoldOut = newStock === 0 ? true : Boolean(item.isSoldOut);
          return { ...item, stock: newStock, isSoldOut };
        }
        return item;
      });
      localStorage.setItem('longmai_menu', JSON.stringify(updated));
      return updated;
    });

    setOrders((prev) => deduplicateOrders([newOrder, ...prev]));
    const cartItemsCopy = [...cart];
    setCart([]);
    playChime('submit');

    // Trigger Discord Webhook notification if URL is configured
    if (discordWebhookUrl.trim()) {
      const timeStr = new Date(newOrderData.timestamp).toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      });
      sendNewOrderDiscordNotification(discordWebhookUrl, {
        shortId,
        items: cartItemsCopy,
        total,
        timeStr,
      }).catch((err) => console.error('Discord Webhook notification error:', err));
    }

    // Trigger full-screen celebration animation
    setCelebrationOrder({
      shortId,
      total,
      items: cartItemsCopy,
      orderId: createdId,
      timestamp: newOrderData.timestamp,
    });
  };

  // Backend order completion with staff modal
  const handleOpenTakeOrderModal = (orderId: string, category: CategoryType) => {
    setActiveHandlingOrder({ orderId, category });
    setIsStaffModalOpen(true);
  };

  const handleStaffSubmit = async (staffName: string) => {
    if (!activeHandlingOrder) return;

    const { orderId: targetOrderId, category: targetCategory } = activeHandlingOrder;
    setIsStaffModalOpen(false);
    setActiveHandlingOrder(null);

    const targetOrder = orders.find((o) => o.id === targetOrderId);
    if (!targetOrder) return;

    const currentCompletedCats = targetOrder.completedCategories || {};
    const newCompletedCats = {
      ...currentCompletedCats,
      [targetCategory]: staffName,
    };

    const itemCategoryMap: Record<string, CategoryType> = {};
    menuItems.forEach((item) => {
      itemCategoryMap[item.name] = item.category;
    });

    const requiredCategories: string[] = Array.from(
      new Set(
        targetOrder.items.map(
          (item) => (itemCategoryMap[item.name] || item.category || '室內外點心') as string
        )
      )
    );

    const isAllCategoriesCompleted = requiredCategories.every(
      (cat: string) => !!newCompletedCats[cat]
    );

    const handlerSummary = Array.from(
      new Set(Object.values(newCompletedCats).filter(Boolean))
    ).join(', ');

    const updates: Partial<Order> = {
      completedCategories: newCompletedCats,
      status: isAllCategoriesCompleted ? 'completed' : 'pending',
      handler: handlerSummary,
    };

    setOrders((prev) =>
      prev.map((ord) => (ord.id === targetOrderId ? { ...ord, ...updates } : ord))
    );

    await updateOrderInFirebase(targetOrderId, updates);

    playChime('complete');
  };

  // Add Custom Menu Item
  const handleAddItem = (newItem: {
    name: string;
    price: number;
    category: CategoryType;
    description: string;
    stock?: number | null;
  }) => {
    const stockVal = newItem.stock !== undefined ? newItem.stock : 20;
    const item: MenuItem = {
      id: `custom_${Date.now()}`,
      name: newItem.name,
      price: newItem.price,
      category: newItem.category,
      description: newItem.description,
      stock: stockVal,
      isSoldOut: stockVal !== null && stockVal <= 0,
    };
    const updated = [...menuItems, item];
    setMenuItems(updated);
    localStorage.setItem('longmai_menu', JSON.stringify(updated));
    setIsAddItemModalOpen(false);
    showAlert(`已成功新增【${newItem.name}】至 ${newItem.category}！`, '新增品項');
  };

  // Delete single order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteSingleOrderInFirebase(orderId);
      setOrders((prev) => {
        const updated = prev.filter((o) => o.id !== orderId);
        localStorage.setItem('longmai_orders', JSON.stringify(updated));
        return updated;
      });
      showAlert('該筆訂單已成功自系統與資料庫中刪除！', '刪除成功');
    } catch (err) {
      console.error('刪除訂單失敗:', err);
      showAlert('刪除訂單時發生錯誤，請稍後再試。', '錯誤');
    }
  };

  // Update Item Stock Quantity directly
  const handleUpdateItemStock = (itemId: string, newStock: number | null) => {
    setMenuItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === itemId) {
          const isSoldOut = newStock !== null && newStock <= 0;
          return { ...item, stock: newStock, isSoldOut };
        }
        return item;
      });
      localStorage.setItem('longmai_menu', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle Item Sold Out status (賣完就沒有)
  const handleToggleItemSoldOut = (itemId: string) => {
    setMenuItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      const willBeSoldOut = !target?.isSoldOut;
      const updated = prev.map((item) => {
        if (item.id === itemId) {
          let newStock = item.stock;
          if (willBeSoldOut) {
            newStock = 0;
          } else {
            if (newStock === 0 || newStock === undefined) newStock = 20;
          }
          return { ...item, isSoldOut: willBeSoldOut, stock: newStock };
        }
        return item;
      });
      localStorage.setItem('longmai_menu', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset Data
  const handleClearData = async () => {
    if (window.confirm('確定要清空所有訂單與累積業績紀錄嗎？此動作無法復原。')) {
      await clearAllOrdersInFirebase(orders);
      setOrders([]);
      showAlert('所有訂單紀錄已重置為零。', '重置成功');
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-6xl mx-auto selection:bg-red-700 selection:text-white">
      {/* 頂部標題與頁籤 */}
      <RetroHeader
        activeTab={activeTab}
        onTabChange={handleTabChangeRequest}
        pendingCount={pendingOrdersCount}
      />

      {/* 主畫面切換 */}
      <main className="relative">
        {activeTab === 'front' ? (
          <FrontView
            menuItems={menuItems}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onSubmitOrder={handleSubmitOrder}
            businessHoursConfig={businessHoursConfig}
          />
        ) : (
          <BackView
            orders={orders}
            menuItems={menuItems}
            onTakeOrder={handleOpenTakeOrderModal}
            onDeleteOrder={handleDeleteOrder}
            onToggleItemSoldOut={handleToggleItemSoldOut}
            onUpdateItemStock={handleUpdateItemStock}
            onClearData={handleClearData}
            onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
            onReturnToFront={() => setActiveTab('front')}
            discordWebhookUrl={discordWebhookUrl}
            onUpdateDiscordWebhookUrl={handleUpdateDiscordWebhookUrl}
            businessHoursConfig={businessHoursConfig}
            onUpdateBusinessHoursConfig={handleUpdateBusinessHoursConfig}
          />
        )}
      </main>

      {/* 頁尾資訊 */}
      <footer className="mt-12 text-center text-xs text-red-900 font-extrabold tracking-wider border-t-2 border-red-300 pt-4 pb-8 opacity-80">
        ★ 龍麥呷 自助點餐與後台管理系統 ‧ 復古美食販售 kiosk ★
      </footer>

      {/* 彈出式 Modal 群 */}
      <AlertModal
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        onConfirm={() => setAlertInfo({ ...alertInfo, isOpen: false })}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        totalAmount={cart.reduce((sum, item) => sum + item.price, 0)}
        onSubmit={handleCustomerNameConfirm}
        onCancel={() => setIsCustomerModalOpen(false)}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onSubmit={handlePasswordSubmit}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setTargetTabAfterPassword(null);
        }}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        categoryName={activeHandlingOrder?.category}
        onSubmit={handleStaffSubmit}
        onCancel={() => {
          setIsStaffModalOpen(false);
          setActiveHandlingOrder(null);
        }}
      />

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onSubmit={handleAddItem}
        onCancel={() => setIsAddItemModalOpen(false)}
      />

      {/* 全螢幕感謝慶祝動畫 */}
      <CelebrationModal
        isOpen={!!celebrationOrder}
        orderData={celebrationOrder}
        onClose={() => setCelebrationOrder(null)}
      />
    </div>
  );
}
