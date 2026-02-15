'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Store } from 'lucide-react';
import Logo from '@/components/Logo';

export default function EntryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Logo at top */}
      <header className="pt-8 pb-6 px-4 flex justify-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50">
        <Logo size="lg" showText={true} />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Sign in to continue
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <GraduationCap className="h-5 w-5" />
              Student Login
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Store className="h-5 w-5" />
              Restaurant Login
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            Same login page — your account type is detected automatically.
          </p>
        </motion.div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-400">
          Back to home
        </Link>
      </footer>
    </div>
  );
}
