import { NextRequest, NextResponse } from 'next/server';
import { getAllShops } from '@/lib/utils/supabase';
import { sortShopsByDistance, isValidLocation } from '@/lib/utils/location';
import { Location, ApiResponse, Shop } from '@/lib/types';

/**
 * GET /api/shops/nearby
 * Get all shops sorted by straight-line distance from user location
 * Query params: lat, lng
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Validate parameters
    if (!lat || !lng) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing required parameters: lat and lng'
        },
        { status: 400 }
      );
    }

    const userLocation: Location = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };

    // Validate location
    if (!isValidLocation(userLocation)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid coordinates'
        },
        { status: 400 }
      );
    }

    // Get all shops from database
    // TODO: Developer 2 will replace this with actual Supabase query
    const shops = await getAllShops();

    // Sort shops by straight-line distance (no API cost!)
    const sortedShops = sortShopsByDistance(shops, userLocation);

    return NextResponse.json<ApiResponse<Shop[]>>(
      {
        success: true,
        data: sortedShops,
        message: `Found ${sortedShops.length} shops`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching nearby shops:', error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
