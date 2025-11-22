import { Suspense } from 'react';
import Navigation from '@/components/shared/Navigation';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600">Memuat...</p>
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </div>
  );
}
