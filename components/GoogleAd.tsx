'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function GoogleAd() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!adRef.current || adRef.current.dataset.adsbygoogleStatus) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Google AdSense could not initialize this ad unit.', error);
    }
  }, []);

  return (
    <div className="my-6 w-full overflow-x-auto">
      <div className="mx-auto h-[90px] w-[728px]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'inline-block', width: 728, height: 90 }}
          data-ad-client="ca-pub-9250532329693433"
          data-ad-slot="6587023754"
        />
      </div>
    </div>
  );
}
