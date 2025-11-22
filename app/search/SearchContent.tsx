'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { Shop, SearchResponse, ApiResponse } from '@/lib/types';

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [useLocation, setUseLocation] = useState(true);
  const [results, setResults] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { location } = useGeolocation({ immediate: useLocation });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Mohon masukkan nama bengkel');
      return;
    }

    if (query.trim().length < 2) {
      setError('Pencarian minimal 2 karakter');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let url = `/api/shops/search?q=${encodeURIComponent(query.trim())}`;

      if (useLocation && location) {
        url += `&lat=${location.latitude}&lng=${location.longitude}`;
      }

      const response = await fetch(url);
      const result: ApiResponse<SearchResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal melakukan pencarian');
      }

      setResults(result.data.shops);

      // Update URL with search query
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, {
        scroll: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cari Bengkel
        </h1>
        <p className="text-gray-600">
          Temukan bengkel yang Anda butuhkan dengan mudah
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Bengkel
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari bengkel..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mencari...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Cari
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="useLocation"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="useLocation" className="ml-2 text-sm text-gray-700">
              Urutkan berdasarkan jarak terdekat dari lokasi saya
              {useLocation && !location && (
                <span className="text-gray-500 ml-1">(mendapatkan lokasi...)</span>
              )}
            </label>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && !loading && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Hasil Pencarian {query && `"${query}"`}
            </h2>
            <p className="text-sm text-gray-500">
              {results.length} bengkel ditemukan
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-gray-600">
                Coba gunakan kata kunci yang berbeda atau periksa ejaan Anda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/bengkel/${shop.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:border-red-500 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {shop.name}
                    </h3>
                    {shop.distance !== undefined && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                        {shop.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {shop.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {shop.distance !== undefined
                      ? `${shop.distance.toFixed(1)} km dari lokasi Anda`
                      : 'Lokasi tersedia'}
                  </div>

                  <button className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                    Lihat Detail
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial State - Show suggestions */}
      {!hasSearched && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Mulai Pencarian Bengkel
          </h3>
          <p className="text-gray-600 mb-6">
            Masukkan nama bengkel yang Anda cari di kolom pencarian di atas
          </p>

          <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Tips Pencarian:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>Gunakan nama bengkel atau kata kunci spesifik</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>Aktifkan lokasi untuk hasil yang lebih relevan</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>Minimal 2 karakter untuk memulai pencarian</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
