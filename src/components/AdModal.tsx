import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!isOpen || started.current) return;

    started.current = true;

    UnityRewarded.showRewarded()
      .then(result => {
        if (result?.rewarded) onReward();
      })
      .catch(() => {})
      .finally(() => {
        started.current = false;
        onClose();
      });
  }, [isOpen, onClose, onReward]);

  return null;
}

export default AdModal;
