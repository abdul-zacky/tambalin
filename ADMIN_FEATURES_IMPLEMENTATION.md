# Admin Dashboard Features Implementation

## Summary
This document outlines the implementation of the Admin Dashboard features for managing motorcycle repair shops in the Tambalin application.

## Implemented Features

### 1. Database Schema & Types
**File:** [lib/supabase/database.types.ts](lib/supabase/database.types.ts)

Updated TypeScript types to include:
- `shops` table with fields: id, name, description, latitude, longitude, photo_urls, whatsapp_number, created_at, updated_at
- `mechanics` table with fields: id, shop_id, name, specialty, created_at
- `reviews` table with fields: id, user_id, shop_id, rating, comment, created_at
- `profiles` table updated with phone_number field

### 2. Supabase Utility Functions
**File:** [lib/utils/supabase.ts](lib/utils/supabase.ts)

Implemented real Supabase queries replacing mock data:
- `getAllShops()` - Fetches all shops with their mechanics
- `searchShops(query)` - Searches shops by name
- `getShopById(id)` - Fetches single shop with mechanics
- `mapDbShopToShop()` - Helper to convert database types to Shop interface

### 3. Admin API Endpoints

#### a. Shop Management Endpoints
**File:** [app/api/admin/shops/route.ts](app/api/admin/shops/route.ts)

- **GET /api/admin/shops** - List all shops with pagination support
  - Admin authentication required
  - Returns shops with mechanics
  - Sorted by creation date (newest first)

- **POST /api/admin/shops** - Create new shop
  - Admin authentication required
  - Validates required fields: name, latitude, longitude, whatsapp_number
  - Creates shop with photo URLs and mechanics
  - Returns created shop with ID

#### b. Individual Shop Endpoints
**File:** [app/api/admin/shops/[id]/route.ts](app/api/admin/shops/[id]/route.ts)

- **GET /api/admin/shops/[id]** - Get single shop for editing
  - Admin authentication required
  - Returns shop with mechanics and photos

- **PUT /api/admin/shops/[id]** - Update shop
  - Admin authentication required
  - Updates shop data
  - Replaces mechanics (delete old, insert new)
  - Handles photo URL updates

- **DELETE /api/admin/shops/[id]** - Delete shop
  - Admin authentication required
  - Cascade deletes mechanics and reviews
  - TODO: Cleanup photos from Supabase Storage

#### c. Photo Upload Endpoint
**File:** [app/api/admin/upload/route.ts](app/api/admin/upload/route.ts)

- **POST /api/admin/upload** - Upload photos to Supabase Storage
  - Admin authentication required
  - Validates file type (images only)
  - Validates file size (max 5MB)
  - Uploads to `shop-photos` bucket
  - Returns array of public URLs

- **DELETE /api/admin/upload** - Delete photo from storage
  - Admin authentication required
  - Removes file from Supabase Storage bucket

### 4. Admin Dashboard Pages

#### a. Main Admin Dashboard
**File:** [app/admin/page.tsx](app/admin/page.tsx)

Features:
- Admin role check and authentication
- Statistics cards (users, admins, system status)
- Quick Actions section with link to Manage Shops
- Admin profile display

#### b. Shops List Page
**File:** [app/admin/shops/page.tsx](app/admin/shops/page.tsx)

Features:
- Table view of all shops
- Search functionality (by name or description)
- Pagination (10 items per page)
- Edit and Delete buttons for each shop
- Delete confirmation modal
- Link to Add New Shop

#### c. Add Shop Page
**File:** [app/admin/shops/add/page.tsx](app/admin/shops/add/page.tsx)

Features:
- Form with fields: name, description, latitude, longitude, WhatsApp number
- Multiple photo upload with preview
- Dynamic mechanics list (add/remove mechanics)
- Photo upload to Supabase Storage
- Form validation
- Success/error handling

#### d. Edit Shop Page
**File:** [app/admin/shops/edit/[id]/page.tsx](app/admin/shops/edit/[id]/page.tsx)

Features:
- Pre-filled form with existing shop data
- Display current photos with delete option
- Add new photos with preview
- Update mechanics (add/remove)
- Form validation
- Success/error handling

## API Flow

### Creating a Shop
1. Admin fills form in Add Shop page
2. Photos uploaded to Supabase Storage via `/api/admin/upload`
3. Shop created with photo URLs via `POST /api/admin/shops`
4. Mechanics created linked to new shop
5. Redirect to shops list page

### Editing a Shop
1. Shop data fetched via `GET /api/admin/shops/[id]`
2. Form pre-filled with existing data
3. Admin can delete existing photos via `DELETE /api/admin/upload`
4. Admin can upload new photos via `POST /api/admin/upload`
5. Shop updated via `PUT /api/admin/shops/[id]`
6. Old mechanics deleted, new mechanics inserted
7. Redirect to shops list page

### Deleting a Shop
1. Confirmation modal displayed
2. Shop deleted via `DELETE /api/admin/shops/[id]`
3. Cascade deletes mechanics and reviews
4. Shop removed from list

## Authentication & Authorization

All admin endpoints use the `isAdmin()` helper function that:
1. Gets current user from Supabase auth
2. Checks user profile for admin role
3. Returns 401 Unauthorized if not admin

## Supabase Storage Setup Required

To fully enable photo uploads, you need to:

1. Create a storage bucket named `shop-photos` in Supabase
2. Set bucket to public
3. Configure RLS policies for the bucket:

```sql
-- Allow admins to upload
CREATE POLICY "Admins can upload shop photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shop-photos' AND
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Allow admins to delete
CREATE POLICY "Admins can delete shop photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shop-photos' AND
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Allow public to read
CREATE POLICY "Anyone can view shop photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shop-photos');
```

## Database Schema Notes

The schema uses:
- `shops.photo_urls` as a `text[]` array to store multiple photo URLs
- Foreign keys with cascade delete for mechanics and reviews
- Generated IDs using `GENERATED ALWAYS AS IDENTITY`

## Next Steps / Future Enhancements

1. Add pagination to API responses (currently done client-side)
2. Add filtering options (by location, rating, etc.)
3. Implement bulk operations (bulk delete, bulk update)
4. Add image optimization/compression before upload
5. Implement photo reordering (drag & drop)
6. Add shop statistics (view count, review count, average rating)
7. Implement reviews management page
8. Add audit log for admin actions

## Testing Checklist

- [ ] Login as admin user
- [ ] Navigate to /admin/shops
- [ ] Create a new shop with photos and mechanics
- [ ] Edit an existing shop
- [ ] Delete a photo from a shop
- [ ] Add new photos to a shop
- [ ] Update mechanics list
- [ ] Delete a shop
- [ ] Search for shops
- [ ] Test pagination
- [ ] Verify non-admin users cannot access admin routes
- [ ] Test photo upload validation (file type, size)
- [ ] Verify cascade deletes work correctly

## Files Created/Modified

### Created:
- `app/api/admin/shops/route.ts`
- `app/api/admin/shops/[id]/route.ts`
- `app/api/admin/upload/route.ts`
- `app/admin/shops/page.tsx`
- `app/admin/shops/add/page.tsx`
- `app/admin/shops/edit/[id]/page.tsx`

### Modified:
- `lib/supabase/database.types.ts`
- `lib/utils/supabase.ts`
- `app/admin/page.tsx`
