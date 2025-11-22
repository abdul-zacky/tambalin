import { NextRequest, NextResponse } from 'next/server';
import { searchShops } from '@/lib/utils/supabase';
import { sortShopsByDistance, isValidLocation } from '@/lib/utils/location';
import { Location, ApiResponse, SearchResponse } from '@/lib/types';

/**
 * GET /api/shops/search
 * Search shops by name with optional location filter
 * Query params: q (query), lat (optional), lng (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Validate query parameter
    if (!query) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing required parameter: q (query)'
        },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Query must be at least 2 characters long'
        },
        { status: 400 }
      );
    }

    // Search shops by name
    // TODO: Developer 2 will replace this with actual Supabase query
    let shops = await searchShops(query);

    // If location provided, sort by distance
    if (lat && lng) {
      const userLocation: Location = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      };

      // Validate location
      if (isValidLocation(userLocation)) {
        shops = sortShopsByDistance(shops, userLocation);
      }
    }

    const response: SearchResponse = {
      shops,
      query
    };

    return NextResponse.json<ApiResponse<SearchResponse>>(
      {
        success: true,
        data: response,
        message: `Found ${shops.length} shop(s) matching "${query}"`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching shops:', error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
