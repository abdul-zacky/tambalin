'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shop, ApiResponse, Location } from '@/lib/types';

interface ExploreBengkelProps {
  userLocation: Location | null;
}

export default function ExploreBengkel({ userLocation }: ExploreBengkelProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyShops();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const fetchNearbyShops = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/shops/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}`
      );

      const result: ApiResponse<Shop[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal memuat data bengkel');
      }

      setShops(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="mt-4 text-gray-600">Memuat bengkel terdekat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchNearbyShops}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-600">Mengaktifkan lokasi untuk melihat bengkel terdekat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bengkel Terdekat
        </h2>
        <p className="text-sm text-gray-500">
          {shops.length} bengkel ditemukan
        </p>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Belum ada bengkel terdaftar di area Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/bengkel/${shop.id}`}
              className="border border-gray-200 rounded-lg p-4 hover:border-red-500 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                  {shop.name}
                </h3>
                {shop.distance !== undefined && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                    {shop.distance.toFixed(1)} km
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
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

              <button className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Lihat Detail
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
