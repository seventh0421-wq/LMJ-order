import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  PartyPopper,
  Sparkles,
  CheckCircle2,
  Utensils,
  X,
  Heart,
  RotateCcw,
  Receipt,
  Volume2
} from 'lucide-react';
import { CartItem } from '../types';

export interface CelebrationOrderData {
  shortId: string;
  total: number;
  items: CartItem[];
  orderId: string;
  timestamp: number;
}

interface CelebrationModalProps {
  isOpen: boolean;
  orderData: CelebrationOrderData | null;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  orderData,
  onClose,
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Celebratory Audio Fanfare
  const playFanfare = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.12 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.14 }, // G5
        { freq: 987.77, time: 0.38, dur: 0.14 }, // B5
        { freq: 1046.5, time: 0.52, dur: 0.45 }, // C6 (long finish)
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + n.time);
        gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + n.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + n.time);
        osc.stop(ctx.currentTime + n.time + n.dur);
      });
    } catch {
      // Audio fallback
    }
  };

  // Launch confetti cannons
  const fireConfetti = () => {
    // 1. Center high-speed burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#fbbf24', '#ffffff', '#dc2626'],
      ticks: 250,
      gravity: 0.9,
      scalar: 1.1,
    });

    // 2. Left side cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 70,
        origin: { x: 0.05, y: 0.75 },
        colors: ['#fbbf24', '#f97316', '#dc2626', '#34d399'],
        ticks: 280,
      });
    }, 150);

    // 3. Right side cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 70,
        origin: { x: 0.95, y: 0.75 },
        colors: ['#fbbf24', '#f97316', '#dc2626', '#34d399'],
        ticks: 280,
      });
    }, 300);

    // 4. Star sparkles
    setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 360,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.4 },
        shapes: ['star'],
        colors: ['#fef08a', '#f59e0b', '#ffffff'],
        scalar: 1.2,
      });
    }, 450);
  };

  useEffect(() => {
    if (isOpen) {
      playFanfare();
      fireConfetti();
    }
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

  // Group items by name to display nicely with count
  const itemCounts: Record<string, { count: number; price: number; category: string }> = {};
  for (const item of orderData.items) {
    if (!itemCounts[item.name]) {
      itemCounts[item.name] = { count: 0, price: item.price, category: item.category };
    }
    itemCounts[item.name].count += 1;
  }

  const formattedTime = new Date(orderData.timestamp || Date.now()).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <AnimatePresence>
      <div
        id="full-screen-celebration"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Animated Rotating Retro Sunburst in Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="sunburst absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220vmax] h-[220vmax]" />
        </div>

        {/* Floating background decorative stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [-15, 15, -15], rotate: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-12 left-8 text-yellow-300 opacity-60 hidden sm:block"
          >
            <Sparkles className="w-12 h-12" />
          </motion.div>
          <motion.div
            animate={{ y: [15, -15, 15], rotate: [0, -25, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-16 right-10 text-yellow-300 opacity-60 hidden sm:block"
          >
            <Sparkles className="w-16 h-16" />
          </motion.div>
        </div>

        {/* Main Celebration Card */}
        <motion.div
          initial={{ scale: 0.65, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-amber-50 via-white to-amber-50 retro-border p-5 sm:p-8 shadow-2xl z-10 border-4 border-red-700"
        >
          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition-colors border-2 border-red-400 z-20 cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badge */}
          <div className="text-center mb-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
              className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full border-4 border-red-700 shadow-lg mb-3"
            >
              <PartyPopper className="w-10 h-10 text-red-800 animate-bounce" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="inline-block bg-red-700 text-yellow-200 text-xs sm:text-sm font-black px-4 py-1 rounded-full border-2 border-red-900 shadow mb-2 font-dela tracking-wider">
                ★ ORDER COMPLETED ‧ 感謝您的光臨 ★
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-red-700 font-dela tracking-wide drop-shadow-sm flex items-center justify-center gap-2">
                <span>🎊 點餐成功！</span>
              </h2>
              <p className="text-sm sm:text-base font-bold text-amber-950 mt-1 flex items-center justify-center gap-1.5">
                <Heart className="w-4 h-4 text-red-600 fill-red-600" />
                龍麥呷熱情感謝您的支持，餐點現正為您全力備妥中！
              </p>
            </motion.div>
          </div>

          {/* Ticket Style Voucher Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="ticket-border rounded-xl p-4 sm:p-5 mb-5 shadow-inner"
          >
            {/* Ticket Header & Game ID */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-red-300 pb-3 mb-3">
              <div>
                <span className="text-xs font-black text-red-800 uppercase tracking-widest block">
                  🎫 您的專屬取餐遊戲 ID
                </span>
                <div className="text-2xl sm:text-3xl font-black text-red-700 font-dela mt-0.5 tracking-wider">
                  【 {orderData.shortId} 】
                </div>
              </div>
              <div className="sm:text-right bg-red-700 text-yellow-300 px-3 py-1.5 rounded-lg border border-red-900 shadow-sm shrink-0 self-start sm:self-auto">
                <span className="text-[10px] block font-bold text-amber-100">消費總額</span>
                <span className="text-xl sm:text-2xl font-black font-mono">
                  ${orderData.total.toLocaleString()} <span className="text-xs">G</span>
                </span>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              <div className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1">
                <Utensils className="w-3.5 h-3.5 text-orange-600" />
                本次點餐品項明細（共 {orderData.items.length} 份）：
              </div>
              {Object.entries(itemCounts).map(([name, data]) => (
                <div
                  key={name}
                  className="flex justify-between items-center text-sm font-bold bg-amber-100/70 px-2.5 py-1.5 rounded-md border border-amber-200"
                >
                  <span className="text-gray-900 flex items-center gap-1.5">
                    <span className="text-xs text-orange-700 font-extrabold">[{data.category}]</span>
                    {name}
                  </span>
                  <span className="text-red-700 font-black">
                    x{data.count}
                    <span className="text-xs text-gray-600 ml-1">
                      (${(data.price * data.count).toLocaleString()} G)
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 border-t border-dashed border-red-300 flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span>下單時間：{formattedTime}</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                訂單已即時同步傳送至後台廚房
              </span>
            </div>
          </motion.div>

          {/* Instructions Box */}
          <div className="bg-amber-100/90 border-2 border-amber-400 rounded-xl p-3 sm:p-4 mb-6 text-center text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
            📢 <strong className="text-red-700">取餐提醒：</strong>
            請記住您的遊戲 ID<strong>【 {orderData.shortId} 】</strong>，並至現場櫃檯等候唱號領餐及付款。祝您用餐愉快！
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                fireConfetti();
                playFanfare();
              }}
              className="retro-btn px-4 py-2.5 text-sm sm:text-base bg-amber-500 hover:bg-amber-400 border-amber-800 text-amber-950 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              再來一發彩帶！🎉
            </button>
            <button
              type="button"
              onClick={onClose}
              className="retro-btn retro-btn-green flex-1 py-3 text-lg sm:text-xl flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              我知道了，返回點餐機！
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
