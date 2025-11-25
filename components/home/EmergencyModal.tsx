'use client';

import { useState } from 'react';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import {
  EmergencyRequest,
  EmergencyResponse,
  ApiResponse,
  ShopWithRouteDistance
} from '@/lib/types';
import { generateWhatsAppUrl, formatEmergencyMessage } from '@/lib/utils/location';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { location, error: locationError, loading: locationLoading } = useGeolocation();

  const [formData, setFormData] = useState({
    repair_type: '',
    name: '',
    phone: '',
    additional_details: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyShops, setNearbyShops] = useState<ShopWithRouteDistance[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError('Lokasi belum tersedia. Pastikan Anda mengizinkan akses lokasi.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.repair_type) {
      setError('Mohon lengkapi semua field yang diperlukan.');
      return;
    }

    setLoading(true);

    try {
      const requestData: EmergencyRequest = {
        ...formData,
        user_location: location
      };

      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result: ApiResponse<EmergencyResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal memproses permintaan');
      }

      setNearbyShops(result.data.shops);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleContactShop = (shop: ShopWithRouteDistance) => {
    const message = formatEmergencyMessage(
      formData.name,
      formData.phone,
      formData.repair_type,
      location!,
      formData.additional_details
    );

    const whatsappUrl = generateWhatsAppUrl(shop.whatsapp_number, message);
    window.open(whatsappUrl, '_blank');
  };

  const resetModal = () => {
    setFormData({
      repair_type: '',
      name: '',
      phone: '',
      additional_details: ''
    });
    setShowResults(false);
    setNearbyShops([]);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#274b76]/10">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#274b76]">
              {showResults ? 'Bengkel Terdekat' : 'Permintaan Darurat'}
            </h2>
            <button
              onClick={handleClose}
              className="text-[#274b76]/60 hover:text-[#274b76] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {locationError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{locationError}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!showResults ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#274b76] mb-1">
                  Jenis Perbaikan *
                </label>
                <select
                  value={formData.repair_type}
                  onChange={(e) => setFormData({ ...formData, repair_type: e.target.value })}
                  className="w-full px-4 py-2 border border-[#274b76]/20 rounded-xl focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] appearance-none"
                  required
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23274b76' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="" className="text-gray-400">Pilih jenis perbaikan</option>
                  <option value="Ban Kempes" className="text-[#274b76]">Ban Kempes</option>
                  <option value="Oli Bocor" className="text-[#274b76]">Oli Bocor</option>
                  <option value="Mesin Mati" className="text-[#274b76]">Mesin Mati</option>
                  <option value="Aki Tekor" className="text-[#274b76]">Aki Tekor</option>
                  <option value="Rem Bermasalah" className="text-[#274b76]">Rem Bermasalah</option>
                  <option value="Lainnya" className="text-[#274b76]">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#274b76] mb-1">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#274b76]/20 rounded-xl focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] placeholder:text-[#274b76]/40"
                  placeholder="Masukkan nama Anda"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#274b76] mb-1">
                  Nomor HP *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-2 border border-[#274b76]/20 rounded-xl focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] placeholder:text-[#274b76]/40"
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#274b76] mb-1">
                  Detail Tambahan (Opsional)
                </label>
                <textarea
                  value={formData.additional_details}
                  onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-[#274b76]/20 rounded-xl focus:ring-2 focus:ring-[#274b76] focus:border-transparent bg-white text-[#274b76] placeholder:text-[#274b76]/40"
                  placeholder="Contoh: Motor tidak bisa dinyalakan, sudah di coba berkali-kali"
                />
              </div>

              <button
                type="submit"
                disabled={loading || locationLoading || !location}
                className="w-full bg-linear-to-r from-[#274b76] to-[#3d6ba8] text-white py-3 rounded-xl font-semibold hover:from-[#1e3a5f] hover:to-[#274b76] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? 'Mencari Bengkel Terdekat...' : locationLoading ? 'Mendapatkan Lokasi...' : 'Cari Bengkel Terdekat'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#274b76]/70 mb-4">
                Ditemukan {nearbyShops.length} bengkel terdekat. Klik untuk menghubungi via WhatsApp.
              </p>

              {nearbyShops.map((shop, index) => (
                <div
                  key={shop.id}
                  className="bg-white/80 backdrop-blur-sm border border-[#274b76]/10 rounded-2xl p-4 hover:border-[#274b76]/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-linear-to-br from-[#274b76] to-[#3d6ba8] text-white text-xs font-bold px-2 py-1 rounded-lg">
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold text-lg text-[#274b76]">{shop.name}</h3>
                      </div>
                      <p className="text-sm text-[#274b76]/70 mt-1">{shop.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[#274b76]/60 mt-2">
                    <span>📍 {shop.route_distance.toFixed(1)} km</span>
                    {shop.route_duration > 0 && (
                      <span>🕐 ~{shop.route_duration} menit</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleContactShop(shop)}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded-xl font-medium hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Hubungi via WhatsApp
                  </button>
                </div>
              ))}

              <button
                onClick={resetModal}
                className="w-full border border-[#274b76]/20 text-[#274b76] py-2 rounded-xl font-medium hover:bg-white/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Cari Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
