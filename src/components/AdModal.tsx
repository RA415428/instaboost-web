import React, { useState, useEffect, useRef } from 'react';
import { Tv, Sparkles, X, CheckCircle2, Play, Pause, Volume2, VolumeX, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { AdBanner } from './AdBanner';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaim?: (coins: number) => void;
  rewardCoins?: number;
  adProvider?: string;
  isAutoTimerAd?: boolean;
  smartlinkUrl?: string;
}

export const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaim,
  rewardCoins = 10,
  adProvider = 'Adsterra / AdMob Video',
  isAutoTimerAd = false,
  smartlinkUrl = 'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915'
}) => {
  const [countdown, setCountdown] = useState<number>(30);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasClaimedRef = useRef<boolean>(false);
  const visitedAdRef = useRef<boolean>(false);

  // Claim reward function
  const handleClaim = () => {
    // Strictly prevent claim if 30s countdown is not completed yet
    if (!canSkip && countdown > 0) return;

    if (onRewardClaim && !hasClaimedRef.current) {
      hasClaimedRef.current = true;
      setRewardClaimed(true);
      setCanSkip(true);
      onRewardClaim(rewardCoins);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCountdown(30);
      setCanSkip(false);
      setRewardClaimed(false);
      setIsPlaying(true);
      hasClaimedRef.current = false;
      visitedAdRef.current = false;

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWatchSmartlink = () => {
    visitedAdRef.current = true;
    if (smartlinkUrl) {
      try {
        window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // popup fallback
      }
    }
  };

  const handleCloseModal = () => {
    if (canSkip && !hasClaimedRef.current) {
      handleClaim();
    } else {
      if (!canSkip && countdown > 0 && !rewardClaimed) {
        // Closed prematurely before 30s - warn user
        alert(`⚠️ Ad closed early (${30 - countdown}s watched). You must watch the complete 30-second video to earn +${rewardCoins} Coins!`);
      }
      onClose();
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-6 select-none overflow-y-auto animate-in fade-in duration-300">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto pt-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 text-amber-300 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md">
            <Tv className="w-4 h-4 text-pink-400" />
            <span>{adProvider}</span>
            <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-300 text-[9px] font-bold rounded uppercase">
              {isAutoTimerAd ? 'Auto Video Ad' : '30s Rewarded Video'}
            </span>
          </span>

          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl backdrop-blur-md transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black rounded-xl shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Reward: +{rewardCoins} Coins</span>
          </div>

          {canSkip || rewardClaimed ? (
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-pink-600 hover:to-purple-600 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1.5 shadow-lg active:opacity-80 border border-slate-700/80"
            >
              <span>Close Ad</span>
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-slate-900/90 border border-slate-800 text-amber-400 text-xs font-mono font-bold rounded-xl shadow-md flex items-center gap-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Reward in {countdown}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Video Ad Experience Canvas */}
      <div className="relative z-10 my-auto w-full max-w-4xl mx-auto min-h-[380px] sm:min-h-[460px] bg-slate-950 rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col justify-between p-4 sm:p-6 text-center">
        
        {/* Real HTML5 Video Stream Player */}
        <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover opacity-60 scale-105 filter brightness-110 contrast-110"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80 pointer-events-none" />
        </div>

        {/* Video Player Header Overlay */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800/80 rounded-lg text-[11px] font-bold text-slate-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            LIVE VIDEO AD (30 SEC)
          </div>
          <button
            onClick={handleWatchSmartlink}
            className="px-3 py-1 bg-purple-600/80 hover:bg-purple-600 border border-purple-400/50 text-white text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition-all backdrop-blur-md shadow-lg"
          >
            <span>Visit Sponsor Site</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Center Interactive Controls & Info */}
        <div className="relative z-10 my-auto flex flex-col items-center max-w-md mx-auto space-y-3 py-4">
          <div className="relative group cursor-pointer" onClick={togglePlay}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 shadow-2xl shadow-pink-500/40 animate-pulse group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950/90 rounded-[22px] flex items-center justify-center backdrop-blur-md">
                {isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 fill-current" />
                ) : (
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 fill-current ml-1" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black rounded-lg shadow-md uppercase">
              {isPlaying ? 'Playing' : 'Paused'}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
              Roxyefollow SMM Network
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium px-4 drop-shadow">
              {isAutoTimerAd
                ? 'Thank you for supporting Roxyefollow! Enjoy instant order processing & continuous service uptime.'
                : 'Watch this complete 30-second video ad to earn instant wallet coins and boost your Instagram profile!'}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center gap-3 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Sponsor
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4 text-purple-400" /> 100K+ Active Users
            </span>
          </div>

          {/* High performance format ad banner */}
          <AdBanner className="my-1" />
        </div>

        {/* 30-Second Fullscreen Video Progress Bar at Bottom */}
        <div className="relative z-10 w-full bg-slate-900/90 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-1000 shadow-lg shadow-amber-500/50"
            style={{ width: `${((30 - countdown) / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Call To Action Controls */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-3 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">
              {rewardClaimed ? 'Coins Added to Your Account!' : 'Watch complete 30s video to get reward'}
            </p>
            <p className="text-[11px] text-slate-400">
              {canSkip ? 'Click below button to claim your reward' : `Reward unlocks automatically in ${countdown}s`}
            </p>
          </div>
        </div>

        {rewardClaimed ? (
          <div className="w-full sm:w-auto px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-black flex items-center justify-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>+{rewardCoins} Coins Claimed!</span>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={!canSkip}
            className={`w-full sm:w-auto px-8 py-3.5 font-black text-xs rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all ${
              canSkip
                ? 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-95 text-white shadow-pink-500/25 active:opacity-80'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {canSkip ? `CLAIM +${rewardCoins} COINS NOW` : `WATCHING 30S VIDEO (${countdown}s)`}
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

