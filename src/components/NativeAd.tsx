import React, { useEffect, useRef } from 'react';

interface NativeAdProps {
  className?: string;
  containerId?: string;
  scriptSrc?: string;
  height?: number | string;
}

export const NativeAd: React.FC<NativeAdProps> = ({
  className = '',
  containerId = 'container-67905e0523b612a6391ce253e028375f',
  scriptSrc = 'https://doubtfulimpatient.com/67905e0523b612a6391ce253e028375f/invoke.js',
  height = 120,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.title = 'Native Advertisement';
    iframe.style.width = '100%';
    iframe.style.height = typeof height === 'number' ? `${height}px` : height;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.borderRadius = '12px';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              width: 100%;
            }
            #${containerId} {
              width: 100%;
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          <div id="${containerId}"></div>
          <script async="async" data-cfasync="false" src="${scriptSrc}"></script>
        </body>
      </html>
    `;

    iframe.srcdoc = htmlContent;
    containerRef.current.appendChild(iframe);
  }, [containerId, scriptSrc, height]);

  return (
    <div className={`w-full max-w-full flex flex-col items-center justify-center my-2 overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className="w-full max-w-full min-h-[90px] flex justify-center items-center overflow-hidden rounded-xl p-1 bg-slate-950/50 border border-purple-500/20 shadow-inner"
      />
    </div>
  );
};
