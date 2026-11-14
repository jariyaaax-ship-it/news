'use client';

import { useEffect } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  style?: React.CSSProperties;
}

const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const isRealAdsense = clientId && !clientId.includes('XXXX');

export function AdUnit({ slot, format = 'auto', className = '', style }: AdUnitProps) {
  useEffect(() => {
    if (isRealAdsense) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, []);

  if (!isRealAdsense) {
    // Dev/placeholder mode
    return (
      <div className={`adsense-placeholder ${className}`} style={style}>
        <div className="text-center">
          <div className="text-2xl mb-1">📢</div>
          <div>พื้นที่โฆษณา Google AdSense</div>
          <div className="text-xs mt-1 text-gray-400">จะแสดงโฆษณาจริงหลังจาก AdSense อนุมัติ</div>
        </div>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
