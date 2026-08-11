import React from 'react';
import { ShoppingBag, ShieldCheck, Flame } from 'lucide-react';

const HamburgerIcon = ({ className = "w-9 h-9" }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Hamburger"
  >
    {/* Top Bun */}
    <path
      d="M10 28C10 16 20 8 32 8C44 8 54 16 54 28H10Z"
      fill="#F59E0B"
      stroke="#7F1D1D"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Sesame seeds */}
    <ellipse cx="22" cy="17" rx="2" ry="1" fill="#FEF3C7" />
    <ellipse cx="32" cy="14" rx="2" ry="1" fill="#FEF3C7" />
    <ellipse cx="42" cy="18" rx="2" ry="1" fill="#FEF3C7" />
    {/* Lettuce */}
    <path
      d="M8 28C11.5 32.5 15.5 28 19 32.5C22.5 28 26.5 32.5 30 28C33.5 32.5 37.5 28 41 32.5C44.5 28 48.5 32.5 56 28"
      fill="none"
      stroke="#22C55E"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cheese slice */}
    <path
      d="M11 34H53L45 42L36 34L26 43L18 34Z"
      fill="#FACC15"
      stroke="#7F1D1D"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Beef Patty */}
    <rect
      x="9"
      y="38"
      width="46"
      height="9"
      rx="4.5"
      fill="#78350F"
      stroke="#7F1D1D"
      strokeWidth="3.5"
    />
    {/* Bottom Bun */}
    <path
      d="M11 49H53V51C53 54.8 49.8 58 46 58H18C14.2 58 11 54.8 11 51V49Z"
      fill="#F59E0B"
      stroke="#7F1D1D"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
  </svg>
);

interface RetroHeaderProps {
  activeTab: 'front' | 'back';
  onTabChange: (tab: 'front' | 'back') => void;
  pendingCount: number;
}

export const RetroHeader: React.FC<RetroHeaderProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
}) => {
  return (
    <header className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center mb-8 gap-3 px-2">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="bg-amber-300 p-2.5 sm:p-3 rounded-2xl border-4 border-red-700 shadow-[4px_4px_0px_#7f1d1d] animate-bounce shrink-0">
          <HamburgerIcon className="w-9 h-9 sm:w-11 sm:h-11 text-red-700" />
        </div>
        <h1 className="retro-title text-3xl sm:text-4xl md:text-5xl tracking-wider m-0">
          ★ 龍麥呷．自助點餐機 ★
        </h1>
      </div>

      <p className="text-sm sm:text-base text-red-800 font-extrabold tracking-widest text-center bg-yellow-200/80 px-4 py-1 rounded-full border border-red-400 shadow-xs">
        現點現做 ‧ 復古美食 ‧ 室內外包廂熱賣中
      </p>

      <div className="flex gap-3 sm:gap-4 w-full sm:w-auto justify-center mt-2">
        <button
          id="btn-front"
          onClick={() => onTabChange('front')}
          className={`retro-btn px-8 py-2.5 text-lg sm:text-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'front' ? 'tab-btn active' : 'bg-orange-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          客人點餐
        </button>
      </div>

      {/* 隱密角落後台入口 (Discrete Corner Admin Button) */}
      <button
        id="btn-back"
        onClick={() => onTabChange('back')}
        title="後台管理（員工專用）"
        className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 bg-white/80 hover:bg-white text-gray-600 hover:text-red-700 p-2 sm:px-3 sm:py-2 rounded-full border-2 border-red-300 shadow-md backdrop-blur-xs transition-all flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95 group"
      >
        <ShieldCheck className="w-4 h-4 text-red-600 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline opacity-80 group-hover:opacity-100">管理後台</span>
        {pendingCount > 0 && (
          <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border border-yellow-300 animate-bounce">
            {pendingCount}
          </span>
        )}
      </button>
    </header>
  );
};
