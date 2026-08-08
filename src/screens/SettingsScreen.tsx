import React from 'react';
import { UserWallet } from '../types';
import { User, Sun, Moon, HelpCircle, ShieldCheck, FileText, ChevronRight, Copy, Sparkles, Shield, Lock, MessageCircle, Mail } from 'lucide-react';

interface SettingsScreenProps {
  wallet: UserWallet;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenDialog: (type: 'SUPPORT' | 'PRIVACY' | 'TERMS') => void;
  onShowToast: (msg: string) => void;
  onOpenAdmin?: () => void;
  isAdminAllowed?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  wallet,
  isDark,
  onToggleTheme,
  onOpenDialog,
  onShowToast,
  onOpenAdmin,
  isAdminAllowed = false
}) => {
  const [tapCount, setTapCount] = React.useState<number>(0);
  const [unlockedViaGesture, setUnlockedViaGesture] = React.useState<boolean>(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(wallet.memberId);
    onShowToast(`Member ID #${wallet.memberId} copied!`);
  };

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setTapCount(0);
      onShowToast('🔑 Owner Secret Gesture Unlocked!');
      if (onOpenAdmin) onOpenAdmin();
    } else {
      onShowToast(`Tap ${5 - newCount} more time${5 - newCount > 1 ? 's' : ''} for Owner Access`);
    }
  };

  const showAdminCard = isAdminAllowed || unlockedViaGesture;

  return (
    <div className="space-y-4 pb-20 pt-2 px-4 max-w-md mx-auto">
      {/* Member Profile Card */}
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <User className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Roxyefollow Member</p>
            <h3 className="text-sm font-mono font-extrabold text-amber-300">#{wallet.memberId}</h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Verified Reward Tier
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyId}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Copy Member ID"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Preferences Group */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">App Preferences</h4>
        </div>

        <div className="divide-y divide-slate-800/60">
          {/* Theme Toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <div>
                <p className="text-xs font-bold text-white">App Color Theme</p>
                <p className="text-[10px] text-slate-400">{isDark ? 'Dark Mode (Eye Safe)' : 'Light Theme'}</p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="w-12 h-6 rounded-full bg-slate-800 p-1 flex items-center transition-colors relative"
            >
              <div
                className={`w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-amber-400 transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Support & Legal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Help & Legal</h4>
        </div>

        <div className="divide-y divide-slate-800/60">
          <a
            href="https://wa.me/919301484735?text=Hello%20Roxyefollow%20Support%2C%20I%20need%20help%20with%20my%20account."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>24/7 WhatsApp Support</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">Live</span>
                </p>
                <p className="text-[10px] text-slate-400">+91 9301484735 (Instant chat & channel)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </a>

          <a
            href="mailto:nayakhardayal4@gmail.com"
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-pink-400" />
              <div>
                <p className="text-xs font-bold text-white">Email Support</p>
                <p className="text-[10px] text-slate-400">nayakhardayal4@gmail.com</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </a>

          <button
            onClick={() => onOpenDialog('SUPPORT')}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Help Desk & FAQs</p>
                <p className="text-[10px] text-slate-400">Order issues, coins guide & support options</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => onOpenDialog('PRIVACY')}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Privacy Policy</p>
                <p className="text-[10px] text-slate-400">How your non-sensitive data is protected</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => onOpenDialog('TERMS')}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-white">Terms of Service</p>
                <p className="text-[10px] text-slate-400">Rules & fair usage terms</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="text-center pt-2 pb-4">
        <button
          data-no-popunder="true"
          onClick={() => {
            if (onOpenAdmin) onOpenAdmin();
          }}
          className="text-[11px] text-slate-500 font-medium hover:text-purple-400 active:text-purple-400 transition-colors py-1 px-3 rounded-lg select-none"
          title="Owner Admin Panel"
        >
          Roxyefollow v1.0.4
        </button>
      </div>
    </div>
  );
};
