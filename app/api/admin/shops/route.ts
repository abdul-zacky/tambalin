import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse, Shop } from '@/lib/types';
import { Tables, TablesInsert } from '@/lib/supabase/database.types';

type DbShop = Tables<'shops'>;
type DbMechanic = Tables<'mechanics'>;

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
 * GET /api/admin/shops
 * List all shops (admin only)
 */
export async function GET(request: NextRequest) {
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

    const supabase = await createClient();

    // Get all shops
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (shopsError) {
      console.error('Error fetching shops:', shopsError);
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to fetch shops'
        },
        { status: 500 }
      );
    }

    if (!shops) {
      return NextResponse.json<ApiResponse<Shop[]>>(
        {
          success: true,
          data: [],
          message: 'No shops found'
        },
        { status: 200 }
      );
    }

    // Get all mechanics
    const { data: mechanics, error: mechanicsError } = await supabase
      .from('mechanics')
      .select('*');

    if (mechanicsError) {
      console.error('Error fetching mechanics:', mechanicsError);
    }

    // Map shops with their mechanics
    const mappedShops = shops.map(shop => {
      const shopMechanics = mechanics?.filter(m => m.shop_id === shop.id) || [];
      return mapDbShopToShop(shop, shopMechanics);
    });

    return NextResponse.json<ApiResponse<Shop[]>>(
      {
        success: true,
        data: mappedShops,
        message: `Found ${mappedShops.length} shops`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/shops:', error);
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
 * POST /api/admin/shops
 * Create new shop (admin only)
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

    const body = await request.json();
    const { name, description, latitude, longitude, whatsapp_number, photo_urls, mechanics } = body;

    // Validate required fields
    if (!name || !latitude || !longitude || !whatsapp_number) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing required fields: name, latitude, longitude, whatsapp_number'
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create shop
    const shopData: TablesInsert<'shops'> = {
      name,
      description: description || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      whatsapp_number,
      photo_urls: photo_urls || null
    };

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .insert(shopData)
      .select()
      .single();

    if (shopError || !shop) {
      console.error('Error creating shop:', shopError);
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to create shop'
        },
        { status: 500 }
      );
    }

    // Create mechanics if provided
    let createdMechanics: DbMechanic[] = [];
    if (mechanics && Array.isArray(mechanics) && mechanics.length > 0) {
      const mechanicsData = mechanics.map((m: any) => ({
        shop_id: shop.id,
        name: m.name,
        specialty: m.specialty || null
      }));

      const { data: mechanicsResult, error: mechanicsError } = await supabase
        .from('mechanics')
        .insert(mechanicsData)
        .select();

      if (mechanicsError) {
        console.error('Error creating mechanics:', mechanicsError);
      } else {
        createdMechanics = mechanicsResult || [];
      }
    }

    const createdShop = mapDbShopToShop(shop, createdMechanics);

    return NextResponse.json<ApiResponse<Shop>>(
      {
        success: true,
        data: createdShop,
        message: 'Shop created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/shops:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
