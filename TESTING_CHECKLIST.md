# Testing Checklist - Developer 2 Features

## Prerequisites
- [ ] Supabase project is set up and running
- [ ] Environment variables are configured (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Database schema is created (shops, mechanics, reviews, profiles tables)
- [ ] RLS policies are configured correctly
- [ ] Supabase Storage bucket `shop-photos` is created and set to public
- [ ] At least one admin user exists in the database with role='admin'
- [ ] Development server is running on port 3005 (or your chosen port)

## 1. Authentication & Authorization Tests

### 1.1 Admin Login
- [ ] Navigate to `http://localhost:3005/admin/auth/login`
- [ ] Try logging in with non-admin credentials
  - [ ] Should show error: "Access denied. Admin privileges required."
  - [ ] Should not redirect to admin dashboard
- [ ] Log in with admin credentials (email: kukuhkcy@gmail.com)
  - [ ] Should successfully authenticate
  - [ ] Should redirect to `/admin` dashboard
  - [ ] Should not show any console errors

### 1.2 Admin Dashboard Access
- [ ] While logged in as admin, navigate to `http://localhost:3005/admin`
  - [ ] Should display admin dashboard
  - [ ] Should show admin profile (name, email, role)
  - [ ] Should show "Manage Shops" card under Quick Actions
  - [ ] Should show statistics cards (Total Users, Administrators, System Status)
- [ ] Try accessing `/admin` without being logged in
  - [ ] Should redirect to `/admin/auth/login`
- [ ] Log in as regular user, try accessing `/admin`
  - [ ] Should redirect to home page `/`

## 2. Admin Dashboard - Shops Management

### 2.1 View Shops List Page
- [ ] Click "Manage Shops" from admin dashboard
- [ ] Should navigate to `http://localhost:3005/admin/shops`
- [ ] Verify page displays:
  - [ ] Page title: "Manage Shops"
  - [ ] "Add New Shop" button (top right)
  - [ ] "Back to Dashboard" button
  - [ ] Search input field
  - [ ] Table with columns: Name, Description, Location, Mechanics, Photos, Actions
  - [ ] Pagination controls (if more than 10 shops)

### 2.2 Search Functionality
- [ ] Enter search term in search box
- [ ] Results should filter in real-time
- [ ] Search should work for shop name
- [ ] Search should work for shop description
- [ ] Clear search - should show all shops again
- [ ] Pagination should reset to page 1 when searching

### 2.3 Pagination
- [ ] If there are more than 10 shops:
  - [ ] Should show pagination controls at bottom
  - [ ] Should display "Showing X to Y of Z shops"
  - [ ] Click "Next" button
    - [ ] Should show next page of shops
    - [ ] Previous button should become enabled
  - [ ] Click "Previous" button
    - [ ] Should go back to previous page
  - [ ] First and last pages should disable respective buttons

## 3. Add New Shop

### 3.1 Navigate to Add Shop Page
- [ ] From shops list, click "Add New Shop" button
- [ ] Should navigate to `http://localhost:3005/admin/shops/add`
- [ ] Form should display with all fields empty

### 3.2 Form Validation
- [ ] Try submitting empty form
  - [ ] Should show validation errors for required fields
  - [ ] Required fields: Shop Name, Latitude, Longitude, WhatsApp Number
- [ ] Enter invalid latitude/longitude
  - [ ] Should accept decimal numbers
- [ ] Enter WhatsApp number in correct format (6281234567890)

### 3.3 Photo Upload
- [ ] Click "Choose Files" for photos
- [ ] Select multiple image files (JPG, PNG)
  - [ ] Should show preview of selected images
  - [ ] Images should display in grid (3 columns)
- [ ] Try uploading non-image file
  - [ ] Should show error message
- [ ] Try uploading file larger than 5MB
  - [ ] Should show error about file size

### 3.4 Mechanics Management
- [ ] Form should have one mechanic row by default
- [ ] Enter mechanic name and specialty
- [ ] Click "Add Mechanic" button
  - [ ] Should add new empty mechanic row
- [ ] Add multiple mechanics (3-5)
- [ ] Click "Remove" button on a mechanic
  - [ ] Should remove that mechanic row
  - [ ] Should not be able to remove if only one mechanic left

### 3.5 Create Shop
- [ ] Fill in all required fields:
  - [ ] Shop Name: "Test Bengkel Motor"
  - [ ] Description: "Test bengkel for testing purposes"
  - [ ] Latitude: -6.2088
  - [ ] Longitude: 106.8456
  - [ ] WhatsApp Number: 628123456789
- [ ] Add 2-3 photos
- [ ] Add 2-3 mechanics with names and specialties
- [ ] Click "Create Shop" button
  - [ ] Button should show "Creating..." during submission
  - [ ] Should redirect to shops list page on success
  - [ ] New shop should appear in the list
  - [ ] Should show success message or toast (if implemented)

### 3.6 Cancel Creation
- [ ] Fill in some form fields
- [ ] Click "Cancel" button
  - [ ] Should redirect to shops list
  - [ ] Shop should not be created

## 4. Edit Shop

### 4.1 Navigate to Edit Page
- [ ] From shops list, click "Edit" button on any shop
- [ ] Should navigate to `http://localhost:3005/admin/shops/edit/[id]`
- [ ] Form should be pre-filled with existing shop data:
  - [ ] Shop name
  - [ ] Description
  - [ ] Latitude and longitude
  - [ ] WhatsApp number
  - [ ] Existing photos should display with "Delete" buttons
  - [ ] Existing mechanics should populate in form

### 4.2 Edit Shop Information
- [ ] Change shop name
- [ ] Update description
- [ ] Modify latitude/longitude
- [ ] Update WhatsApp number
- [ ] Click "Update Shop"
  - [ ] Should show "Updating..." on button
  - [ ] Should redirect to shops list on success
  - [ ] Changes should be reflected in the list

### 4.3 Manage Photos
- [ ] View existing photos
  - [ ] Each photo should have "Delete" button overlay
- [ ] Click "Delete" on an existing photo
  - [ ] Should show confirmation
  - [ ] Photo should be removed from display
  - [ ] Photo should be deleted from Supabase Storage
- [ ] Add new photos using "Add New Photos" input
  - [ ] Should show preview of new photos
  - [ ] Click "Update Shop"
  - [ ] Both old (not deleted) and new photos should be saved

### 4.4 Manage Mechanics
- [ ] View existing mechanics in form fields
- [ ] Edit existing mechanic names/specialties
- [ ] Click "Add Mechanic" to add more
- [ ] Click "Remove" to delete mechanics
- [ ] Click "Update Shop"
  - [ ] All mechanics should be updated
  - [ ] Old mechanics should be replaced with new list

### 4.5 Cancel Editing
- [ ] Make some changes
- [ ] Click "Cancel" button
  - [ ] Should redirect to shops list
  - [ ] Changes should not be saved

## 5. Delete Shop

### 5.1 Delete Confirmation
- [ ] From shops list, click "Delete" button on a shop
- [ ] Should show confirmation modal
  - [ ] Modal should have warning message
  - [ ] Modal should mention cascade delete (mechanics, reviews)
  - [ ] Should have "Cancel" and "Delete" buttons

### 5.2 Cancel Deletion
- [ ] Click "Cancel" in confirmation modal
  - [ ] Modal should close
  - [ ] Shop should remain in list

### 5.3 Confirm Deletion
- [ ] Click "Delete" button in modal
  - [ ] Shop should be removed from the list
  - [ ] Modal should close
  - [ ] Related mechanics should be deleted from database
  - [ ] Related reviews should be deleted from database
  - [ ] Shop should no longer appear in list

## 6. API Endpoints Testing

### 6.1 GET /api/admin/shops
- [ ] Open browser DevTools > Network tab
- [ ] Navigate to shops list page
- [ ] Check network request to `/api/admin/shops`
  - [ ] Should return 200 OK
  - [ ] Response should contain array of shops
  - [ ] Each shop should have mechanics array
  - [ ] Should not return error if authenticated as admin

### 6.2 POST /api/admin/shops
- [ ] Create a new shop
- [ ] Check network request
  - [ ] Should POST to `/api/admin/shops`
  - [ ] Should return 201 Created
  - [ ] Response should contain created shop with ID
  - [ ] Should return 401 if not authenticated as admin

### 6.3 GET /api/admin/shops/[id]
- [ ] Edit a shop
- [ ] Check network request on page load
  - [ ] Should GET from `/api/admin/shops/[id]`
  - [ ] Should return 200 OK
  - [ ] Response should contain shop with mechanics
  - [ ] Should return 404 if shop doesn't exist

### 6.4 PUT /api/admin/shops/[id]
- [ ] Update a shop
- [ ] Check network request
  - [ ] Should PUT to `/api/admin/shops/[id]`
  - [ ] Should return 200 OK
  - [ ] Response should contain updated shop
  - [ ] Should return 404 if shop doesn't exist

### 6.5 DELETE /api/admin/shops/[id]
- [ ] Delete a shop
- [ ] Check network request
  - [ ] Should DELETE to `/api/admin/shops/[id]`
  - [ ] Should return 200 OK
  - [ ] Should cascade delete mechanics and reviews

### 6.6 POST /api/admin/upload
- [ ] Upload photos when creating/editing shop
- [ ] Check network request
  - [ ] Should POST to `/api/admin/upload`
  - [ ] Content-Type should be multipart/form-data
  - [ ] Should return 200 OK with array of URLs
  - [ ] Should return error if file is too large
  - [ ] Should return error if file is not an image

### 6.7 DELETE /api/admin/upload
- [ ] Delete a photo from edit page
- [ ] Check network request
  - [ ] Should DELETE to `/api/admin/upload`
  - [ ] Body should contain photo URL
  - [ ] Should return 200 OK
  - [ ] File should be removed from Supabase Storage

## 7. Database Verification

### 7.1 Shops Table
- [ ] Open Supabase Dashboard > Table Editor > shops
- [ ] Create a shop via admin panel
  - [ ] New row should appear in shops table
  - [ ] Should have correct name, description, coordinates
  - [ ] photo_urls should be array of URLs
  - [ ] created_at should be set
- [ ] Update a shop
  - [ ] updated_at should change
  - [ ] Changes should reflect in database
- [ ] Delete a shop
  - [ ] Row should be removed from shops table

### 7.2 Mechanics Table
- [ ] Open Supabase Dashboard > Table Editor > mechanics
- [ ] Create a shop with mechanics
  - [ ] New rows should appear in mechanics table
  - [ ] shop_id should match the shop's id
  - [ ] name and specialty should be saved
- [ ] Update shop mechanics
  - [ ] Old mechanics should be deleted
  - [ ] New mechanics should be inserted
- [ ] Delete shop
  - [ ] Related mechanics should be deleted (cascade)

### 7.3 Profiles Table
- [ ] Verify admin user profile exists
  - [ ] role should be 'admin'
  - [ ] Should have email and full_name
- [ ] Check RLS policies work
  - [ ] Admin can read all profiles
  - [ ] Users can read own profile

## 8. Supabase Storage Testing

### 8.1 Shop Photos Bucket
- [ ] Open Supabase Dashboard > Storage > shop-photos
- [ ] Upload photos via admin panel
  - [ ] Files should appear in shops/ folder
  - [ ] File names should have timestamp and random string
  - [ ] Files should be accessible via public URL
- [ ] Delete photo via admin panel
  - [ ] File should be removed from storage bucket
- [ ] Check bucket policies
  - [ ] Public read access should work
  - [ ] Admin can upload (authenticated)
  - [ ] Admin can delete (authenticated)

## 9. Error Handling

### 9.1 Network Errors
- [ ] Turn off internet/Supabase connection
- [ ] Try to load shops list
  - [ ] Should show error message
  - [ ] Should not crash the app
- [ ] Try to create/update shop
  - [ ] Should show error message
  - [ ] Form should remain filled (data not lost)

### 9.2 Invalid Data
- [ ] Try to edit non-existent shop (invalid ID in URL)
  - [ ] Should show "Shop not found" or redirect
- [ ] Submit form with missing required fields
  - [ ] Should show validation errors
- [ ] Upload invalid file types
  - [ ] Should show clear error message

### 9.3 Unauthorized Access
- [ ] Log out
- [ ] Try to access `/api/admin/shops` directly
  - [ ] Should return 401 Unauthorized
- [ ] Try to access admin pages
  - [ ] Should redirect to login

## 10. User Experience

### 10.1 Loading States
- [ ] All buttons should show loading state during operations
  - [ ] "Creating..." / "Updating..." / "Deleting..."
  - [ ] Buttons should be disabled during loading
- [ ] Page should show loading spinner when fetching data

### 10.2 Responsive Design
- [ ] Test on mobile viewport (375px width)
  - [ ] Tables should be scrollable
  - [ ] Forms should stack properly
  - [ ] Buttons should be accessible
- [ ] Test on tablet viewport (768px width)
  - [ ] Layout should adapt appropriately
- [ ] Test on desktop (1920px width)
  - [ ] Should use available space efficiently

### 10.3 Navigation
- [ ] All "Back" buttons should work
- [ ] "Cancel" buttons should navigate correctly
- [ ] After creating/updating, should redirect to list
- [ ] Breadcrumbs or navigation should be clear

## 11. Performance

### 11.1 Page Load Times
- [ ] Shops list page should load quickly (<2s)
- [ ] Image previews should load fast
- [ ] No unnecessary re-renders or API calls

### 11.2 Image Optimization
- [ ] Large images should be handled gracefully
- [ ] Multiple image uploads should work smoothly
- [ ] Preview generation should be fast

## 12. Data Integrity

### 12.1 Cascade Deletes
- [ ] Create shop with mechanics and reviews
- [ ] Delete the shop
- [ ] Verify in database:
  - [ ] Shop is deleted
  - [ ] Related mechanics are deleted
  - [ ] Related reviews are deleted

### 12.2 Photo Management
- [ ] Upload photos and note the URLs
- [ ] Delete shop with photos
- [ ] Check Supabase Storage
  - [ ] Photos should still exist (TODO: implement cleanup)
  - [ ] Or photos should be deleted if cleanup is implemented

### 12.3 Data Consistency
- [ ] Create shop with same coordinates as existing
  - [ ] Both should exist independently
- [ ] Update shop coordinates
  - [ ] Should not affect other shops

## Test Results Summary

**Date Tested:** _______________
**Tested By:** _______________
**Environment:** Development / Staging / Production

### Critical Issues Found:
- [ ] None
- Issue 1: _______________
- Issue 2: _______________

### Non-Critical Issues Found:
- [ ] None
- Issue 1: _______________
- Issue 2: _______________

### Overall Status:
- [ ] ✅ All tests passed
- [ ] ⚠️ Some issues found, but features work
- [ ] ❌ Critical issues blocking deployment

### Notes:
_______________________________________
_______________________________________
_______________________________________
