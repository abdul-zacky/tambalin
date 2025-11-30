'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/shared/Navigation';
import { Shop, Review, ApiResponse } from '@/lib/types';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import Image from 'next/image';

interface ShopWithReviews extends Shop {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
}

// Dummy data generator
const generateDummyData = (shopId: string): ShopWithReviews => {
  const shopNames = [
    'Bengkel Motor Sejahtera',
    'Ahli Service Motor',
    'Bengkel Express 24 Jam',
    'Motor Servis Pro',
    'Bengkel Cepat Tanggap'
  ];

  const descriptions = [
    'Bengkel motor profesional dengan mekanik berpengalaman lebih dari 10 tahun. Spesialisasi dalam servis rutin, ganti oli, tune-up, dan perbaikan mesin.',
    'Layanan servis motor terpercaya sejak 2005. Kami melayani berbagai jenis motor dari Honda, Yamaha, Suzuki, hingga Kawasaki dengan harga terjangkau.',
    'Bengkel motor 24 jam siap melayani kebutuhan darurat Anda. Dengan tim mekanik handal dan peralatan modern untuk servis cepat dan berkualitas.',
    'Spesialis servis motor matic dan sport. Dilengkapi dengan tools diagnostik modern dan suku cadang original untuk hasil maksimal.',
    'Bengkel motor dengan layanan home service dan lokasi strategis. Kami prioritaskan kepuasan pelanggan dengan garansi servis.'
  ];

  const addresses = [
    'Jl. Sudirman No. 123, Jakarta Pusat',
    'Jl. Gatot Subroto No. 45, Jakarta Selatan',
    'Jl. Thamrin No. 78, Jakarta Pusat',
    'Jl. Rasuna Said No. 56, Jakarta Selatan',
    'Jl. HR Rasuna Said Kav. C-22, Jakarta Selatan'
  ];

  const mechanicNames = [
    ['Pak Budi', 'Mas Andi', 'Bang Toni'],
    ['Pak Joko', 'Mas Rizki', 'Bang Dodi'],
    ['Pak Ahmad', 'Mas Deni', 'Bang Rudi'],
    ['Pak Eko', 'Mas Fandi', 'Bang Hadi'],
    ['Pak Dwi', 'Mas Gani', 'Bang Ivan']
  ];

  const specialties = ['Mesin', 'Kelistrikan', 'Body & Cat', 'Service Rutin', 'Tune Up', 'Transmisi'];

  const reviewerNames = ['Dimas', 'Siti', 'Reza', 'Putri', 'Andi', 'Maya', 'Budi', 'Dewi'];
  const reviewComments = [
    'Servis cepat dan harga terjangkau. Mekaniknya ramah dan profesional.',
    'Bengkel langganan saya. Selalu puas dengan hasil servisnya.',
    'Recommended banget! Tempat bersih dan pelayanan oke.',
    'Harga transparan, gak ada biaya tersembunyi. Mantap!',
    'Mekaniknya jujur dan tidak memaksa ganti parts yang masih bagus.',
    'Lokasi strategis dan mudah dijangkau. Pelayanan cepat.',
    'Sudah langganan di sini 3 tahun. Selalu memuaskan!',
    'Tools lengkap dan modern. Hasil servis rapi dan bersih.'
  ];

  // Convert shopId to a number hash (handle both numeric and string IDs)
  const getHashFromId = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const idHash = getHashFromId(shopId);
  const shopIndex = idHash % shopNames.length;

  // Generate 3-8 reviews
  const reviewCount = 3 + (idHash % 6);
  const reviews: Review[] = Array.from({ length: reviewCount }, (_, i) => ({
    id: `review-${shopId}-${i}`,
    shop_id: shopId,
    user_id: `user-${i}`,
    rating: 3 + ((idHash + i) % 3), // 3-5 stars
    comment: reviewComments[(idHash + i) % reviewComments.length],
    created_at: new Date(Date.now() - i * 86400000 * 7).toISOString(), // Weekly reviews
    user: {
      full_name: reviewerNames[(idHash + i) % reviewerNames.length],
      email: `user${i}@example.com`
    }
  }));

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return {
    id: shopId,
    name: shopNames[shopIndex],
    description: descriptions[shopIndex],
    address: addresses[shopIndex],
    latitude: -6.2 + (idHash % 100) * 0.01,
    longitude: 106.8 + (idHash % 100) * 0.01,
    whatsapp_number: `628${1000000000 + idHash}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    photos: [
      {
        id: `photo-${shopId}-0`,
        shop_id: shopId,
        photo_url: 'https://images.unsplash.com/photo-1486262715619-e563c4ec9e43?w=800&h=600&fit=crop',
        display_order: 0
      },
      {
        id: `photo-${shopId}-1`,
        shop_id: shopId,
        photo_url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&h=600&fit=crop',
        display_order: 1
      },
      {
        id: `photo-${shopId}-2`,
        shop_id: shopId,
        photo_url: 'https://images.unsplash.com/photo-1632823469820-1b788b8f0602?w=800&h=600&fit=crop',
        display_order: 2
      }
    ],
    mechanics: mechanicNames[shopIndex].map((name, i) => ({
      id: `mechanic-${shopId}-${i}`,
      shop_id: shopId,
      name,
      specialty: specialties[(idHash + i) % specialties.length]
    })),
    reviews,
    average_rating: averageRating,
    total_reviews: reviewCount
  };
};

export default function BengkelDetailPage() {
  const params = useParams();
  const shopId = params?.id as string | undefined;
  const [shop, setShop] = useState<ShopWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const { location } = useGeolocation({ immediate: true });

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) return;

      setLoading(true);
      try {
        // For now, use dummy data
        // In production, uncomment the API call below
        /*
        const response = await fetch(`/api/shops/${shopId}`);
        const result: ApiResponse<ShopWithReviews> = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Gagal memuat data bengkel');
        }

        setShop(result.data);
        */

        // Using dummy data
        const dummyShop = generateDummyData(shopId);
        setShop(dummyShop);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  const handleWhatsAppOrder = () => {
    if (!shop || !location) return;

    const message = encodeURIComponent(
      `Halo ${shop.name}, saya ingin melakukan servis motor.\n\n` +
      `Nama: [Isi nama Anda]\n` +
      `No HP: [Isi nomor HP Anda]\n` +
      `Jenis servis: [Isi jenis servis]\n` +
      `Lokasi saya: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    );

    window.open(`https://wa.me/${shop.whatsapp_number}?text=${message}`, '_blank');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : i < rating
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
        <span className="ml-2 text-sm text-[#274b76]/70">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#274b76]"></div>
            <p className="mt-4 text-[#274b76]/70">Memuat detail bengkel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="text-[#274b76] mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#274b76]/70">{error || 'Bengkel tidak ditemukan'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#274b76] mb-2">{shop.name}</h1>
          <button
            onClick={scrollToReviews}
            className="flex items-center gap-4 hover:opacity-70 transition-opacity cursor-pointer"
          >
            {renderStars(shop.average_rating)}
            <span className="text-sm text-[#274b76]/60">
              ({shop.total_reviews} ulasan)
            </span>
          </button>
          {shop.address && (
            <p className="text-sm text-[#274b76]/60 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {shop.address}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-[#274b76]/10">
              <div className="relative aspect-video">
                <Image
                  src={shop.photos?.[selectedImage]?.photo_url || 'https://images.unsplash.com/photo-1486262715619-e563c4ec9e43?w=800&h=600&fit=crop'}
                  alt={`${shop.name} - Foto ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {shop.photos && shop.photos.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {shop.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImage === index
                          ? 'border-[#274b76] shadow-lg'
                          : 'border-transparent hover:border-[#274b76]/30'
                      }`}
                    >
                      <Image
                        src={photo.photo_url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#274b76]/10">
              <h2 className="text-xl font-bold text-[#274b76] mb-3">Tentang Bengkel</h2>
              <p className="text-[#274b76]/70 leading-relaxed">{shop.description}</p>
            </div>

            {/* Mechanics */}
            {shop.mechanics && shop.mechanics.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#274b76]/10">
                <h2 className="text-xl font-bold text-[#274b76] mb-4">Mekanik</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shop.mechanics.map((mechanic) => (
                  <div
                    key={mechanic.id}
                    className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#274b76] flex items-center justify-center text-white font-bold">
                      {mechanic.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#274b76]">{mechanic.name}</p>
                      {mechanic.specialty && (
                        <p className="text-sm text-[#274b76]/60">{mechanic.specialty}</p>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div ref={reviewsSectionRef} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#274b76]/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#274b76]">Ulasan Pelanggan</h2>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-sm text-[#274b76] hover:text-[#1e3a5f] font-medium transition-colors cursor-pointer"
                >
                  {showReviewForm ? 'Batal' : 'Tulis Ulasan'}
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-6 p-4 bg-linear-to-br from-blue-50/50 to-blue-100/50 rounded-xl border border-[#274b76]/10">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedRating === 0) {
                      alert('Silakan pilih rating terlebih dahulu!');
                      return;
                    }
                    // TODO: Handle form submission
                    alert('Fitur review akan segera tersedia! Silakan login terlebih dahulu.');
                    setShowReviewForm(false);
                    setSelectedRating(0);
                  }}>
                    <div className="space-y-4">
                      {/* Rating Input */}
                      <div>
                        <label className="block text-sm font-semibold text-[#274b76] mb-2">
                          Rating {selectedRating > 0 && `(${selectedRating}/5)`}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedRating(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className="text-3xl hover:scale-110 transition-transform focus:outline-none"
                            >
                              <span className={
                                star <= (hoveredRating || selectedRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }>
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div>
                        <label htmlFor="comment" className="block text-sm font-semibold text-[#274b76] mb-2">
                          Ulasan Anda
                        </label>
                        <textarea
                          id="comment"
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-[#274b76]/20 focus:border-[#274b76] focus:ring-2 focus:ring-[#274b76]/20 outline-none transition-all placeholder:text-[#274b76]/50"
                          placeholder="Bagikan pengalaman Anda dengan bengkel ini..."
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full bg-linear-to-r from-[#274b76] to-[#3d6ba8] text-white py-3 rounded-xl font-semibold hover:from-[#1e3a5f] hover:to-[#274b76] transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Kirim Ulasan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {shop.reviews && shop.reviews.length > 0 ? (
                  shop.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-linear-to-br from-blue-50/50 to-blue-100/50 rounded-xl border border-[#274b76]/5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#274b76]">
                          {review.user?.full_name || 'Pengguna'}
                        </p>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                      </div>
                      <span className="text-xs text-[#274b76]/50">
                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-[#274b76]/70 text-sm mt-2">{review.comment}</p>
                  </div>
                  ))
                ) : (
                  <p className="text-center text-[#274b76]/50 py-8">
                    Belum ada ulasan untuk bengkel ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#274b76]/10 sticky top-8">
              <h3 className="text-lg font-bold text-[#274b76] mb-4">Hubungi Bengkel</h3>

              <div className="space-y-3 mb-6">
                {shop.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-[#274b76] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[#274b76]/70">
                      {shop.address}
                    </span>
                  </div>
                )}

                {shop.distance && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-[#274b76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-[#274b76]/70">
                      {shop.distance.toFixed(1)} km dari lokasi Anda
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#274b76] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-[#274b76]/70">{shop.whatsapp_number}</span>
                </div>
              </div>

              <button
                onClick={handleWhatsAppOrder}
                disabled={!location}
                className="w-full bg-linear-to-r from-[#274b76] to-[#3d6ba8] text-white py-4 rounded-xl font-bold hover:from-[#1e3a5f] hover:to-[#274b76] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Pesan via WhatsApp
              </button>

              {!location && (
                <p className="text-xs text-[#274b76]/50 mt-3 text-center">
                  Aktifkan lokasi untuk mengirim koordinat Anda
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-[#274b76]/10">
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`, '_blank')}
                  className="w-full bg-white text-[#274b76] py-3 rounded-xl font-semibold border-2 border-[#274b76] hover:bg-[#274b76] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Buka di Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
