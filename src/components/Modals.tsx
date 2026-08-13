import React, { useState } from 'react';
import { CategoryType } from '../types';
import { KeyRound, UserCheck, Plus, ShieldAlert, X, User, Send } from 'lucide-react';

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

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalName = customerName.trim() || `玩家_${Math.floor(100 + Math.random() * 900)}`;
    onSubmit(finalName);
    setCustomerName('');
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
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="請輸入正確的遊戲 ID..."
            autoFocus
            maxLength={20}
            className="w-full border-4 border-red-700 p-3 text-2xl rounded-xl mb-6 text-center font-black bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-300 tracking-wide"
          />

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="retro-btn px-4 py-2.5 text-lg retro-btn-gray flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="retro-btn px-4 py-2.5 text-lg retro-btn-green flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;
    onSubmit({
      name: name.trim(),
      price: Number(price),
      category,
      description: description.trim(),
    });
    setName('');
    setPrice(10000);
    setDescription('');
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
