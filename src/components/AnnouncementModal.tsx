import React from 'react';
import { Sparkles, X, ExternalLink } from 'lucide-react';
import { AnnouncementSettings } from '../types';

interface AnnouncementModalProps {
  announcement: AnnouncementSettings;
  isOpen: boolean;
  onClose: () => void;
  onClaimBonus?: (bonusCoins: number) => void;
  directSmartlinkUrl?: string;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  isOpen,
  onClose,
  onClaimBonus,
  directSmartlinkUrl
}) => {
  if (!isOpen || !announcement.enabled) return null;

  const handleClose = () => {
    if (directSmartlinkUrl) {
      try {
        window.open(directSmartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // popup handled
      }
    }
    onClose();
  };

  const handleAction = () => {
    const coins = announcement.bonusCoins ?? 50;
    if (onClaimBonus) {
      onClaimBonus(coins);
    } else {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {announcement.bannerUrl && (
          <img
            src={announcement.bannerUrl}
            alt="Announcement"
            className="w-full h-36 object-cover rounded-2xl mb-4 border border-slate-800"
          />
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-white">{announcement.title}</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">{announcement.message}</p>

        <div className="space-y-2">
          <button
            onClick={handleAction}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
          >
            <span>{announcement.buttonText || 'Claim Bonus'}</span>
            {(announcement.bonusCoins ?? 50) > 0 && (
              <span className="px-2 py-0.5 bg-black/30 text-amber-300 rounded-full text-[10px]">
                +{announcement.bonusCoins ?? 50} Coins
              </span>
            )}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
