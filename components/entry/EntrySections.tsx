'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getImageUrl, isValidImageUrl } from '@/lib/image-utils';
import {
  ArrowRight,
  GraduationCap,
  LogIn,
  Heart,
  ShoppingBag,
  Store,
  Search,
  Star,
  Clock,
} from 'lucide-react';

const categories = [
  { label: 'Restaurants', color: 'bg-red-50 text-red-700', Icon: Store },
  { label: 'Shops', color: 'bg-blue-50 text-blue-700', Icon: ShoppingBag },
];

interface Restaurant {
  _id?: string;
  id: string;
  name: string;
  image?: string;
  bannerImage?: string;
  logo?: string;
  cuisine?: string[] | string;
  estimatedDeliveryTime?: number;
  minimumOrder?: number;
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  todayHours?: { open: string; close: string } | null;
}

export default function EntrySections() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await fetch('/api/marketplace/restaurants', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  const pickImage = (r: Restaurant) => {
    const raw = r.bannerImage || r.image || r.logo || '';
    if (!isValidImageUrl(raw)) return '';
    return getImageUrl(raw);
  };
  const cuisineText = (r: Restaurant) =>
    Array.isArray(r.cuisine) ? r.cuisine.slice(0, 2).join(', ') : (r.cuisine || 'Great meals');

  const filtered = (() => {
    if (!search.trim()) return restaurants;
    const q = search.toLowerCase();
    return restaurants.filter((r) => {
      const cuisine = Array.isArray(r.cuisine) ? r.cuisine.join(' ') : (r.cuisine || '');
      return r.name.toLowerCase().includes(q) || cuisine.toLowerCase().includes(q);
    });
  })();

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Quick categories</h2>
          <span className="text-xs text-gray-500">Campus essentials</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {categories.map(({ label, color, Icon }) => (
            <button
              key={label}
              type="button"
              className={`flex h-20 flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 text-sm font-medium ${color}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">All Restaurants</h2>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Open full page
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or cuisine..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading restaurants...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Link
                key={r.id}
                href={`/restaurants/${r.id}`}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                  r.isOpen === false ? 'border-red-200 opacity-90' : 'border-gray-200'
                }`}
              >
                {pickImage(r) ? (
                  <div className="relative">
                    <img src={pickImage(r)} alt={r.name} className="h-36 w-full object-cover" />
                    {r.isOpen === false && (
                      <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Closed
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative h-36 w-full bg-gradient-to-r from-red-100 to-blue-100">
                    {r.isOpen === false && (
                      <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Closed
                      </span>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.isOpen !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.isOpen !== false ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{cuisineText(r)}</p>
                  {r.isOpen === false && (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                      Currently closed — ordering unavailable
                      {r.todayHours ? ` (hours: ${r.todayHours.open}–${r.todayHours.close})` : ''}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      {Number(r.rating || 0).toFixed(1)} ({r.reviewCount || 0})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {r.estimatedDeliveryTime || 30}m
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
              <Heart className="h-3.5 w-3.5" />
              Smooth Checkout
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Login only when you are about to pay</h3>
            <p className="mt-1 text-sm text-gray-700">
              Build your cart freely first. We only ask authentication at final checkout to keep it quick and secure.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <LogIn className="h-4 w-4" />
              Student Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              <GraduationCap className="h-4 w-4" />
              Create account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
