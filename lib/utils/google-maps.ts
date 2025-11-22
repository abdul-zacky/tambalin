import { Location, Shop, ShopWithRouteDistance } from '../types';
import { mapsApiLimiter } from './rate-limiter';

interface RouteResponse {
  routes: Array<{
    distanceMeters: number;
    duration: string;
  }>;
}

/**
 * Calculate route distance using Google Maps Routes API
 * @param origin Origin location
 * @param destination Destination location
 * @param apiKey Google Maps API key
 * @returns Distance in kilometers and duration in minutes
 */
export async function calculateRouteDistance(
  origin: Location,
  destination: Location,
  apiKey: string
): Promise<{ distance: number; duration: number }> {
  const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

  const requestBody = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude
        }
      }
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.latitude,
          longitude: destination.longitude
        }
      }
    },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    computeAlternativeRoutes: false,
    languageCode: 'id-ID',
    units: 'METRIC'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.statusText}`);
  }

  const data: RouteResponse = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  const distanceKm = route.distanceMeters / 1000;

  // Parse duration string (e.g., "1234s" -> seconds)
  const durationSeconds = parseInt(route.duration.replace('s', ''));
  const durationMinutes = Math.ceil(durationSeconds / 60);

  return {
    distance: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
    duration: durationMinutes
  };
}

/**
 * Calculate route distances for multiple shops (batch processing)
 * @param userLocation User's location
 * @param shops Array of shops to calculate routes for
 * @param apiKey Google Maps API key
 * @param limit Maximum number of shops to process (default: 10)
 * @returns Array of shops with route distance and duration
 */
export async function calculateMultipleRoutes(
  userLocation: Location,
  shops: Shop[],
  apiKey: string,
  limit: number = 10
): Promise<ShopWithRouteDistance[]> {
  // Limit number of shops to prevent excessive API calls
  const limitedShops = shops.slice(0, limit);

  const routePromises = limitedShops.map(async (shop) => {
    try {
      const { distance, duration } = await calculateRouteDistance(
        userLocation,
        { latitude: shop.latitude, longitude: shop.longitude },
        apiKey
      );

      return {
        ...shop,
        route_distance: distance,
        route_duration: duration
      } as ShopWithRouteDistance;
    } catch (error) {
      console.error(`Error calculating route for shop ${shop.id}:`, error);
      // Fallback: return shop with straight-line distance if route fails
      return {
        ...shop,
        route_distance: shop.distance || 0,
        route_duration: 0
      } as ShopWithRouteDistance;
    }
  });

  const results = await Promise.all(routePromises);

  // Sort by route distance
  return results.sort((a, b) => a.route_distance - b.route_distance);
}

/**
 * Check rate limit before making API call
 * @param identifier User identifier (IP address or user ID)
 * @returns Object with allowed status and remaining requests
 */
export function checkMapsApiRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const allowed = mapsApiLimiter.isAllowed(identifier);
  const remaining = mapsApiLimiter.getRemaining(identifier);
  const resetTime = mapsApiLimiter.getResetTime(identifier);

  return { allowed, remaining, resetTime };
}

/**
 * Get API key from environment variables
 * @returns Google Maps API key
 * @throws Error if API key is not set
 */
export function getGoogleMapsApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set in environment variables');
  }

  return apiKey;
}
