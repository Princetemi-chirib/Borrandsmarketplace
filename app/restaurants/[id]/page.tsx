'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { getImageUrl, isValidImageUrl } from '@/lib/image-utils';

type Restaurant = { id: string; name: string; description?: string; image?: string; bannerImage?: string; logo?: string };
type MenuItem = { id: string; name: string; price: number; description?: string; image?: string };
type CartItem = { restaurantId: string; restaurantName: string; itemId: string; name: string; price: number; quantity: number; image?: string };

export default function PublicRestaurantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('cart');
    if (raw) setCart(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }, [cart]);

  useEffect(() => {
    const run = async () => {
      const [rRes, mRes] = await Promise.all([
        fetch(`/api/marketplace/restaurants/${id}`, { cache: 'no-store' }),
        fetch(`/api/marketplace/restaurants/${id}/menu`, { cache: 'no-store' }),
      ]);
      const rData = await rRes.json();
      const mData = await mRes.json();
      if (rRes.ok && rData.restaurant) setRestaurant(rData.restaurant);
      if (mRes.ok && Array.isArray(mData.items)) setItems(mData.items);
    };
    if (id) run();
  }, [id]);

  const cartCount = useMemo(() => cart.reduce((s, x) => s + x.quantity, 0), [cart]);

  const add = (item: MenuItem) => {
    if (!restaurant) return;
    setCart((prev) => {
      const found = prev.find((x) => x.itemId === item.id && x.restaurantId === restaurant.id);
      if (found) return prev.map((x) => (x === found ? { ...x, quantity: x.quantity + 1 } : x));
      return [...prev, { restaurantId: restaurant.id, restaurantName: restaurant.name, itemId: item.id, name: item.name, price: Number(item.price), quantity: 1, image: item.image }];
    });
  };

  const sub = (item: MenuItem) => {
    setCart((prev) =>
      prev
        .map((x) => (x.itemId === item.id ? { ...x, quantity: x.quantity - 1 } : x))
        .filter((x) => x.quantity > 0)
    );
  };

  const qty = (itemId: string) => cart.find((x) => x.itemId === itemId)?.quantity || 0;
  const bannerRaw = restaurant?.bannerImage || restaurant?.image || restaurant?.logo || '';
  const bannerImage = isValidImageUrl(bannerRaw) ? getImageUrl(bannerRaw) : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 dark:text-blue-400">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Link href="/checkout" className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Cart ({cartCount})
          </Link>
        </div>

        <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {bannerImage ? (
            <img src={bannerImage} alt={restaurant?.name || 'Restaurant'} className="h-44 w-full object-cover" />
          ) : (
            <div className="h-44 w-full bg-gradient-to-r from-red-100 to-blue-100" />
          )}
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{restaurant?.name || 'Restaurant'}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{restaurant?.description || 'Fresh meals for campus life.'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">N{Number(item.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => sub(item)}
                    className="rounded-md border border-gray-200 p-1 text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm text-gray-900 dark:text-white">{qty(item.id)}</span>
                  <button onClick={() => add(item)} className="rounded-md bg-red-600 p-1 text-white"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              {item.description && <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
