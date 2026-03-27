'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Star, Clock } from 'lucide-react';
import { getImageUrl, isValidImageUrl } from '@/lib/image-utils';

type Restaurant = {
  id: string;
  _id?: string;
  name: string;
  cuisine?: string[] | string;
  image?: string;
  bannerImage?: string;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  estimatedDeliveryTime?: number;
};

export default function PublicRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/marketplace/restaurants', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && Array.isArray(data.restaurants)) setRestaurants(data.restaurants);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return restaurants;
    const q = search.toLowerCase();
    return restaurants.filter((r) => {
      const cuisine = Array.isArray(r.cuisine) ? r.cuisine.join(' ') : (r.cuisine || '');
      return r.name.toLowerCase().includes(q) || cuisine.toLowerCase().includes(q);
    });
  }, [restaurants, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Restaurants</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Browse and add meals before login.</p>
          </div>
          <Link href="/entry" className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400">
            Back
          </Link>
        </div>

        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or cuisine..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Loading restaurants...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const rawImage = r.bannerImage || r.image || r.logo || '';
              const image = isValidImageUrl(rawImage) ? getImageUrl(rawImage) : '';
              const cuisine = Array.isArray(r.cuisine) ? r.cuisine.slice(0, 2).join(', ') : (r.cuisine || 'Meals');
              return (
                <Link key={r.id} href={`/restaurants/${r.id}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  {image ? (
                    <img src={image} alt={r.name} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 w-full bg-gradient-to-r from-red-100 to-blue-100" />
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{r.name}</p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{cuisine}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500" />{Number(r.rating || 0).toFixed(1)} ({r.reviewCount || 0})</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{r.estimatedDeliveryTime || 30}m</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
