import React, { useState, useEffect } from 'react';
import { Order, MenuItem, CategoryType, BusinessHoursConfig } from '../types';
import {
  Flame,
  Waves,
  Zap,
  Users,
  DollarSign,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  Calendar,
  Layers,
  ChefHat,
  Award,
  ArrowLeft,
  UserCheck,
  Bell,
  Send,
  HelpCircle,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Clock,
  Store,
  Power,
  ShieldAlert,
  Search,
  Filter,
  TrendingUp,
  FileText,
  Trash2,
  Ban,
  UtensilsCrossed,
  PackageCheck,
  PackageX,
  Boxes,
  Minus,
  Plus,
} from 'lucide-react';
import { sendTestDiscordNotification } from '../lib/webhook';
import { checkIsBusinessOpen } from '../lib/businessHours';

const getLocalDateString = (ts: number): string => {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayStr = () => getLocalDateString(Date.now());

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d.getTime());
};

interface BackViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  onTakeOrder: (orderId: string, category: CategoryType) => void;
  onDeleteOrder: (orderId: string) => void;
  onToggleItemSoldOut: (itemId: string) => void;
  onUpdateItemStock: (itemId: string, newStock: number | null) => void;
  onClearData: () => void;
  onOpenAddItemModal: () => void;
  onReturnToFront: () => void;
  discordWebhookUrl: string;
  onUpdateDiscordWebhookUrl: (url: string) => void;
  businessHoursConfig: BusinessHoursConfig;
  onUpdateBusinessHoursConfig: (config: BusinessHoursConfig) => void;
}

export const BackView: React.FC<BackViewProps> = ({
  orders,
  menuItems,
  onTakeOrder,
  onDeleteOrder,
  onToggleItemSoldOut,
  onUpdateItemStock,
  onClearData,
  onOpenAddItemModal,
  onReturnToFront,
  discordWebhookUrl,
  onUpdateDiscordWebhookUrl,
  businessHoursConfig,
  onUpdateBusinessHoursConfig,
}) => {
  const [staffCount, setStaffCount] = useState<number>(1);
  const [inputWebhook, setInputWebhook] = useState<string>(discordWebhookUrl);
  const [menuFilterCat, setMenuFilterCat] = useState<string>('全部');

  // Daily statistics and history search state
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayStr());
  const [historyFilterMode, setHistoryFilterMode] = useState<'selected' | 'all'>('selected');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  useEffect(() => {
    setInputWebhook(discordWebhookUrl);
  }, [discordWebhookUrl]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; msg: string; success?: boolean } | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Business Hours State (Manual Open / Close Only)
  const isBusinessOpen =
    typeof businessHoursConfig.isOpen === 'boolean'
      ? businessHoursConfig.isOpen
    : businessHoursConfig.mode !== 'force_closed' && businessHoursConfig.mode !== 'closed';

  const [isOpenState, setIsOpenState] = useState<boolean>(isBusinessOpen);
  const [closedNotice, setClosedNotice] = useState<string>(
    businessHoursConfig.closedNotice || '目前店內打烊休息中，自助點餐機暫停開放。'
  );
  const [isHoursSaved, setIsHoursSaved] = useState<boolean>(false);

  useEffect(() => {
    const currentOpen =
      typeof businessHoursConfig.isOpen === 'boolean'
        ? businessHoursConfig.isOpen
        : businessHoursConfig.mode !== 'force_closed' && businessHoursConfig.mode !== 'closed';
    setIsOpenState(currentOpen);
    setClosedNotice(businessHoursConfig.closedNotice || '目前店內打烊休息中，自助點餐機暫停開放。');
  }, [businessHoursConfig]);

  const currentStoreStatus = checkIsBusinessOpen(businessHoursConfig);

  const handleToggleBusiness = (newOpen: boolean) => {
    setIsOpenState(newOpen);
    onUpdateBusinessHoursConfig({
      isOpen: newOpen,
      mode: newOpen ? 'open' : 'closed',
      closedNotice,
    });
    setIsHoursSaved(true);
    setTimeout(() => setIsHoursSaved(false), 2000);
  };

  const handleSaveNotice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateBusinessHoursConfig({
      isOpen: isOpenState,
      mode: isOpenState ? 'open' : 'closed',
      closedNotice,
    });
    setIsHoursSaved(true);
    setTimeout(() => setIsHoursSaved(false), 2000);
  };

  const handleSaveWebhook = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateDiscordWebhookUrl(inputWebhook.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestWebhook = async () => {
    const url = inputWebhook.trim() || discordWebhookUrl.trim();
    if (!url) {
      setTestStatus({ loading: false, msg: '⚠️ 請先輸入 Discord Webhook 網址！', success: false });
      return;
    }

    setTestStatus({ loading: true, msg: '⏳ 發送測試訊息中...' });
    const res = await sendTestDiscordNotification(url);
    if (res.success) {
      setTestStatus({ loading: false, msg: '🎉 發送成功！請檢查您的 Discord 頻道。', success: true });
    } else {
      setTestStatus({ loading: false, msg: `❌ 發送失敗：${res.error}`, success: false });
    }
  };

  // Map each item name to its category
  const itemCategoryMap: Record<string, CategoryType> = {};
  menuItems.forEach((item) => {
    itemCategoryMap[item.name] = item.category;
  });

  const handleDeleteOrderConfirm = (orderId: string, shortId: string) => {
    if (window.confirm(`確定要刪除訂單【#${shortId}】嗎？\n此動作將同時從系統與資料庫中永久刪除。`)) {
      onDeleteOrder(orderId);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (menuFilterCat === '全部') return true;
    return item.category === menuFilterCat;
  });

  // Calculate statistics from completed or partially completed orders
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Per staff sales breakdown based on confirmed categories or completed orders
  const staffStats: Record<
    string,
    { total: number; count: number; items: Record<string, number> }
  > = {};

  orders.forEach((order) => {
    const completedCats = order.completedCategories || {};
    if (Object.keys(completedCats).length > 0) {
      Object.entries(completedCats).forEach(([cat, handlerName]: [string, string]) => {
        if (!handlerName) return;
        const name: string = handlerName;
        if (!staffStats[name]) {
          staffStats[name] = { total: 0, count: 0, items: {} };
        }

        let categoryTotal = 0;
        order.items.forEach((item) => {
          const itemCat = itemCategoryMap[item.name] || item.category || '室內外點心';
          if (itemCat === cat) {
            categoryTotal += item.price;
            staffStats[name].items[item.name] =
              (staffStats[name].items[item.name] || 0) + 1;
          }
        });
        staffStats[name].total += categoryTotal;
        staffStats[name].count += 1;
      });
    } else if (order.status === 'completed') {
      const handler = order.handler || '未具名接單人';
      if (!staffStats[handler]) {
        staffStats[handler] = { total: 0, count: 0, items: {} };
      }
      staffStats[handler].total += order.total;
      staffStats[handler].count += 1;

      order.items.forEach((item) => {
        staffStats[handler].items[item.name] =
          (staffStats[handler].items[item.name] || 0) + 1;
      });
    }
  });

  // Historical orders filtering & statistics calculation
  const historyOrders = orders.filter((order) => {
    const orderDateStr = getLocalDateString(order.timestamp);
    if (historyFilterMode === 'selected' && orderDateStr !== selectedDate) {
      return false;
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      const nameMatch = order.customerName.toLowerCase().includes(kw);
      const idMatch = order.shortId.toLowerCase().includes(kw);
      const itemMatch = order.items.some((i) => i.name.toLowerCase().includes(kw));
      const handlerMatch = (order.handler || '').toLowerCase().includes(kw);
      return nameMatch || idMatch || itemMatch || handlerMatch;
    }
    return true;
  });

  const selectedCompletedOrders = historyOrders.filter((o) => o.status === 'completed');
  const selectedTotalRevenue = selectedCompletedOrders.reduce((sum, o) => sum + o.total, 0);
  const selectedCompletedCount = selectedCompletedOrders.length;
  const selectedAvgOrderValue =
    selectedCompletedCount > 0 ? Math.round(selectedTotalRevenue / selectedCompletedCount) : 0;

  // Item sales breakdown for history filter
  const selectedItemSales: Record<string, { count: number; totalG: number }> = {};
  selectedCompletedOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!selectedItemSales[item.name]) {
        selectedItemSales[item.name] = { count: 0, totalG: 0 };
      }
      selectedItemSales[item.name].count += 1;
      selectedItemSales[item.name].totalG += item.price;
    });
  });

  const sortedTopItems = Object.entries(selectedItemSales)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4);

  // Categorize pending orders into the three areas
  const pendingInner: Array<{ orderKey: string; orderId: string; category: CategoryType; time: string; items: Record<string, number> }> = [];
  const pendingOuter: Array<{ orderKey: string; orderId: string; category: CategoryType; time: string; items: Record<string, number> }> = [];
  const pendingMobile: Array<{ orderKey: string; orderId: string; category: CategoryType; time: string; items: Record<string, number> }> = [];

  // Consider all orders that are not fully completed yet or have pending categories
  orders.forEach((order) => {
    if (order.status === 'completed') return;

    const completedCats = order.completedCategories || {};

    const categorizedItems: Record<CategoryType, Record<string, number>> = {
      '室內套餐': {},
      '戶外套餐': {},
      '室內外點心': {},
    };

    order.items.forEach((item) => {
      const category = itemCategoryMap[item.name] || item.category || '室內外點心';
      categorizedItems[category][item.name] =
        (categorizedItems[category][item.name] || 0) + 1;
    });

    const timeString = new Date(order.timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (Object.keys(categorizedItems['室內套餐']).length > 0 && !completedCats['室內套餐']) {
      pendingInner.push({
        orderKey: order.id,
        orderId: order.shortId,
        category: '室內套餐',
        time: timeString,
        items: categorizedItems['室內套餐'],
      });
    }

    if (Object.keys(categorizedItems['戶外套餐']).length > 0 && !completedCats['戶外套餐']) {
      pendingOuter.push({
        orderKey: order.id,
        orderId: order.shortId,
        category: '戶外套餐',
        time: timeString,
        items: categorizedItems['戶外套餐'],
      });
    }

    if (Object.keys(categorizedItems['室內外點心']).length > 0 && !completedCats['室內外點心']) {
      pendingMobile.push({
        orderKey: order.id,
        orderId: order.shortId,
        category: '室內外點心',
        time: timeString,
        items: categorizedItems['室內外點心'],
      });
    }
  });

  const salaryPerStaff = Math.floor(totalRevenue / Math.max(1, staffCount));

  return (
    <div id="view-back" className="space-y-8">
      {/* 頂部管理工具列 */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl retro-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToFront}
            className="retro-btn px-3.5 py-1.5 text-sm flex items-center gap-1.5 retro-btn-green"
          >
            <ArrowLeft className="w-4 h-4" /> 返回點餐畫面
          </button>
          <div className="flex items-center gap-2 border-l-2 border-red-200 pl-3">
            <ChefHat className="w-6 h-6 text-red-700" />
            <span className="font-extrabold text-xl text-red-800 font-dela">
              後台作業控制台
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAddItemModal}
            className="retro-btn px-3.5 py-1.5 text-sm flex items-center gap-1.5 bg-amber-600 border-amber-900 shadow-amber-900"
          >
            <PlusCircle className="w-4 h-4" /> 新增菜單品項
          </button>
          <button
            onClick={onClearData}
            className="retro-btn px-3.5 py-1.5 text-sm flex items-center gap-1.5 bg-gray-700 border-gray-900 shadow-gray-900"
          >
            <RefreshCw className="w-4 h-4" /> 重置所有紀錄
          </button>
        </div>
      </div>

      {/* 營業狀態手動控制卡片 */}
      <div className="retro-border p-5 bg-amber-100/90 text-gray-900 rounded-xl shadow-lg border-4 border-amber-800">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b-2 border-amber-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-700 text-amber-300 rounded-lg shadow-md">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black font-dela tracking-wide text-red-800 flex items-center gap-2">
                門市營業狀態控制
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold border-2 shadow-sm ${
                    isOpenState
                      ? 'bg-emerald-600 text-white border-emerald-800'
                      : 'bg-rose-700 text-white border-rose-900'
                  }`}
                >
                  {isOpenState ? '🟢 營業中 (開放點餐)' : '🔴 打烊中 (暫停點餐)'}
                </span>
              </h3>
              <p className="text-xs text-amber-900 font-bold mt-0.5">
                手動切換點餐機的營業狀態，即時控制顧客是否可於前台加入購物車與送出訂單
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveNotice}
            className="retro-btn px-4 py-2 text-sm bg-red-700 hover:bg-red-600 text-white font-black border-red-950 flex items-center gap-1.5"
          >
            {isHoursSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            {isHoursSaved ? '設定已儲存！' : '儲存告示設定'}
          </button>
        </div>

        <div className="space-y-4">
          {/* 手動開啟 / 關閉 營業雙按鈕 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleToggleBusiness(true)}
              className={`p-4 rounded-xl border-4 font-black flex flex-col sm:flex-row items-center gap-3 transition-all text-left ${
                isOpenState
                  ? 'bg-emerald-600 border-emerald-950 text-white shadow-xl ring-4 ring-emerald-400 scale-[1.01]'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              <div className={`p-3 rounded-lg ${isOpenState ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                <Power className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-lg font-black font-dela">
                  <span>🟢 手動開啟營業</span>
                  {isOpenState && (
                    <span className="text-xs bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400">
                      目前運作中
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 font-bold ${isOpenState ? 'text-emerald-100' : 'text-gray-500'}`}>
                  前台開放點餐，顧客可自由加入購物車並結帳送出訂單
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleToggleBusiness(false)}
              className={`p-4 rounded-xl border-4 font-black flex flex-col sm:flex-row items-center gap-3 transition-all text-left ${
                !isOpenState
                  ? 'bg-rose-700 border-rose-950 text-white shadow-xl ring-4 ring-rose-400 scale-[1.01]'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-rose-50 hover:border-rose-300'
              }`}
            >
              <div className={`p-3 rounded-lg ${!isOpenState ? 'bg-rose-900 text-white' : 'bg-rose-100 text-rose-700'}`}>
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-lg font-black font-dela">
                  <span>🔴 手動關閉營業</span>
                  {!isOpenState && (
                    <span className="text-xs bg-rose-900 text-rose-100 px-2 py-0.5 rounded-full border border-rose-400">
                      目前打烊中
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 font-bold ${!isOpenState ? 'text-rose-100' : 'text-gray-500'}`}>
                  前台關閉點餐，鎖定點餐按鈕並向顧客展示打烊休息提示
                </p>
              </div>
            </button>
          </div>

          {/* 打烊休息告示文案 */}
          <form onSubmit={handleSaveNotice} className="space-y-1 pt-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <span>打烊告示文字 (展示於前台顧客視角)：</span>
              <span className="text-amber-800 text-[11px] font-normal">※ 關閉營業時前台將醒目顯示此文字</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={closedNotice}
                onChange={(e) => setClosedNotice(e.target.value)}
                placeholder="請輸入打烊時對顧客顯示的提示文字..."
                className="flex-1 bg-white border-2 border-amber-400 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-red-600"
              />
              <button
                type="submit"
                className="retro-btn px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white font-black border-amber-950 whitespace-nowrap"
              >
                儲存文字
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Discord Webhook 通知設定與教學卡片 */}
      <div className="retro-border p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-xl shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-indigo-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md text-amber-300">
              <MessageSquare className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-black font-dela tracking-wide text-amber-300 flex items-center gap-2">
                Discord 點餐即時通知設定
                {discordWebhookUrl.trim() ? (
                  <span className="text-xs bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    🟢 已啟用
                  </span>
                ) : (
                  <span className="text-xs bg-gray-500 text-gray-200 font-bold px-2 py-0.5 rounded-full border border-gray-400">
                    ⚪ 未設定網址
                  </span>
                )}
              </h3>
              <p className="text-xs text-indigo-200 font-bold mt-0.5">
                當客人送出點餐時，系統會自動發送通知到您的 Discord 頻道
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTutorial(!showTutorial)}
            className="bg-indigo-700 hover:bg-indigo-600 text-amber-300 border-2 border-indigo-500 px-3.5 py-1.5 rounded-lg text-sm font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
          >
            <HelpCircle className="w-4 h-4" />
            {showTutorial ? '隱藏教學指引' : '📖 DC Webhook 設定教學'}
          </button>
        </div>

        {/* Webhook 設定表單 */}
        <form onSubmit={handleSaveWebhook} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputWebhook}
                onChange={(e) => setInputWebhook(e.target.value)}
                placeholder="請貼上 Discord Webhook 網址 (https://discord.com/api/webhooks/...)"
                className="w-full bg-slate-950/80 border-2 border-indigo-400/70 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-sm text-amber-100 placeholder-indigo-300/60 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="retro-btn px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-red-950 font-black border-amber-800 shadow-amber-950 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-900" /> : <Sparkles className="w-4 h-4" />}
                {isSaved ? '已儲存！' : '儲存網址'}
              </button>

              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testStatus?.loading}
                className="retro-btn px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-black border-emerald-900 shadow-emerald-950 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                {testStatus?.loading ? '測試中...' : '發送測試'}
              </button>
            </div>
          </div>

          {/* 測試狀態訊息 */}
          {testStatus && (
            <div
              className={`p-2.5 rounded-lg text-sm font-bold border flex items-center gap-2 ${
                testStatus.success
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : testStatus.loading
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              <span>{testStatus.msg}</span>
            </div>
          )}
        </form>

        {/* Discord Webhook 教學指引 (下拉展開或卡片) */}
        {showTutorial && (
          <div className="mt-4 pt-4 border-t border-indigo-700/80 bg-slate-950/90 rounded-xl p-4 sm:p-5 text-indigo-100 border-2 border-amber-400/50 space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
              <h4 className="text-lg font-black text-amber-300 flex items-center gap-2 font-dela">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                如何建立與取得 Discord Webhook 網址教學？
              </h4>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-xs bg-indigo-900 hover:bg-indigo-800 text-indigo-200 px-2 py-1 rounded"
              >
                關閉教學 ✕
              </button>
            </div>

            <ol className="space-y-3 text-sm font-semibold">
              <li className="flex gap-3 items-start bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800">
                <span className="bg-amber-400 text-slate-950 font-black rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <span className="text-amber-200 font-extrabold">打開您的 Discord 伺服器</span>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    進入您要接收點餐通知的 Discord 伺服器（需要有頻道管理權限）。
                  </p>
                </div>
              </li>

              <li className="flex gap-3 items-start bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800">
                <span className="bg-amber-400 text-slate-950 font-black rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <span className="text-amber-200 font-extrabold">進入頻道設定</span>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    在要接收通知的文字頻道（例如 <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">#點餐通知</code>）右側，點擊 <span className="text-white bg-indigo-800 px-1.5 py-0.5 rounded">⚙️ 編輯頻道</span>。
                  </p>
                </div>
              </li>

              <li className="flex gap-3 items-start bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800">
                <span className="bg-amber-400 text-slate-950 font-black rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <span className="text-amber-200 font-extrabold">點擊「整合 (Integrations)」與建立 Webhook</span>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    在左側選單選擇 <span className="text-white bg-indigo-800 px-1.5 py-0.5 rounded">整合</span> ➜ 點擊 <span className="text-white bg-indigo-800 px-1.5 py-0.5 rounded">Webhooks (網絡鉤子)</span> ➜ 點擊 <span className="text-amber-300 font-bold">「建立 Webhook」</span> 或選擇現有的 Webhook。
                  </p>
                </div>
              </li>

              <li className="flex gap-3 items-start bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800">
                <span className="bg-amber-400 text-slate-950 font-black rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div>
                  <span className="text-amber-200 font-extrabold">複製 Webhook 網址</span>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    可替該 Webhook 自訂名稱（例如：<code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">復古點餐機器人</code>），然後點擊 <span className="text-amber-300 font-bold border-b border-dashed border-amber-300">「複製 Webhook 網址」</span> 按鈕。
                  </p>
                </div>
              </li>

              <li className="flex gap-3 items-start bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800">
                <span className="bg-amber-400 text-slate-950 font-black rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">
                  5
                </span>
                <div>
                  <span className="text-amber-200 font-extrabold">貼上並儲存設定</span>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    將複製好的網址（格式如：<code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">https://discord.com/api/webhooks/123456...</code>）貼入上面的輸入框中，點擊 **「儲存網址」**，並按 **「發送測試」** 即可完成設定！
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* 菜單餐點售賣與庫存狀態管理 (賣完就沒有開關) */}
      <div className="retro-border p-5 sm:p-6 bg-white rounded-xl shadow-lg border-4 border-amber-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-red-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-orange-600 shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-red-700 font-dela">
                餐點售賣與庫存管理
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-600">
                可在此設定各餐點的售賣狀態，設定為「已售完」後客人前台將無法點購 (賣完就沒有)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
              供應中：{menuItems.filter((i) => !i.isSoldOut).length} 項
            </span>
            <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full border border-rose-300">
              已售完：{menuItems.filter((i) => i.isSoldOut).length} 項
            </span>
          </div>
        </div>

        {/* 分類篩選頁籤 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-black text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> 篩選分類：
          </span>
          {['全部', '室內套餐', '戶外套餐', '室內外點心'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setMenuFilterCat(cat)}
              className={`retro-btn px-3 py-1 text-xs sm:text-sm font-black transition-all ${
                menuFilterCat === cat
                  ? 'bg-red-700 text-white border-red-950'
                  : 'bg-amber-100 text-gray-800 border-amber-400 hover:bg-amber-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 餐點清單卡片網格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMenuItems.map((item) => {
            const hasTrackedStock = item.stock !== undefined && item.stock !== null;
            const isSoldOut = Boolean(item.isSoldOut) || (hasTrackedStock && item.stock! <= 0);
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  isSoldOut
                    ? 'bg-stone-100 border-stone-400 text-stone-700 shadow-inner'
                    : 'bg-amber-50/70 border-amber-300 hover:border-amber-500 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-extrabold text-base text-gray-900 font-dela">
                      {item.name}
                    </span>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 border ${
                        item.category === '室內套餐'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : item.category === '戶外套餐'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div className="text-orange-600 font-black text-sm mb-1.5 font-dela">
                    ${item.price.toLocaleString()} G
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* 庫存數量輸入與微調區 */}
                <div className="bg-amber-100/80 p-2.5 rounded-lg border border-amber-300 my-2">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <label className="text-xs font-black text-amber-950 flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5 text-amber-700" />
                      <span>庫存數量：</span>
                    </label>
                    <div>
                      {!hasTrackedStock ? (
                        <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full text-[11px] font-black border border-blue-300">
                          不限庫存
                        </span>
                      ) : isSoldOut ? (
                        <span className="text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full text-[11px] font-black border border-rose-300">
                          0 份 (已售完)
                        </span>
                      ) : (
                        <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-black border border-emerald-300">
                          剩餘 {item.stock} 份
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* -1 按鈕 */}
                    <button
                      type="button"
                      title="減少 1 份"
                      onClick={() => {
                        const current = item.stock ?? 20;
                        onUpdateItemStock(item.id, Math.max(0, current - 1));
                      }}
                      className="retro-btn px-2 py-1 text-xs font-black bg-stone-200 hover:bg-stone-300 border-stone-400 text-stone-800 shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* 店員輸入數量 input */}
                    <div className="relative flex-1 min-w-[60px]">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={item.stock === null || item.stock === undefined ? '' : item.stock}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          if (val === '') {
                            onUpdateItemStock(item.id, null);
                          } else {
                            const num = parseInt(val, 10);
                            onUpdateItemStock(item.id, isNaN(num) ? 0 : Math.max(0, num));
                          }
                        }}
                        placeholder="不限"
                        title="店員可直接在此輸入庫存數量，0 代表售完"
                        className="w-full text-center font-black text-sm bg-white border-2 border-amber-600 rounded-md py-1 px-1 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                      />
                    </div>

                    {/* +1 按鈕 */}
                    <button
                      type="button"
                      title="增加 1 份"
                      onClick={() => {
                        const current = item.stock ?? 0;
                        onUpdateItemStock(item.id, current + 1);
                      }}
                      className="retro-btn px-2 py-1 text-xs font-black bg-stone-200 hover:bg-stone-300 border-stone-400 text-stone-800 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* +10 按鈕 */}
                    <button
                      type="button"
                      title="快速補貨 +10"
                      onClick={() => {
                        const current = item.stock ?? 0;
                        onUpdateItemStock(item.id, current + 10);
                      }}
                      className="retro-btn px-2 py-1 text-xs font-black bg-amber-200 hover:bg-amber-300 border-amber-500 text-amber-950 shrink-0"
                    >
                      +10
                    </button>

                    {/* 設為不限 */}
                    <button
                      type="button"
                      title="設為無限量供應"
                      onClick={() => onUpdateItemStock(item.id, item.stock === null ? 20 : null)}
                      className={`retro-btn px-2 py-1 text-[11px] font-black border shrink-0 ${
                        item.stock === null || item.stock === undefined
                          ? 'bg-blue-600 text-white border-blue-900'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                      }`}
                    >
                      {item.stock === null || item.stock === undefined ? '不限' : '設不限'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {isSoldOut ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                        <Ban className="w-3.5 h-3.5" /> 已售完 (無庫存)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5" /> 正常售賣中
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleItemSoldOut(item.id)}
                    className={`retro-btn px-3 py-1.5 text-xs font-black flex items-center gap-1 shadow-xs transition-transform active:scale-95 ${
                      isSoldOut
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-900'
                        : 'bg-rose-700 hover:bg-rose-800 text-white border-rose-950'
                    }`}
                  >
                    {isSoldOut ? (
                      <>
                        <PackageCheck className="w-3.5 h-3.5" /> 恢復售賣
                      </>
                    ) : (
                      <>
                        <PackageX className="w-3.5 h-3.5" /> 設為賣完
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 訂單管理 (新進訂單區) */}
      <div className="retro-border p-5 sm:p-6 bg-white">
        <div className="flex justify-between items-center mb-6 border-b-4 border-red-700 pb-3">
          <h2 className="text-2xl sm:text-3xl font-black text-red-700 flex items-center gap-2">
            <Layers className="w-8 h-8 text-orange-600" />
            新進訂單 (Pending Orders)
          </h2>
          <span className="bg-red-100 text-red-800 text-sm font-extrabold px-3 py-1 rounded-full border border-red-300">
            待處理：{pendingInner.length + pendingOuter.length + pendingMobile.length} 組
          </span>
        </div>

        {/* 3 分區顯示容器 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. 內場區塊 (🔥 室內套餐) */}
          <div className="bg-red-50 p-4 rounded-xl border-2 border-red-300 shadow-sm flex flex-col">
            <h3 className="text-2xl text-red-800 font-extrabold mb-3 border-b-2 border-red-300 pb-2 text-center flex items-center justify-center gap-2">
              <Flame className="w-6 h-6 text-red-600 fill-red-100" />
              🔥 室內套餐區
            </h3>
            <div id="pending-orders-inner" className="space-y-3 flex-1">
              {pendingInner.length === 0 ? (
                <div className="text-gray-400 font-bold text-center py-8">
                  目前無室內套餐待辦
                </div>
              ) : (
                pendingInner.map((p, idx) => (
                  <div
                    key={`inner-${p.orderKey}-${idx}`}
                    className="border-2 border-red-200 p-3.5 rounded-lg bg-white shadow-sm flex flex-col justify-between transition-all hover:border-red-400"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2 border-b border-dashed border-gray-200 pb-1.5">
                        <span className="text-xs font-extrabold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {p.time}
                        </span>
                        <span className="font-black text-lg text-red-700 bg-yellow-200 px-2.5 py-0.5 rounded border border-red-300">
                          【{p.orderId}】
                        </span>
                      </div>
                      <ul className="list-disc pl-5 font-bold text-base mb-3 text-gray-800 space-y-1">
                        {Object.entries(p.items).map(([name, qty]) => (
                          <li key={name}>
                            {name}{' '}
                            <span className="text-red-600 font-black px-1.5 py-0.5 bg-red-100 rounded text-sm">
                              x{qty}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTakeOrder(p.orderKey, '室內套餐')}
                        className="retro-btn flex-1 py-2 text-sm retro-btn-green flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> 確認並接單
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOrderConfirm(p.orderKey, p.orderId)}
                        title="刪除此筆訂單"
                        className="retro-btn px-2.5 py-2 text-sm bg-rose-700 hover:bg-rose-800 text-white border-rose-950 flex items-center justify-center shrink-0 shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. 外場區塊 (🌊 戶外套餐) */}
          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 shadow-sm flex flex-col">
            <h3 className="text-2xl text-blue-800 font-extrabold mb-3 border-b-2 border-blue-300 pb-2 text-center flex items-center justify-center gap-2">
              <Waves className="w-6 h-6 text-blue-600" />
              🌊 戶外套餐區
            </h3>
            <div id="pending-orders-outer" className="space-y-3 flex-1">
              {pendingOuter.length === 0 ? (
                <div className="text-gray-400 font-bold text-center py-8">
                  目前無戶外套餐待辦
                </div>
              ) : (
                pendingOuter.map((p, idx) => (
                  <div
                    key={`outer-${p.orderKey}-${idx}`}
                    className="border-2 border-blue-200 p-3.5 rounded-lg bg-white shadow-sm flex flex-col justify-between transition-all hover:border-blue-400"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2 border-b border-dashed border-gray-200 pb-1.5">
                        <span className="text-xs font-extrabold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {p.time}
                        </span>
                        <span className="font-black text-lg text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-300">
                          【{p.orderId}】
                        </span>
                      </div>
                      <ul className="list-disc pl-5 font-bold text-base mb-3 text-gray-800 space-y-1">
                        {Object.entries(p.items).map(([name, qty]) => (
                          <li key={name}>
                            {name}{' '}
                            <span className="text-blue-600 font-black px-1.5 py-0.5 bg-blue-100 rounded text-sm">
                              x{qty}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTakeOrder(p.orderKey, '戶外套餐')}
                        className="retro-btn flex-1 py-2 text-sm retro-btn-green flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> 確認並接單
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOrderConfirm(p.orderKey, p.orderId)}
                        title="刪除此筆訂單"
                        className="retro-btn px-2.5 py-2 text-sm bg-rose-700 hover:bg-rose-800 text-white border-rose-950 flex items-center justify-center shrink-0 shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. 機動點心區塊 (⚡ 室內外點心) */}
          <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-300 shadow-sm flex flex-col">
            <h3 className="text-2xl text-emerald-800 font-extrabold mb-3 border-b-2 border-emerald-300 pb-2 text-center flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-emerald-600" />
              ⚡ 室內外點心區
            </h3>
            <div id="pending-orders-mobile" className="space-y-3 flex-1">
              {pendingMobile.length === 0 ? (
                <div className="text-gray-400 font-bold text-center py-8">
                  目前無點心待辦
                </div>
              ) : (
                pendingMobile.map((p, idx) => (
                  <div
                    key={`mobile-${p.orderKey}-${idx}`}
                    className="border-2 border-emerald-200 p-3.5 rounded-lg bg-white shadow-sm flex flex-col justify-between transition-all hover:border-emerald-400"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2 border-b border-dashed border-gray-200 pb-1.5">
                        <span className="text-xs font-extrabold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {p.time}
                        </span>
                        <span className="font-black text-lg text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                          【{p.orderId}】
                        </span>
                      </div>
                      <ul className="list-disc pl-5 font-bold text-base mb-3 text-gray-800 space-y-1">
                        {Object.entries(p.items).map(([name, qty]) => (
                          <li key={name}>
                            {name}{' '}
                            <span className="text-emerald-700 font-black px-1.5 py-0.5 bg-emerald-100 rounded text-sm">
                              x{qty}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTakeOrder(p.orderKey, '室內外點心')}
                        className="retro-btn flex-1 py-2 text-sm retro-btn-green flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> 確認並接單
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOrderConfirm(p.orderKey, p.orderId)}
                        title="刪除此筆訂單"
                        className="retro-btn px-2.5 py-2 text-sm bg-rose-700 hover:bg-rose-800 text-white border-rose-950 flex items-center justify-center shrink-0 shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 業績統計與分紅計算區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 各組銷售統計 */}
        <div className="retro-border p-6 bg-orange-100/90 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black text-red-700 mb-4 border-b-2 border-red-700 pb-2 flex items-center gap-2">
              <Award className="w-7 h-7 text-orange-600" />
              各組 / 個人銷售統計
            </h2>
            <div id="staff-stats" className="font-sans font-bold text-lg space-y-3">
              {Object.keys(staffStats).length === 0 ? (
                <div className="text-gray-500 font-normal italic py-6 text-center">
                  尚無已完成的銷售紀錄。
                </div>
              ) : (
                Object.entries(staffStats).map(([staff, stats]) => {
                  const itemsStr = Object.entries(stats.items)
                    .map(([name, count]) => `${name} x${count}`)
                    .join('、');

                  return (
                    <div
                      key={staff}
                      className="border-b-2 border-red-700 pb-3 mb-2 bg-white p-4 rounded-xl shadow-sm border"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-red-700 text-xl font-black flex items-center gap-1.5">
                          <Users className="w-5 h-5 text-red-600" />
                          {staff}
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold ml-1">
                            {stats.count} 單
                          </span>
                        </span>
                        <span className="text-orange-600 font-black text-2xl">
                          {stats.total.toLocaleString()} G
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm font-bold bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                        {itemsStr}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-orange-200 text-xs text-gray-600 font-bold flex justify-between">
            <span>累計完成訂單：{completedOrders.length} 筆</span>
            <span>接單人員數：{Object.keys(staffStats).length} 人</span>
          </div>
        </div>

        {/* 本日分紅計算機 */}
        <div className="retro-border p-6 bg-yellow-100/90 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black text-red-700 mb-4 border-b-2 border-red-700 pb-2 flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-green-700" />
              本日分紅計算機
            </h2>

            <div className="text-xl mb-6 bg-white p-4 rounded-xl border-2 border-amber-300 shadow-sm">
              <span className="text-gray-700 font-bold">總營業額 (Total Revenue)：</span>
              <br />
              <span id="total-revenue" className="text-red-700 text-4xl sm:text-5xl font-black">
                {totalRevenue.toLocaleString()}
              </span>{' '}
              <span className="text-red-700 font-black text-2xl">G</span>
            </div>

            <div className="my-6 flex items-center justify-between gap-4 bg-amber-200/60 p-3.5 rounded-xl border-2 border-amber-400">
              <label htmlFor="staff-count" className="text-lg font-black text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-700" />
                今日上班總人數：
              </label>
              <input
                type="number"
                id="staff-count"
                value={staffCount}
                min={1}
                onChange={(e) => setStaffCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="border-4 border-red-700 p-2 w-28 text-2xl rounded-xl text-center font-black bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="text-xl pt-4 border-t-4 border-red-700 bg-white p-5 rounded-2xl border-2 shadow-md text-center">
            <span className="text-gray-700 font-bold block mb-1">
              每人平均可分得薪資 (Salary Per Person)
            </span>
            <span id="salary-result" className="text-green-700 text-5xl sm:text-6xl font-black tracking-tight">
              {salaryPerStaff.toLocaleString()}
            </span>{' '}
            <span className="text-green-700 font-black text-3xl">G</span>
          </div>
        </div>
      </div>

      {/* 每日營業統計與歷史紀錄查詢區 */}
      <div className="retro-border p-6 bg-amber-50/95 shadow-xl rounded-2xl mt-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-4 border-red-700 pb-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-red-700 flex items-center gap-2 font-dela">
              <Calendar className="w-8 h-8 text-red-600" />
              每日營業統計與歷史紀錄查詢
            </h2>
            <p className="text-gray-600 font-bold text-sm mt-1">
              可選擇日期查詢單日營業數據、銷量排名與歷史訂單明細
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedDate(getTodayStr());
                setHistoryFilterMode('selected');
              }}
              className={`retro-btn px-3.5 py-1.5 text-sm font-black transition-colors ${
                historyFilterMode === 'selected' && selectedDate === getTodayStr()
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-gray-800 hover:bg-red-50'
              }`}
            >
              今天 ({getTodayStr()})
            </button>
            <button
              onClick={() => {
                setSelectedDate(getYesterdayStr());
                setHistoryFilterMode('selected');
              }}
              className={`retro-btn px-3.5 py-1.5 text-sm font-black transition-colors ${
                historyFilterMode === 'selected' && selectedDate === getYesterdayStr()
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-gray-800 hover:bg-red-50'
              }`}
            >
              昨天 ({getYesterdayStr()})
            </button>
            <button
              onClick={() => setHistoryFilterMode('all')}
              className={`retro-btn px-3.5 py-1.5 text-sm font-black transition-colors ${
                historyFilterMode === 'all'
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-gray-800 hover:bg-red-50'
              }`}
            >
              全部歷史
            </button>

            {/* Custom Date Picker */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border-2 border-red-700 shadow-sm">
              <span className="text-xs font-black text-red-800">指定日期：</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setHistoryFilterMode('selected');
                }}
                className="font-black text-sm text-gray-800 bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Status Bar & Search Input */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-red-100/90 p-4 rounded-xl border-2 border-red-300">
          <div className="flex items-center gap-2">
            <span className="font-black text-red-900 text-base sm:text-lg">
              {historyFilterMode === 'all'
                ? '📜 目前查看：全館所有歷史營業紀錄'
                : `📅 目前查看日期：${selectedDate}`}
            </span>
            <span className="bg-red-700 text-white text-xs font-black px-2.5 py-1 rounded-full">
              共 {historyOrders.length} 筆紀錄
            </span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋顧客姓名、取餐號、餐點或接單人..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm font-bold bg-white border-2 border-red-600 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 hover:text-red-700 bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Selected Date Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-sm flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-extrabold flex items-center justify-between">
              <span>營業總額</span>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-black text-red-700 my-1 font-dela">
              {selectedTotalRevenue.toLocaleString()} <span className="text-base">G</span>
            </div>
            <div className="text-xs text-gray-500 font-bold">
              包含已完成接單之項目
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-sm flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-extrabold flex items-center justify-between">
              <span>成交單數</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-blue-700 my-1 font-dela">
              {selectedCompletedCount} <span className="text-base">單</span>
            </div>
            <div className="text-xs text-gray-500 font-bold">
              單筆平均：{selectedAvgOrderValue.toLocaleString()} G
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-sm flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-extrabold flex items-center justify-between">
              <span>平均客單價</span>
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-3xl font-black text-orange-600 my-1 font-dela">
              {selectedAvgOrderValue.toLocaleString()} <span className="text-base">G</span>
            </div>
            <div className="text-xs text-gray-500 font-bold">
              共計銷售 {selectedCompletedOrders.reduce((sum, o) => sum + o.items.length, 0)} 份餐點
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-sm flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-extrabold flex items-center justify-between">
              <span>熱銷餐點 Top 4</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs font-bold space-y-1 mt-1">
              {sortedTopItems.length === 0 ? (
                <span className="text-gray-400 italic">尚無銷量數據</span>
              ) : (
                sortedTopItems.map(([itemName, data], idx) => (
                  <div key={itemName} className="flex justify-between items-center text-gray-700">
                    <span className="truncate max-w-[120px]">
                      {idx + 1}. {itemName}
                    </span>
                    <span className="text-red-700 font-black">x{data.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Historical Orders Table */}
        <div className="bg-white rounded-xl border-2 border-red-700 overflow-hidden shadow-sm">
          <div className="bg-red-700 text-white px-4 py-3 font-extrabold text-base sm:text-lg flex items-center justify-between">
            <span>歷史訂單列表 ({historyOrders.length} 筆)</span>
            {searchKeyword && (
              <span className="text-xs bg-amber-300 text-red-900 px-2 py-0.5 rounded font-black">
                過濾條件："{searchKeyword}"
              </span>
            )}
          </div>

          {historyOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold">
              無符合條件的營業紀錄或訂單。
            </div>
          ) : (
            <div className="divide-y-2 divide-amber-100 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-amber-100/60 text-gray-700 text-xs font-black uppercase border-b-2 border-amber-200">
                    <th className="p-3">取餐號 / 狀態</th>
                    <th className="p-3">顧客名稱</th>
                    <th className="p-3">下單時間</th>
                    <th className="p-3">餐點明細</th>
                    <th className="p-3 text-right">總金額</th>
                    <th className="p-3">接單處理人員</th>
                    <th className="p-3 text-center whitespace-nowrap">管理操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-800">
                  {historyOrders.map((ord) => {
                    const formattedTime = new Date(ord.timestamp).toLocaleString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const isCompleted = ord.status === 'completed';

                    return (
                      <tr key={ord.id} className="hover:bg-amber-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-dela font-black text-red-700 text-base">
                              #{ord.shortId}
                            </span>
                            {isCompleted ? (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-300 whitespace-nowrap">
                                <CheckCircle className="w-3 h-3 text-green-700" /> 已完成
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-amber-300 whitespace-nowrap">
                                <Clock className="w-3 h-3 text-amber-700" /> 待處理
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-black text-gray-900">{ord.customerName}</td>
                        <td className="p-3 text-gray-500 text-xs font-extrabold whitespace-nowrap">
                          {formattedTime}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {ord.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded font-semibold border border-gray-200"
                              >
                                {item.name} (${item.price}G)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right font-black text-orange-600 text-base font-dela whitespace-nowrap">
                          {ord.total.toLocaleString()} G
                        </td>
                        <td className="p-3">
                          <span className="text-xs bg-red-50 text-red-700 font-bold px-2 py-1 rounded border border-red-200 inline-block">
                            {ord.handler || '未具名接單人'}
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrderConfirm(ord.id, ord.shortId)}
                            className="retro-btn px-2.5 py-1 text-xs bg-rose-700 hover:bg-rose-800 text-white border-rose-950 inline-flex items-center gap-1 shadow-xs"
                            title="刪除此筆訂單紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>刪除訂單</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
