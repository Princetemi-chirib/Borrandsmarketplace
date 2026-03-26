'use client';

import EntryFooter from '@/components/entry/EntryFooter';
import EntryHeader from '@/components/entry/EntryHeader';
import EntryHero from '@/components/entry/EntryHero';
import EntrySections from '@/components/entry/EntrySections';

export default function EntryPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <EntryHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-5">
        <EntryHero />
        <EntrySections />
      </main>
      <EntryFooter />
    </div>
  );
}
