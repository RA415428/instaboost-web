import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  adKey?: string;
  scriptSrc?: string;
  width?: number;
  height?: number;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  className = '',
  adKey = '2c691dbd36d32c4744a23d7e39d2010b',
  scriptSrc = 'https://www.highperformanceformat.com/2c691dbd36d32c4744a23d7e39d2010b/invoke.js',
  width = 320,
  height = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.title = 'Advertisement';
    iframe.width = width.toString();
    iframe.height = height.toString();
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.maxWidth = '100%';
    iframe.style.width = '100%';
    iframe.style.borderRadius = '8px';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; width: 100%; max-width: 100%; }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '${adKey}',
              'format' : 'iframe',
              'height' : ${height},
              'width' : ${width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="${scriptSrc}"></script>
        </body>
      </html>
    `;

    iframe.srcdoc = htmlContent;
    containerRef.current.appendChild(iframe);
  }, [adKey, scriptSrc, width, height]);

  return (
    <div className={`w-full max-w-full flex flex-col items-center justify-center my-1 overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className="w-full max-w-full flex justify-center items-center overflow-hidden rounded-xl p-1 bg-slate-950/40 border border-purple-500/20 shadow-inner"
      />
    </div>
  );
};

