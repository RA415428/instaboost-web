import React, { useEffect } from 'react';

interface PopunderHandlerProps {
  smartlinkUrl?: string;
  enabled?: boolean;
}

export const PopunderHandler: React.FC<PopunderHandlerProps> = ({
  smartlinkUrl = 'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915',
  enabled = true
}) => {
  useEffect(() => {
    // Global click popunder removed per user request.
    // Ads trigger strictly when order is successfully placed or when watch ad buttons are clicked.
  }, [enabled, smartlinkUrl]);

  return null;
};


