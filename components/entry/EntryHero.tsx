'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Search } from 'lucide-react';

export default function EntryHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-red-600 p-5 text-white shadow-sm"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-red-400/40" />

      <p className="text-xs font-medium text-red-100">Guest-friendly ordering</p>
      <h1 className="mt-1 text-2xl font-bold leading-tight">
        Order first. Login only when you are ready to pay.
      </h1>
      <p className="mt-2 text-sm text-red-100">
        Explore restaurants, add meals to cart, then sign in at checkout for
        secure payment and live tracking.
      </p>

      <div className="relative mt-4 flex flex-wrap gap-2">
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <Search className="h-4 w-4" />
          Start Ordering
        </Link>

        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          <GraduationCap className="h-4 w-4" />
          Student Sign up
        </Link>
      </div>
    </motion.div>
  );
}
