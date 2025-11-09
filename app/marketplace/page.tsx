'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MarketplacePage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/marketplace/restaurants');
        const json = await res.json();
        if (res.ok && json.restaurants) setRestaurants(json.restaurants);
        else setError(json.message || 'Failed to load restaurants');
      } catch (e) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold he typed text to text-gray-900">Marketplace</h1>
          <p className="text-gray-600 text-sm">Browse active restaurants and order delicious meals.</p>
        </div>
        {loading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((r:any) => {
            const restaurantId = r.id || r._id;
            return (
              <Link key={restaurantId} href={`/marketplace/${restaurantId}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-gray-100" style={{backgroundImage: `url(${r.bannerImage || r.image || ''})`, backgroundSize: 'cover', backgroundPosition: 'center'}} />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">{r.name}</h3>
                    <span className="text-xs text-gray-600">⭐ {r.rating?.toFixed?.(1) || '0.0'}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{(r.cuisine||[]).join(', ')}</div>
                  <div className="mt-1 text-xs text-gray-600">ETA {r.estimatedDeliveryTime || 30} mins • Fee ₦{r.deliveryFee || 0}</div>
                </div>
              </Link>
            );
          })}
          {(!loading && restaurants.length===0) && (
            <div className="col-span-full text-center text-gray-500">No active restaurants</div>
          )}
        </div>
      </div>
    </div>
  );
}
