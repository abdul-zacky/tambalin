# Developer 1 - Setup & Configuration Guide

## 🎯 Tugas yang Sudah Diselesaikan

Saya telah menyelesaikan semua fitur untuk **Developer 1** sesuai dengan pembagian tugas:

### ✅ Completed Features

1. **Home Page** (Complete)
   - Hero section dengan emergency button
   - Navigation bar
   - Features showcase
   - Explore Bengkel section dengan sorting berdasarkan jarak

2. **Search Page** (Complete)
   - Search bar dengan filter
   - Optional location-based sorting
   - Results display
   - Empty state dan error handling

3. **Location Services** (Shared Module)
   - Geolocation permission handler
   - Haversine formula untuk straight-line distance
   - Google Maps URL generator
   - WhatsApp URL generator dengan message formatting
   - Rate limiter untuk Google Maps API

4. **API Routes**
   - `GET /api/shops/nearby` - Bengkel terdekat dengan straight-line distance
   - `POST /api/emergency` - Emergency request dengan Google Maps Routes API
   - `GET /api/shops/search` - Search bengkel dengan optional location filter

---

## 🔧 Yang Perlu Anda Setup

### 1. Google Cloud Platform Setup

#### A. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **Create Project** atau pilih project existing
3. Beri nama project (contoh: "Tambalin")
4. Klik **Create**

#### B. Enable Google Maps Routes API

1. Di Google Cloud Console, buka **APIs & Services** → **Library**
2. Cari "**Routes API**"
3. Klik **Routes API** → **Enable**

#### C. Create API Key

1. Buka **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **API Key**
3. Copy API key yang dihasilkan
4. (Recommended) Klik **Edit API Key** untuk restrict:
   - **Application restrictions**: HTTP referrers (untuk production, tambahkan domain Anda)
   - **API restrictions**: Pilih "Restrict key" → Centang "Routes API"
5. Save

#### D. Setup Billing

⚠️ **PENTING**: Routes API memerlukan billing account aktif

1. Di Google Cloud Console, buka **Billing**
2. Link project dengan billing account
3. Routes API memiliki free tier:
   - $200 free credit per month untuk new users
   - Setelah itu: ~$0.005 per request

**Cost Optimization yang sudah diimplementasikan:**
- Rate limiting: Max 4 requests per minute per user
- Pre-filtering: Hanya top 20 nearest shops by straight-line distance yang di-check via API
- Maximum 10 shops per emergency request
- Fallback ke straight-line distance jika API error

---

### 2. Environment Variables Setup

1. Copy file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` dan tambahkan Google Maps API Key:
   ```env
   GOOGLE_MAPS_API_KEY=AIzaSy... # Paste API key Anda di sini
   ```

3. File `.env.local` sudah ada di `.gitignore`, jadi aman untuk development

---

### 3. Install Dependencies & Run Development Server

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Aplikasi akan berjalan di: http://localhost:3000

---

## 🧪 Testing Features

### Test Home Page
1. Buka http://localhost:3000
2. Allow location permission di browser
3. Lihat Explore Bengkel section (menggunakan mock data dari Developer 2)
4. Klik tombol "Butuh Bantuan Sekarang!" untuk test Emergency modal

### Test Emergency Feature
1. Klik emergency button
2. Fill form dengan:
   - Jenis Perbaikan: Ban Kempes
   - Nama: Test User
   - Phone: 081234567890
   - Detail: Motor di jalan raya
3. Klik "Cari Bengkel Terdekat"
4. Seharusnya muncul list bengkel (menggunakan mock data dulu)
5. Klik "Hubungi via WhatsApp" untuk test WhatsApp integration

### Test Search Page
1. Buka http://localhost:3000/search
2. Masukkan query: "motor"
3. Cek/uncheck location filter
4. Klik Cari
5. Lihat hasil pencarian

---

## 🔌 Integration dengan Developer 2 & 3

### Mock Data
Saat ini aplikasi menggunakan **mock data** di file `lib/utils/supabase.ts`.

**Developer 2** akan:
1. Setup Supabase project
2. Create database schema (shops, mechanics, photos tables)
3. Replace mock functions dengan real Supabase queries:
   - `getAllShops()` → Query dari Supabase
   - `searchShops()` → Full-text search di Supabase
   - `getShopById()` → Query single shop

### API Integration Points

#### Developer 2 (Supabase)
- File: `lib/utils/supabase.ts` → Implement real database queries
- Tables needed: `shops`, `shop_photos`, `mechanics`

#### Developer 3 (Auth & Bengkel Detail)
- Shared utilities sudah siap:
  - `generateWhatsAppUrl()` - untuk Order button di Detail Page
  - `formatOrderMessage()` - untuk format message
  - `generateGoogleMapsUrl()` - untuk location link
- Location: `lib/utils/location.ts`

---

## 📁 File Structure

```
tambalin/
├── app/
│   ├── api/
│   │   ├── shops/
│   │   │   ├── nearby/route.ts        # GET nearby shops
│   │   │   └── search/route.ts        # GET search shops
│   │   └── emergency/route.ts          # POST emergency request
│   ├── search/
│   │   └── page.tsx                    # Search page
│   ├── page.tsx                        # Home page
│   └── layout.tsx                      # Root layout
├── components/
│   ├── home/
│   │   ├── EmergencyModal.tsx          # Emergency modal component
│   │   └── ExploreBengkel.tsx          # Explore bengkel section
│   └── shared/
│       └── Navigation.tsx              # Navigation bar
├── lib/
│   ├── hooks/
│   │   └── useGeolocation.ts           # Geolocation hook
│   ├── types/
│   │   └── index.ts                    # TypeScript types
│   └── utils/
│       ├── location.ts                 # Distance & location utilities
│       ├── google-maps.ts              # Google Maps API functions
│       ├── rate-limiter.ts             # Rate limiting
│       └── supabase.ts                 # Supabase queries (mock for now)
└── .env.example                        # Environment variables template
```

---

## 🐛 Troubleshooting

### "GOOGLE_MAPS_API_KEY is not set"
- Pastikan file `.env.local` ada di root folder
- Pastikan variable name exact: `GOOGLE_MAPS_API_KEY`
- Restart dev server setelah menambahkan env variables

### "This API project is not authorized"
- Pastikan Routes API sudah di-enable di Google Cloud Console
- Pastikan API key tidak di-restrict atau sudah di-restrict dengan benar
- Check billing account aktif

### Location permission denied
- User harus manually allow location di browser
- Di Chrome: klik ikon 🔒 di address bar → Site settings → Location → Allow
- Aplikasi sudah handle error state dengan baik

### Mock data tidak muncul
- Pastikan Developer 2 sudah setup Supabase atau gunakan mock data dari `lib/utils/supabase.ts`
- Check console untuk errors

---

## 📊 API Cost Monitoring

Untuk monitoring usage Google Maps API:

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Buka **APIs & Services** → **Dashboard**
4. Klik **Routes API** untuk melihat:
   - Request count
   - Error rate
   - Latency
   - Daily cost estimate

### Expected Costs (dengan strategi optimisasi):
- Free tier: $200/month credit
- Emergency feature: ~$0.005 per request
- 1000 emergency requests = ~$5
- dengan 30 users/day × 80% usage × 30 days = ~$36/month (masih dalam free tier)

---

## ✅ Checklist Setup

- [ ] Google Cloud Project created
- [ ] Routes API enabled
- [ ] API Key created dan configured
- [ ] Billing account linked
- [ ] `.env.local` file created
- [ ] `GOOGLE_MAPS_API_KEY` added
- [ ] `npm install` completed
- [ ] `npm run dev` running successfully
- [ ] Home page loads without errors
- [ ] Emergency modal opens and works
- [ ] Search page functional
- [ ] Location permission working

---

## 📞 Contact & Support

Jika ada issues atau pertanyaan terkait:
- **Home Page**: Layout, Emergency feature, Explore section
- **Search Page**: Search functionality, filters
- **Location Services**: Distance calculation, geolocation
- **Google Maps API**: Routes API integration, rate limiting

Feel free to reach out! 🚀

---

## 🔄 Next Steps

Setelah Developer 2 setup Supabase:
1. Replace mock data di `lib/utils/supabase.ts`
2. Test dengan real data dari database
3. Verify emergency feature dengan real shop coordinates
4. Test integration dengan Developer 3's features

Setelah Developer 3 setup Auth:
1. Test WhatsApp integration dari Bengkel Detail Page
2. Verify shared utilities working correctly
3. Full end-to-end testing
