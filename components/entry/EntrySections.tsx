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
} from 'lucide-react';

const categories = [
  { label: 'Restaurants', color: 'bg-red-50 text-red-700', Icon: Store },
  { label: 'Shops', color: 'bg-blue-50 text-blue-700', Icon: ShoppingBag },
];

interface FeaturedRestaurant {
  _id?: string;
  id: string;
  name: string;
  image?: string;
  bannerImage?: string;
  logo?: string;
  university?: string;
  cuisine?: string[] | string;
  estimatedDeliveryTime?: number;
  minimumOrder?: number;
}

export default function EntrySections() {
  const [featured, setFeatured] = useState<FeaturedRestaurant[]>([]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch('/api/marketplace/restaurants', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && Array.isArray(data.restaurants)) {
          const selectedCampus = localStorage.getItem('selectedCampus') || 'All campuses';
          const scoped = selectedCampus === 'All campuses'
            ? data.restaurants
            : data.restaurants.filter((r: FeaturedRestaurant) => (r.university || '') === selectedCampus);
          setFeatured((scoped.length ? scoped : data.restaurants).slice(0, 2));
        }
      } catch {}
    };
    loadFeatured();
    const onCampusChanged = () => loadFeatured();
    window.addEventListener('campus-changed', onCampusChanged as EventListener);
    return () => window.removeEventListener('campus-changed', onCampusChanged as EventListener);
  }, []);

  const pickImage = (r: FeaturedRestaurant) => {
    const raw = r.bannerImage || r.image || r.logo || '';
    if (!isValidImageUrl(raw)) return '';
    return getImageUrl(raw);
  };
  const cuisineText = (r: FeaturedRestaurant) =>
    Array.isArray(r.cuisine) ? r.cuisine.slice(0, 2).join(', ') : (r.cuisine || 'Great meals');

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
          <h2 className="text-xl font-bold">Featured Restaurants</h2>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {featured.map((r, idx) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.id}`}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {pickImage(r) ? (
                <img src={pickImage(r)} alt={r.name} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full bg-gradient-to-r from-red-100 to-blue-100" />
              )}
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold">{r.name}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${idx === 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {idx === 0 ? 'Hot' : 'Trending'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{cuisineText(r)}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Delivery {r.estimatedDeliveryTime || 30} mins</span>
                  <span>From N{Number(r.minimumOrder || 1500).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
