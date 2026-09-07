import { useEffect, useRef, useState } from 'react';
import { registerPlugin } from '@capacitor/core';

const UnityRewarded = registerPlugin<{
  showRewarded: () => Promise<{ rewarded?: boolean }>;
}>('UnityRewarded');

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
}

export function AdModal({ isOpen, onClose, onReward }: AdModalProps) {
  const started = useRef(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen || started.current || cooldown > 0) return;

    started.current = true;

    UnityRewarded.showRewarded()
      .then(result => {
        if (result?.rewarded) {
          onReward();
        }
      })
      .catch(() => {})
      .finally(() => {
        started.current = false;
        onClose();

        setCooldown(10);

        let remaining = 10;
        const timer = window.setInterval(() => {
          remaining -= 1;
          setCooldown(remaining);

          if (remaining <= 0) {
            window.clearInterval(timer);
          }
        }, 1000);
      });
  }, [isOpen, onClose, onReward, cooldown]);

  return cooldown > 0 ? (
    <div
      style={{
        position: 'fixed',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        padding: '10px 16px',
        borderRadius: 12,
        background: 'rgba(0,0,0,.85)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      Watch Ad available in {cooldown}s
    </div>
  ) : null;
}

export default AdModal;
