'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type CartItem = { restaurantId: string; restaurantName: string; itemId: string; name: string; price: number; quantity: number };

export default function PublicCheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const rawCart = localStorage.getItem('cart');
    const rawUser = localStorage.getItem('user');
    if (rawCart) setCart(JSON.parse(rawCart));
    if (rawUser) {
      const user = JSON.parse(rawUser);
      setPhone(user?.phone || '');
    }
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, x) => s + x.price * x.quantity, 0), [cart]);
  const service = 200;
  const delivery = 300;
  const total = subtotal + service + delivery;

  const synthesizeEmailFromPhone = (p: string) => `${(p || '').replace(/\D/g, '') || 'customer'}@borrands.com`;

  const onPay = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cart.length) return setError('Your cart is empty.');
    if (!address.trim()) return setError('Delivery address is required.');
    if (!phone.trim()) return setError('Phone number is required.');

    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    if (!token || !rawUser) {
      localStorage.setItem('postLoginRedirect', '/checkout');
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(rawUser);
    const reference = `BOR_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      setLoading(true);
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: synthesizeEmailFromPhone(user?.phone || phone),
          amount: total,
          reference,
          callback_url: `${window.location.origin}/payment/success?reference=${reference}`,
          metadata: {
            cart: JSON.stringify(cart),
            deliveryAddress: JSON.stringify({ address, instructions, phone }),
            userId: user?._id || user?.id || '',
            role: 'student',
            paymentMethod: 'paystack',
            phone: user?.phone || phone,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to initialize payment');
      window.location.href = data.data.authorization_url;
    } catch (err: any) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/restaurants" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700"><ArrowLeft className="h-4 w-4" />Back</Link>
          <span className="text-sm text-gray-600">{cart.length} item(s)</span>
        </div>

        <form onSubmit={onPay} className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Delivery details</h2>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full delivery address" className="mb-3 w-full rounded-lg border border-gray-200 p-2 text-sm" rows={3} />
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions (optional)" className="mb-3 w-full rounded-lg border border-gray-200 p-2 text-sm" rows={2} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full rounded-lg border border-gray-200 p-2 text-sm" />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Order items</h2>
              <div className="space-y-2">
                {cart.map((x) => (
                  <div key={`${x.restaurantId}-${x.itemId}`} className="flex items-center justify-between text-sm">
                    <span>{x.name} x{x.quantity}</span>
                    <span>N{(x.price * x.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:h-fit">
            <h2 className="mb-3 text-lg font-semibold">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>N{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Service</span><span>N{service.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>N{delivery.toLocaleString()}</span></div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-semibold"><span>Total</span><span>N{total.toLocaleString()}</span></div>
            </div>
            {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
            <button disabled={loading} type="submit" className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {loading ? 'Processing...' : 'Paystack Checkout'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
