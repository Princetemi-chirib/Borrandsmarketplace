'use client';

import Link from 'next/link';
import { LogIn, Store } from 'lucide-react';

export default function EntryFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-5">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4">
        <Link href="/restaurants" className="text-sm text-gray-600 hover:text-gray-800">
          Continue as guest
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <LogIn className="h-4 w-4" />
            Student Login
          </Link>

          <Link
            href="/auth/login?role=restaurant"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Store className="h-4 w-4" />
            Restaurant Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
