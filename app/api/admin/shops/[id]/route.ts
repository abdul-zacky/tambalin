import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse, Shop } from '@/lib/types';
import { Tables, TablesUpdate } from '@/lib/supabase/database.types';

type DbShop = Tables<'shops'>;
type DbMechanic = Tables<'mechanics'>;

/**
 * Helper to check if user is admin
 */
async function isAdmin(request: NextRequest): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

/**
 * Convert database shop to Shop type
 */
function mapDbShopToShop(dbShop: DbShop, mechanics?: DbMechanic[]): Shop {
  return {
    id: dbShop.id.toString(),
    name: dbShop.name,
    description: dbShop.description || '',
    latitude: dbShop.latitude,
    longitude: dbShop.longitude,
    whatsapp_number: dbShop.whatsapp_number,
    created_at: dbShop.created_at,
    updated_at: dbShop.updated_at || dbShop.created_at,
    photos: dbShop.photo_urls?.map((url, index) => ({
      id: `${dbShop.id}-${index}`,
      shop_id: dbShop.id.toString(),
      photo_url: url,
      display_order: index
    })) || [],
    mechanics: mechanics?.map(m => ({
      id: m.id.toString(),
      shop_id: m.shop_id.toString(),
      name: m.name,
      specialty: m.specialty || undefined
    })) || []
  };
}

/**
 * GET /api/admin/shops/[id]
 * Get single shop by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const shopId = parseInt(id);

    if (isNaN(shopId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid shop ID'
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Shop not found'
        },
        { status: 404 }
      );
    }

    // Get mechanics
    const { data: mechanics, error: mechanicsError } = await supabase
      .from('mechanics')
      .select('*')
      .eq('shop_id', shopId);

    if (mechanicsError) {
      console.error('Error fetching mechanics:', mechanicsError);
    }

    const mappedShop = mapDbShopToShop(shop, mechanics || []);

    return NextResponse.json<ApiResponse<Shop>>(
      {
        success: true,
        data: mappedShop,
        message: 'Shop retrieved successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/shops/[id]:', error);
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
 * PUT /api/admin/shops/[id]
 * Update shop (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const shopId = parseInt(id);

    if (isNaN(shopId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid shop ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, latitude, longitude, whatsapp_number, photo_urls, mechanics } = body;

    const supabase = await createClient();

    // Check if shop exists
    const { data: existingShop, error: checkError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', shopId)
      .single();

    if (checkError || !existingShop) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Shop not found'
        },
        { status: 404 }
      );
    }

    // Update shop
    const shopData: TablesUpdate<'shops'> = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(latitude && { latitude: parseFloat(latitude) }),
      ...(longitude && { longitude: parseFloat(longitude) }),
      ...(whatsapp_number && { whatsapp_number }),
      ...(photo_urls !== undefined && { photo_urls }),
      updated_at: new Date().toISOString()
    };

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .update(shopData)
      .eq('id', shopId)
      .select()
      .single();

    if (shopError || !shop) {
      console.error('Error updating shop:', shopError);
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to update shop'
        },
        { status: 500 }
      );
    }

    // Update mechanics if provided
    let updatedMechanics: DbMechanic[] = [];
    if (mechanics && Array.isArray(mechanics)) {
      // Delete existing mechanics
      await supabase
        .from('mechanics')
        .delete()
        .eq('shop_id', shopId);

      // Insert new mechanics
      if (mechanics.length > 0) {
        const mechanicsData = mechanics.map((m: any) => ({
          shop_id: shopId,
          name: m.name,
          specialty: m.specialty || null
        }));

        const { data: mechanicsResult, error: mechanicsError } = await supabase
          .from('mechanics')
          .insert(mechanicsData)
          .select();

        if (mechanicsError) {
          console.error('Error updating mechanics:', mechanicsError);
        } else {
          updatedMechanics = mechanicsResult || [];
        }
      }
    } else {
      // Get existing mechanics if not updating
      const { data: existingMechanics } = await supabase
        .from('mechanics')
        .select('*')
        .eq('shop_id', shopId);

      updatedMechanics = existingMechanics || [];
    }

    const updatedShop = mapDbShopToShop(shop, updatedMechanics);

    return NextResponse.json<ApiResponse<Shop>>(
      {
        success: true,
        data: updatedShop,
        message: 'Shop updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/shops/[id]:', error);
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
 * DELETE /api/admin/shops/[id]
 * Delete shop with cascade (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const shopId = parseInt(id);

    if (isNaN(shopId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid shop ID'
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if shop exists and get photo URLs for cleanup
    const { data: shop, error: checkError } = await supabase
      .from('shops')
      .select('photo_urls')
      .eq('id', shopId)
      .single();

    if (checkError || !shop) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Shop not found'
        },
        { status: 404 }
      );
    }

    // Delete mechanics (cascade)
    await supabase
      .from('mechanics')
      .delete()
      .eq('shop_id', shopId);

    // Delete reviews (cascade)
    await supabase
      .from('reviews')
      .delete()
      .eq('shop_id', shopId);

    // Delete shop
    const { error: deleteError } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (deleteError) {
      console.error('Error deleting shop:', deleteError);
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to delete shop'
        },
        { status: 500 }
      );
    }

    // TODO: Cleanup photos from Supabase Storage if needed
    // This would require deleting files from storage bucket based on photo_urls

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
        message: 'Shop deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/shops/[id]:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
