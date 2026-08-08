import React from 'react';
import { CreditCard, Clock, X, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { CoinPackage } from '../types';

interface PaymentModalProps {
  pkg: CoinPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (coins: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  pkg,
  isOpen,
  onClose
}) => {
  if (!isOpen || !pkg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center py-2 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg relative">
            <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-1 shadow-md">
              <CreditCard className="w-3 h-3" />
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
              System Notice
            </span>
            <h3 className="text-lg font-black text-white">
              Payment Methods Are Coming Soon
            </h3>
            <p className="text-xs text-amber-300 font-semibold mt-1">
              ऑनलाइन पेमेंट गेटवे जल्द ही शुरू हो रहा है!
            </p>
          </div>

          {/* Selected Package Details */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Selected Package:</span>
              <span className="font-extrabold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {pkg.coins} Coins
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 font-medium">Package Price:</span>
              <span className="font-black text-white text-sm">{pkg.priceINR}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 text-left flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              We are actively integrating PhonePe, Paytm, and UPI automatic checkout. Direct online payment features will be available in the upcoming app update.
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Roxyefollow Secure Payment Integration</span>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700 hover:bg-slate-700 text-white font-black py-3 rounded-xl transition-colors active:opacity-80 shadow-md text-xs uppercase tracking-wider"
          >
            Okay, Got It
          </button>
        </div>
      </div>
    </div>
  );
};


