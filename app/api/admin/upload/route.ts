import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/types';

/**
 * Helper to check if user is admin
 */
async function isAdmin(request: NextRequest): Promise<boolean> {
  const supabase = await createClient();

  // Use getSession instead of getUser for better reliability
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    console.log('Admin check failed: No session', { sessionError });
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.log('Admin check failed: Profile error', { profileError });
    return false;
  }

  return profile?.role === 'admin';
}

/**
 * POST /api/admin/upload
 * Upload photos to Supabase Storage (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized. Admin access required.'
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No files provided'
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    // Upload each file to Supabase Storage
    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: Not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          errors.push(`${file.name}: File size exceeds 5MB`);
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${randomString}.${extension}`;
        const filepath = `shops/${filename}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('shop-photos')
          .upload(filepath, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errors.push(`${file.name}: Upload failed - ${error.message}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('shop-photos')
          .getPublicUrl(filepath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errors.push(`${file.name}: Processing failed`);
      }
    }

    // Return results
    if (uploadedUrls.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'All uploads failed',
          message: errors.join(', ')
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ urls: string[]; errors: string[] }>>(
      {
        success: true,
        data: {
          urls: uploadedUrls,
          errors
        },
        message: `Uploaded ${uploadedUrls.length} of ${files.length} files`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/upload:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/upload
 * Delete photo from Supabase Storage (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized. Admin access required.'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Photo URL is required'
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Extract filepath from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/shop-photos/{filepath}
    const urlParts = url.split('/shop-photos/');
    if (urlParts.length < 2) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid photo URL format'
        },
        { status: 400 }
      );
    }

    const filepath = urlParts[1];

    // Delete from storage
    const { error } = await supabase.storage
      .from('shop-photos')
      .remove([filepath]);

    if (error) {
      console.error('Error deleting photo:', error);
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to delete photo'
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
        message: 'Photo deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/upload:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
