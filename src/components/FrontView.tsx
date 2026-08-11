import React from 'react';
import { MenuItem, CartItem, CategoryType, BusinessHoursConfig } from '../types';
import { Plus, Trash2, ShoppingCart, Utensils, Sparkles, AlertCircle, ShieldAlert, Clock } from 'lucide-react';
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
  const categories: CategoryType[] = ['室內套餐', '室外套餐', '室內外點心'];

  const storeStatus = checkIsBusinessOpen(businessHoursConfig);

  const MIN_SPEND = 25000;
  const totalG = cart.reduce((sum, item) => sum + item.price, 0);
  const isMinSpendMet = totalG >= MIN_SPEND;
  const remainingMinSpend = MIN_SPEND - totalG;

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
                🛑 本店目前非營業時間 (暫停點餐)
              </h3>
              <p className="text-sm font-bold text-red-100 mt-1">
                {storeStatus.reason || '目前非營業時間，請於營業時間再前來點餐。'}
              </p>
            </div>
          </div>
          <div className="bg-red-800/80 px-3.5 py-2 rounded-lg border border-red-600 text-xs font-bold text-amber-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-300" />
            營業時間設定：{businessHoursConfig.openTime} - {businessHoursConfig.closeTime}
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
                    {category === '室外套餐' && '🌊 '}
                    {category === '室內外點心' && '⚡ '}
                    {category}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => storeStatus.isOpen && onAddToCart(item)}
                      disabled={!storeStatus.isOpen}
                      className={`retro-btn p-4 text-left font-sans flex justify-between items-center group relative overflow-hidden transition-all ${
                        !storeStatus.isOpen
                          ? 'opacity-60 grayscale cursor-not-allowed border-gray-500 bg-gray-700'
                          : 'hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-extrabold text-lg text-white group-hover:text-yellow-200 transition-colors flex items-center gap-1.5">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-xs text-orange-100 font-medium mt-1 line-clamp-1 opacity-90">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="bg-yellow-300 text-red-900 px-3 py-1 rounded-full text-sm font-black border-2 border-red-800 shadow-sm whitespace-nowrap group-hover:bg-yellow-200">
                          {item.price.toLocaleString()} G
                        </span>
                        <span className="text-[10px] text-amber-100 font-bold mt-1 flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                          {storeStatus.isOpen ? (
                            <>
                              <Plus className="w-3 h-3" /> 加入購物車
                            </>
                          ) : (
                            '非營業時間'
                          )}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 購物車區 (Shopping Cart Section) */}
      <div className="retro-border p-5 sm:p-6 bg-white h-fit sticky top-6 shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
          <h2 className="text-2xl sm:text-3xl font-black text-red-700 flex items-center gap-2 font-dela">
            <ShoppingCart className="w-7 h-7 text-orange-600" />
            YOUR ORDER
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
            cart.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className="flex justify-between items-center pt-2.5 pb-1 group"
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
              </li>
            ))
          )}
        </ul>

        <div className="pt-4 border-t-4 border-orange-500 mb-4">
          <div className="text-2xl flex justify-between items-baseline font-black mb-2">
            <span className="text-gray-800">Total 總計:</span>
            <span className="text-red-700 text-3xl">
              <span id="cart-total">{totalG.toLocaleString()}</span> G
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
      </div>
    </div>
  );
};

