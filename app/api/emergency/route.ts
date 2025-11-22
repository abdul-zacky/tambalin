import { NextRequest, NextResponse } from 'next/server';
import { getAllShops } from '@/lib/utils/supabase';
import { sortShopsByDistance, isValidLocation } from '@/lib/utils/location';
import {
  getGoogleMapsApiKey,
  calculateMultipleRoutes,
  checkMapsApiRateLimit
} from '@/lib/utils/google-maps';
import {
  EmergencyRequest,
  EmergencyResponse,
  ApiResponse
} from '@/lib/types';

/**
 * POST /api/emergency
 * Handle emergency repair requests with Google Maps Routes API
 * Uses route distance instead of straight-line distance
 */
export async function POST(request: NextRequest) {
  try {
    const body: EmergencyRequest = await request.json();

    // Validate request body
    if (!body.user_location || !body.repair_type || !body.name || !body.phone) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing required fields: user_location, repair_type, name, phone'
        },
        { status: 400 }
      );
    }

    // Validate location
    if (!isValidLocation(body.user_location)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid coordinates'
        },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Check rate limit
    const rateLimitCheck = checkMapsApiRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      const resetTimeSeconds = Math.ceil(rateLimitCheck.resetTime / 1000);
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Terlalu banyak permintaan. Silakan coba lagi dalam ${resetTimeSeconds} detik.`,
          message: `Rate limit: ${rateLimitCheck.remaining} permintaan tersisa`
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
            'X-RateLimit-Reset': rateLimitCheck.resetTime.toString()
          }
        }
      );
    }

    // Get all shops from database
    // TODO: Developer 2 will replace this with actual Supabase query
    const allShops = await getAllShops();

    // First, sort by straight-line distance to get nearest candidates
    const sortedByDistance = sortShopsByDistance(allShops, body.user_location);

    // Take top 20 nearest shops by straight-line distance
    // This reduces API calls by pre-filtering
    const nearestCandidates = sortedByDistance.slice(0, 20);

    // Get API key
    let apiKey: string;
    try {
      apiKey = getGoogleMapsApiKey();
    } catch (error) {
      // Fallback to straight-line distance if API key not configured
      console.warn('Google Maps API key not configured, using straight-line distance');

      return NextResponse.json<ApiResponse<EmergencyResponse>>(
        {
          success: true,
          data: {
            shops: nearestCandidates.slice(0, 10).map(shop => ({
              ...shop,
              route_distance: shop.distance || 0,
              route_duration: 0
            })),
            user_location: body.user_location
          },
          message: 'Using straight-line distance (API key not configured)'
        },
        { status: 200 }
      );
    }

    // Calculate actual road distances for top candidates
    // Limit to 10 shops to control API costs
    const shopsWithRoutes = await calculateMultipleRoutes(
      body.user_location,
      nearestCandidates,
      apiKey,
      10
    );

    const response: EmergencyResponse = {
      shops: shopsWithRoutes,
      user_location: body.user_location
    };

    return NextResponse.json<ApiResponse<EmergencyResponse>>(
      {
        success: true,
        data: response,
        message: `Found ${shopsWithRoutes.length} nearby shops`
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()
        }
      }
    );
  } catch (error) {
    console.error('Error processing emergency request:', error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
