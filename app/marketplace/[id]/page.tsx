'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RestaurantMarketplacePage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params?.id as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!restaurantId) return;
    (async () => {
      try {
        setLoading(true);
        const [rRes, mRes] = await Promise.all([
          fetch(`/api/marketplace/restaurants?id=${restaurantId}`),
          fetch(`/api/marketplace/restaurants/${restaurantId}/menu`)
        ]);
        const rJson = await rRes.json();
        const mJson = await mRes.json();
        if (rRes.ok && rJson.restaurant) setRestaurant(rJson.restaurant);
        else if (rRes.ok && rJson.restaurants) setRestaurant(rJson.restaurants.find((x:any)=>x._id===restaurantId));
        if (mRes.ok && mJson.items) setItems(mJson.items);
        if (!rRes.ok) setError(rJson.message || 'Failed to load restaurant');
        else if (!mRes.ok) setError(mJson.message || 'Failed to load menu');
      } catch (e) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button onClick={()=>router.back()} className="text-sm text-gray-700 hover:text-gray-900 mb-4">← Back</button>
        {loading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        {restaurant && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div className="h-44 bg-gray-100" style={{backgroundImage:`url(${restaurant.bannerImage || restaurant.image || ''})`, backgroundSize:'cover', backgroundPosition:'center'}} />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">{restaurant.name}</h1>
                <span className="text-xs text-gray-600">⭐ {restaurant.rating?.toFixed?.(1) || '0.0'}</span>
              </div>
              <div className="text-sm text-gray-600">{(restaurant.cuisine||[]).join(', ')}</div>
              <div className="text-xs text-gray-500">ETA {restaurant.estimatedDeliveryTime || 30} mins • Fee ₦{restaurant.deliveryFee || 0}</div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it:any)=> (
            <div key={it._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-36 bg-gray-100" style={{backgroundImage:`url(${it.image||''})`, backgroundSize:'cover', backgroundPosition:'center'}} />
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 flex-1 truncate">{it.name}</h3>
                  {it.isFeatured && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Featured</span>}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">{it.description}</div>
                <div className="mt-1 text-gray-900 font-medium">₦{it.price?.toLocaleString?.() || it.price} {it.priceDescription? <span className="text-xs text-gray-500">({it.priceDescription})</span> : null}</div>
              </div>
            </div>
          ))}
          {(!loading && items.length===0) && (
            <div className="col-span-full text-center text-gray-500">No published items</div>
          )}
        </div>
      </div>
    </div>
  );
}







