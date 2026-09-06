import React, { useState, useRef, useEffect } from 'react';
import { MenuItem, CartItem, CategoryType, BusinessHoursConfig } from '../types';
import { Plus, Trash2, ShoppingCart, Utensils, Sparkles, AlertCircle, ShieldAlert, Check, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkIsBusinessOpen } from '../lib/businessHours';

interface FrontViewProps {
  menuItems: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (index: number) => void;
  onClearCart: () => void;
  onSubmitOrder: () => void;
  businessHoursConfig: BusinessHoursConfig;
}

export const FrontView: React.FC<FrontViewProps> = ({
  menuItems,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onSubmitOrder,
  businessHoursConfig,
}) => {
  const categories: CategoryType[] = ['室內套餐', '戶外套餐', '室內外點心'];

  const storeStatus = checkIsBusinessOpen(businessHoursConfig);

  const MIN_SPEND = 25000;
  const totalG = cart.reduce((sum, item) => sum + item.price, 0);
  const isMinSpendMet = totalG >= MIN_SPEND;
  const remainingMinSpend = MIN_SPEND - totalG;

  // Cart animation states
  const prevCartLengthRef = useRef(cart.length);
  const [bounceKey, setBounceKey] = useState(0);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [addedNotification, setAddedNotification] = useState<{ name: string; key: number } | null>(null);

  useEffect(() => {
    if (cart.length > prevCartLengthRef.current) {
      const latestItem = cart[cart.length - 1];
      setBounceKey((prev) => prev + 1);
      if (latestItem) {
        setAddedNotification({ name: latestItem.name, key: Date.now() });
        const timer = setTimeout(() => {
          setAddedNotification(null);
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
    prevCartLengthRef.current = cart.length;
  }, [cart]);

  const handleItemClick = (item: MenuItem) => {
    if (!storeStatus.isOpen) return;
    const isSoldOut = Boolean(item.isSoldOut) || (item.stock !== undefined && item.stock !== null && item.stock <= 0);
    if (isSoldOut) return;
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 700);
    onAddToCart(item);
  };

  return (
    <div id="view-front" className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 非營業時間頂部告示條 */}
      {!storeStatus.isOpen && (
        <div className="md:col-span-3 p-4 bg-gradient-to-r from-red-950 via-red-900 to-rose-950 text-amber-200 border-4 border-red-700 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-700 rounded-lg text-amber-300 shrink-0">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-dela text-amber-300 flex items-center gap-2">
                🛑 本店目前打烊休息中 (暫停點餐)
              </h3>
              <p className="text-sm font-bold text-red-100 mt-1">
                {storeStatus.reason || '目前店家暫停營業，請待店家開啟營業後再前來點餐。'}
              </p>
            </div>
          </div>
          <div className="bg-red-800/80 px-3.5 py-2 rounded-lg border border-red-600 text-xs font-bold text-amber-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            狀態：店內打烊休息中
          </div>
        </div>
      )}

      {/* 菜單區 (Menu Section) */}
      <div className="md:col-span-2 retro-border p-5 sm:p-6 bg-amber-50/90">
        <div className="flex justify-between items-center mb-6 border-b-4 border-red-700 pb-3">
          <h2 className="text-3xl font-black text-red-700 tracking-wider flex items-center gap-2 font-dela">
            <Utensils className="w-8 h-8 text-orange-600" />
            MENU ‧ 特色菜單
          </h2>
        </div>

        <div id="menu-container" className="space-y-8">
          {categories.map((category) => {
            const items = menuItems.filter((i) => i.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold bg-red-700 text-white inline-block px-4 py-1.5 rounded-lg shadow-md border-2 border-red-900 tracking-wider font-dela">
                    {category === '室內套餐' && '🔥 '}
                    {category === '戶外套餐' && '🌊 '}
                    {category === '室內外點心' && '⚡ '}
                    {category}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const isRecentlyClicked = recentlyAddedId === item.id;
                    const isSoldOut = Boolean(item.isSoldOut) || (item.stock !== undefined && item.stock !== null && item.stock <= 0);
                    const isDisabled = !storeStatus.isOpen || isSoldOut;

                    return (
                      <motion.button
                        key={item.id}
                        whileHover={!isDisabled ? { scale: 1.02 } : {}}
                        whileTap={!isDisabled ? { scale: 0.94 } : {}}
                        onClick={() => handleItemClick(item)}
                        disabled={isDisabled}
                        className={`retro-btn p-4 text-left font-sans flex justify-between items-center group relative overflow-hidden transition-all ${
                          isSoldOut
                            ? 'opacity-70 bg-stone-700/90 border-stone-900 cursor-not-allowed text-stone-300 ring-0 shadow-none'
                            : !storeStatus.isOpen
                            ? 'opacity-60 grayscale cursor-not-allowed border-gray-500 bg-gray-700'
                            : isRecentlyClicked
                            ? 'ring-4 ring-yellow-400 bg-amber-600 shadow-xl'
                            : ''
                        }`}
                      >
                        <div className="pr-2">
                          <div className="font-extrabold text-lg text-white group-hover:text-yellow-200 transition-colors flex items-center gap-1.5 flex-wrap">
                            <span>{item.name}</span>
                            {isSoldOut && (
                              <span className="text-xs bg-rose-700 text-yellow-200 px-2 py-0.5 rounded-md font-black border border-rose-400 inline-flex items-center gap-1 shadow-xs">
                                <Ban className="w-3 h-3" /> 已售完
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-orange-100 font-medium mt-1 line-clamp-1 opacity-90">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          {isSoldOut ? (
                            <span className="bg-rose-800 text-rose-100 px-2.5 py-1 rounded-full text-xs font-black border-2 border-rose-950 shadow-sm whitespace-nowrap">
                              售罄
                            </span>
                          ) : (
                            <span className="bg-yellow-300 text-red-900 px-3 py-1 rounded-full text-sm font-black border-2 border-red-800 shadow-sm whitespace-nowrap group-hover:bg-yellow-200">
                              {item.price.toLocaleString()} G
                            </span>
                          )}
                          <span className="text-[10px] text-amber-100 font-bold mt-1 flex items-center gap-0.5 opacity-90 group-hover:opacity-100">
                            {isSoldOut ? (
                              <span className="text-rose-300 font-bold flex items-center gap-0.5">
                                <Ban className="w-3 h-3" /> 賣完就沒有
                              </span>
                            ) : !storeStatus.isOpen ? (
                              '非營業時間'
                            ) : isRecentlyClicked ? (
                              <span className="text-yellow-200 font-extrabold flex items-center gap-0.5 animate-bounce">
                                <Check className="w-3 h-3 text-yellow-300" /> 已加入！
                              </span>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" /> 加入購物車
                              </>
                            )}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 購物車區 (Shopping Cart Section) */}
      <motion.div
        key={bounceKey}
        animate={
          bounceKey > 0
            ? {
                scale: [1, 1.05, 0.96, 1.03, 0.99, 1],
                y: [0, -8, 2, -2, 0],
              }
            : {}
        }
        transition={{
          duration: 0.45,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="retro-border p-5 sm:p-6 bg-white h-fit sticky top-6 shadow-xl relative"
      >
        {/* Floating "+1 已加入" animated pill */}
        <AnimatePresence>
          {addedNotification && (
            <motion.div
              key={addedNotification.key}
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: -26, scale: 1.05 }}
              exit={{ opacity: 0, y: -42, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-yellow-100 px-4 py-1.5 rounded-full border-2 border-red-900 shadow-2xl font-black text-xs sm:text-sm whitespace-nowrap z-20 flex items-center gap-1.5 font-dela tracking-wide"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>+1 已加入：{addedNotification.name}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
          <h2 className="text-2xl sm:text-3xl font-black text-red-700 flex items-center gap-2 font-dela">
            <motion.div
              key={`icon-${bounceKey}`}
              animate={
                bounceKey > 0
                  ? {
                      rotate: [0, -20, 20, -12, 10, 0],
                      scale: [1, 1.35, 0.95, 1.1, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="inline-block"
            >
              <ShoppingCart className="w-7 h-7 text-orange-600" />
            </motion.div>
            <span>YOUR ORDER</span>
            {cart.length > 0 && (
              <motion.span
                key={`badge-${cart.length}`}
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="bg-yellow-400 text-red-900 text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-red-800 shadow-sm ml-1"
              >
                {cart.length} 份
              </motion.span>
            )}
          </h2>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-gray-500 hover:text-red-600 underline font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> 清空
            </button>
          )}
        </div>

        <ul
          id="cart-list"
          className="space-y-3 mb-6 min-h-[160px] max-h-[320px] overflow-y-auto pr-1 font-sans font-bold text-gray-700 divide-y divide-dashed divide-gray-200"
        >
          {cart.length === 0 ? (
            <li className="text-gray-400 font-normal italic py-12 text-center flex flex-col items-center justify-center gap-2">
              <ShoppingCart className="w-12 h-12 text-amber-200" />
              <span>尚未選擇餐點...<br />點擊左側餐點即可加入！</span>
            </li>
          ) : (
            <AnimatePresence initial={false}>
              {cart.map((item, index) => {
                const isLatest = index === cart.length - 1;
                return (
                  <motion.li
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, scale: 0.75, y: -16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, x: 20 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    className={`flex justify-between items-center pt-2.5 pb-1 group rounded-lg px-2 transition-all ${
                      isLatest && bounceKey > 0 ? 'bg-amber-100/80 ring-2 ring-amber-400 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-extrabold text-base">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-red-700 font-black text-sm">
                        {item.price.toLocaleString()} G
                      </span>
                      <button
                        onClick={() => onRemoveFromCart(index)}
                        title="移除品項"
                        className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-bold hover:bg-red-600 hover:text-white transition-colors border border-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          )}
        </ul>

        <div className="pt-4 border-t-4 border-orange-500 mb-4">
          <div className="text-2xl flex justify-between items-baseline font-black mb-2">
            <span className="text-gray-800">Total 總計:</span>
            <span className="text-red-700 text-3xl">
              <motion.span
                key={`total-${totalG}`}
                animate={bounceKey > 0 ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                id="cart-total"
                className="inline-block"
              >
                {totalG.toLocaleString()}
              </motion.span>{' '}
              G
            </span>
          </div>

          {/* 低消提示區塊 */}
          <div className="p-2.5 rounded-lg border-2 text-xs font-bold flex items-center justify-between gap-2 bg-amber-50 border-amber-300 text-amber-900">
            <span className="flex items-center gap-1 shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              店內低消：
            </span>
            <span className="font-extrabold font-mono text-sm">
              $25,000 G
            </span>
          </div>

          {cart.length > 0 && !isMinSpendMet && (
            <div className="mt-2 p-2 rounded-lg bg-red-100 border-2 border-red-400 text-red-800 text-xs font-black text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              未達低消！還差 <span className="text-red-700 text-sm font-mono">${remainingMinSpend.toLocaleString()} G</span>
            </div>
          )}

          {cart.length > 0 && isMinSpendMet && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-100 border-2 border-emerald-400 text-emerald-800 text-xs font-black text-center flex items-center justify-center gap-1">
              <span>✅ 已符合店內低消標準 ($25,000 G)</span>
            </div>
          )}
        </div>

        <button
          id="btn-submit-order"
          onClick={onSubmitOrder}
          disabled={cart.length === 0 || !isMinSpendMet || !storeStatus.isOpen}
          className={`retro-btn w-full py-3.5 text-xl sm:text-2xl flex items-center justify-center gap-2 ${
            cart.length === 0 || !isMinSpendMet || !storeStatus.isOpen
              ? 'opacity-50 cursor-not-allowed bg-gray-400 border-gray-600 shadow-none'
              : 'retro-btn-green'
          }`}
        >
          <Sparkles className="w-6 h-6" />
          {!storeStatus.isOpen ? '非營業時間 (打烊中)' : '確認點餐 SEND'}
        </button>

        {cart.length > 0 && isMinSpendMet && storeStatus.isOpen && (
          <p className="text-xs text-gray-500 text-center mt-3 font-bold flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            點擊送出後將產生專屬取餐號碼
          </p>
        )}
      </motion.div>
    </div>
  );
};

