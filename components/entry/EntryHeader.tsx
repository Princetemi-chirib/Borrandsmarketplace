'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, MapPin, Store } from 'lucide-react';
import Logo from '@/components/Logo';

export default function EntryHeader() {
  const [campus, setCampus] = useState('All campuses');
  const [open, setOpen] = useState(false);
  const [campuses, setCampuses] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedCampus');
      if (saved) setCampus(saved);
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw);
      if (u?.university && typeof u.university === 'string') {
        setCampus(u.university);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        const res = await fetch('/api/marketplace/restaurants', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && Array.isArray(data?.restaurants)) {
          const set = new Set<string>();
          for (const r of data.restaurants) {
            if (r?.university && String(r.university).trim()) {
              set.add(String(r.university).trim());
            }
          }
          setCampuses(Array.from(set).slice(0, 20));
        }
      } catch {}
    };
    loadCampuses();
  }, []);

  const chooseCampus = (value: string) => {
    setCampus(value);
    setOpen(false);
    localStorage.setItem('selectedCampus', value);
    window.dispatchEvent(new CustomEvent('campus-changed', { detail: { campus: value } }));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo size="sm" showText={true} />
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            >
              <MapPin className="h-3.5 w-3.5" />
              {campus}
            </button>
            {open && (
              <div className="absolute left-0 top-9 z-40 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => chooseCampus('All campuses')}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50"
                >
                  All campuses
                </button>
                {campuses.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => chooseCampus(c)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>

          <Link
            href="/auth/login?role=restaurant"
            className="inline-flex items-center gap-1 rounded-full bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <Store className="h-3.5 w-3.5" />
            Restaurant Login
          </Link>
        </div>
      </div>
    </header>
  );
}
