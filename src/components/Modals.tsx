import React, { useState } from 'react';
import { CategoryType } from '../types';
import { KeyRound, UserCheck, Plus, ShieldAlert, X, User, Send, AlertTriangle } from 'lucide-react';
import { checkIsForbiddenStaffName } from '../lib/validation';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="retro-border p-6 max-w-md w-full text-center bg-white shadow-2xl relative">
        <h3 className="text-2xl sm:text-3xl font-black text-red-700 mb-4 border-b-2 border-red-200 pb-2 flex items-center justify-center gap-2">
          <ShieldAlert className="w-7 h-7 text-red-600" />
          {title}
        </h3>
        <p className="font-sans font-bold text-lg text-gray-800 mb-6 whitespace-pre-line leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-200">
          {message}
        </p>
        <button
          onClick={onConfirm}
          className="retro-btn w-full py-2.5 text-xl retro-btn-green"
        >
          確認
        </button>
      </div>
    </div>
  );
};

interface CustomerModalProps {
  isOpen: boolean;
  totalAmount: number;
  onSubmit: (customerName: string) => void;
  onCancel: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  totalAmount,
  onSubmit,
  onCancel,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setShowWarning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const forbiddenResult = checkIsForbiddenStaffName(customerName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (forbiddenResult.isForbidden) {
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);
    const finalName = customerName.trim() || `玩家_${Math.floor(100 + Math.random() * 900)}`;
    onSubmit(finalName);
    setCustomerName('');
    setShowWarning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="retro-border p-6 max-w-md w-full bg-white shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4 border-b-4 border-red-700 pb-2">
          <h3 className="text-2xl font-black text-red-700 flex items-center gap-2 font-dela">
            <User className="w-7 h-7 text-orange-600" />
            確認點餐與遊戲 ID
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 訂單總金額顯示卡片 */}
        <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-3.5 mb-5 text-center shadow-inner">
          <span className="text-sm font-extrabold text-gray-700 block mb-1">💰 本次點餐消費總金額 💰</span>
          <span className="text-3xl sm:text-4xl font-black text-red-700 font-dela tracking-wider">
            ${totalAmount.toLocaleString()} <span className="text-xl text-red-900 font-bold">G</span>
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="font-bold text-gray-700 mb-2 text-base">
            請輸入您正確的遊戲 ID，方便核對與唱號取餐：
          </p>

          <input
            type="text"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (showWarning) setShowWarning(false);
            }}
            placeholder="請輸入正確的遊戲 ID..."
            autoFocus
            maxLength={20}
            className={`w-full border-4 p-3 text-2xl rounded-xl mb-3 text-center font-black bg-amber-50 focus:outline-none tracking-wide transition-all ${
              forbiddenResult.isForbidden || showWarning
                ? 'border-rose-600 bg-rose-50 text-rose-800 ring-4 ring-rose-300'
                : 'border-red-700 focus:ring-4 focus:ring-amber-300'
            }`}
          />

          {/* 店員名字禁用警告 */}
          {(forbiddenResult.isForbidden || showWarning) && (
            <div className="mb-5 p-3.5 bg-rose-600 text-white rounded-xl border-3 border-rose-950 shadow-lg text-center animate-bounce">
              <div className="flex items-center justify-center gap-1.5 text-lg font-black font-dela tracking-wider">
                <AlertTriangle className="w-5 h-5 text-yellow-300 shrink-0" />
                <span>你連自己名字都忘了？</span>
              </div>
              <p className="text-xs font-bold text-rose-100 mt-1">
                ※ 偵測到使用店員名稱（包含數字與符號組合），禁止使用！請輸入顧客您本人的遊戲 ID。
              </p>
            </div>
          )}

          <div className="flex justify-between gap-4 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="retro-btn px-4 py-2.5 text-lg retro-btn-gray flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || forbiddenResult.isForbidden}
              className={`retro-btn px-4 py-2.5 text-lg flex-1 flex items-center justify-center gap-1.5 transition-all ${
                forbiddenResult.isForbidden
                  ? 'bg-gray-400 border-gray-600 text-gray-200 cursor-not-allowed opacity-60'
                  : 'retro-btn-green'
              }`}
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? '處理中...' : '確認送出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PasswordModalProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="retro-border p-6 max-w-sm w-full bg-white shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b-2 border-red-700 pb-2">
          <h3 className="text-2xl font-black text-red-700 flex items-center gap-2">
            <KeyRound className="w-6 h-6" />
            管理員身分驗證
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="font-bold text-gray-700 mb-2">請輸入後台專屬密碼：</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full border-4 border-red-700 p-2.5 text-2xl rounded-xl mb-6 text-center font-bold tracking-widest bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="retro-btn px-4 py-2 text-lg retro-btn-gray flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              className="retro-btn px-4 py-2 text-lg flex-1"
            >
              進入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StaffModalProps {
  isOpen: boolean;
  categoryName?: string;
  onSubmit: (staffName: string) => void;
  onCancel: () => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  categoryName,
  onSubmit,
  onCancel,
}) => {
  const [staffName, setStaffName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;
    onSubmit(staffName.trim());
    setStaffName('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="retro-border p-6 max-w-sm w-full bg-white shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b-2 border-red-700 pb-2">
          <h3 className="text-xl sm:text-2xl font-black text-red-700 flex items-center gap-1.5 font-dela">
            <UserCheck className="w-6 h-6" />
            確認接單 {categoryName ? `(${categoryName})` : ''}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="font-bold text-gray-700 mb-2">請輸入店員姓名 (接單人)：</p>
          <input
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            autoFocus
            className="w-full border-4 border-red-700 p-2.5 text-xl rounded-xl mb-6 text-center font-bold bg-amber-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="retro-btn px-4 py-2 text-lg retro-btn-gray flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!staffName.trim()}
              className={`retro-btn px-4 py-2 text-lg flex-1 ${
                !staffName.trim() ? 'opacity-50 cursor-not-allowed' : 'retro-btn-green'
              }`}
            >
              完成訂單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddItemModalProps {
  isOpen: boolean;
  onSubmit: (item: {
    name: string;
    price: number;
    category: CategoryType;
    description: string;
    stock?: number | null;
  }) => void;
  onCancel: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(10000);
  const [category, setCategory] = useState<CategoryType>('室內套餐');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState<number | null>(20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;
    onSubmit({
      name: name.trim(),
      price: Number(price),
      category,
      description: description.trim(),
      stock,
    });
    setName('');
    setPrice(10000);
    setDescription('');
    setStock(20);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="retro-border p-6 max-w-md w-full bg-white shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b-2 border-red-700 pb-2">
          <h3 className="text-2xl font-black text-red-700 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            新增菜單品項
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              品項名稱：
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：特級噴火龍捲餅"
              className="w-full border-2 border-red-700 p-2 rounded-lg font-bold bg-amber-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              分類：
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full border-2 border-red-700 p-2 rounded-lg font-bold bg-amber-50"
            >
              <option value="室內套餐">🔥 室內套餐</option>
              <option value="戶外套餐">🌊 戶外套餐</option>
              <option value="室內外點心">⚡ 室內外點心</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              價格 (G)：
            </label>
            <input
              type="number"
              required
              min={100}
              step={100}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border-2 border-red-700 p-2 rounded-lg font-bold bg-amber-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              描述 (可選)：
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="簡短介紹該餐點特色"
              className="w-full border-2 border-red-700 p-2 rounded-lg font-bold bg-amber-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              初始庫存數量 (份)：
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={stock === null ? '' : stock}
                onChange={(e) => {
                  const val = e.target.value;
                  setStock(val === '' ? null : Math.max(0, parseInt(val, 10) || 0));
                }}
                placeholder="留空為不限庫存"
                className="w-full border-2 border-red-700 p-2 rounded-lg font-bold bg-amber-50"
              />
              <button
                type="button"
                onClick={() => setStock(stock === null ? 20 : null)}
                className="retro-btn text-xs px-3 py-2 font-black whitespace-nowrap bg-stone-100 hover:bg-stone-200 border-stone-400 shrink-0"
              >
                {stock === null ? '改設具體數量' : '改為不限'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 font-bold mt-1">
              留空代表無限量供應；若填入具體數字（如 20），售完即自動下架。
            </p>
          </div>

          <div className="flex justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="retro-btn px-4 py-2 text-lg retro-btn-gray flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              className="retro-btn px-4 py-2 text-lg retro-btn-green flex-1"
            >
              新增至菜單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
