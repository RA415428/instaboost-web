import React, { useEffect, useState } from 'react';
import { Gift, Lock, Check, Sparkles } from 'lucide-react';
import { UserWallet } from '../types';

interface SocialBarAdProps {
  customText?: string;
  wallet?: UserWallet;
  onClaim?: () => void;
}

const TIMER_KEY = 'socialbar_timer';
const DURATION = 30;

const getTodayKey = () => {
  const now = new Date();
  return `socialbar_claimed_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

export const SocialBarAd: React.FC<SocialBarAdProps> = ({
  customText = 'Claim your daily bonus coins!',
  onClaim
}) => {
  const todayKey = getTodayKey();
  const alreadyClaimed =
    typeof window !== 'undefined' && localStorage.getItem(todayKey) === 'true';

  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(TIMER_KEY);
    if (!saved) return;

    const end = Number(saved);
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));

    if (left > 0) setRemaining(left);
    else {
      localStorage.removeItem(TIMER_KEY);
      if (!alreadyClaimed) {
        localStorage.setItem(todayKey, 'true');
        onClaim?.();
      }
    }
  }, []);

  useEffect(() => {
    if (remaining <= 0) return;

    const id = setInterval(() => {
      const saved = localStorage.getItem(TIMER_KEY);
      if (!saved) return;

      const left = Math.max(0, Math.ceil((Number(saved) - Date.now()) / 1000));
      setRemaining(left);

      if (left <= 0) {
        clearInterval(id);
        localStorage.removeItem(TIMER_KEY);
        if (!alreadyClaimed) {
          localStorage.setItem(todayKey, 'true');
          onClaim?.();
        }
      }
    }, 1000);

    return () => clearInterval(id);
  }, [remaining]);

  const handleClaim = () => {
    if (alreadyClaimed || remaining > 0) return;

    window.open(
      'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915',
      '_blank',
      'noopener,noreferrer'
    );

    const end = Date.now() + DURATION * 1000;
    localStorage.setItem(TIMER_KEY, String(end));
    setRemaining(DURATION);
  };

  return (
    <div className="my-2.5 w-full">
      <div className={`w-full rounded-2xl border p-3 shadow-lg flex items-center justify-between gap-2.5 ${alreadyClaimed ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950 border-pink-500/40'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${alreadyClaimed ? 'bg-slate-800' : 'bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400'}`}>
            {alreadyClaimed ? <Check className="w-4 h-4 text-emerald-400" /> : <Gift className="w-4 h-4 text-amber-400" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${alreadyClaimed ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-pink-400 bg-pink-500/20 border-pink-500/30'}`}>SOCIAL BAR REWARD</span>
              {alreadyClaimed ? (
                <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" />Claimed Today</span>
              ) : remaining > 0 ? (
                <span className="text-[10px] font-extrabold text-amber-300">{remaining}s left</span>
              ) : (
                <span className="text-[10px] font-extrabold text-amber-300 flex items-center gap-1"><Sparkles className="w-3 h-3" />Daily Bonus</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-100 truncate mt-0.5">
              {alreadyClaimed ? 'Daily Social Bar reward already claimed. Come back tomorrow!' : remaining > 0 ? `Return to the app after ${remaining} seconds to claim coins.` : customText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClaim}
          disabled={alreadyClaimed || remaining > 0}
          className={`shrink-0 px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1 ${alreadyClaimed || remaining > 0 ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'}`}
        >
          {alreadyClaimed ? (<><Lock className="w-3 h-3" />Locked</>) : remaining > 0 ? `${remaining}s` : (<><Gift className="w-3 h-3" />Claim</>)}
        </button>
      </div>
    </div>
  );
};
