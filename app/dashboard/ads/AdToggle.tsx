'use client';

import { useState } from 'react';

interface AdUnit {
  id: string;
  name: string;
  slot: string;
  position: string;
  isActive: boolean;
}

export function AdToggle({ ad }: { ad: AdUnit }) {
  const [active, setActive] = useState(ad.isActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/admin/ads/${ad.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !active }),
    });
    if (res.ok) setActive(!active);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-60 ${
        active ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        active ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  );
}
