import { Location, Shop } from '../types';

/**
 * Calculate straight-line distance between two coordinates using Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in kilometers

  const lat1Rad = toRadians(point1.latitude);
  const lat2Rad = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Sort shops by distance from a given location
 * @param shops Array of shops
 * @param userLocation User's current location
 * @returns Sorted array of shops with distance property
 */
export function sortShopsByDistance(
  shops: Shop[],
  userLocation: Location
): Shop[] {
  return shops
    .map(shop => ({
      ...shop,
      distance: calculateDistance(
        userLocation,
        { latitude: shop.latitude, longitude: shop.longitude }
      )
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * Generate Google Maps URL from coordinates
 * @param location Location coordinates
 * @returns Google Maps URL
 */
export function generateGoogleMapsUrl(location: Location): string {
  return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
}

/**
 * Generate WhatsApp message URL with pre-filled content
 * @param whatsappNumber Shop's WhatsApp number (without '+' or '0')
 * @param message Message content
 * @returns WhatsApp URL
 */
export function generateWhatsAppUrl(
  whatsappNumber: string,
  message: string
): string {
  // Remove any non-digit characters from phone number
  const cleanNumber = whatsappNumber.replace(/\D/g, '');

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Format WhatsApp message for emergency request
 * @param customerName Customer's name
 * @param customerPhone Customer's phone number
 * @param repairType Type of repair needed
 * @param userLocation User's location
 * @param additionalDetails Optional additional details
 * @returns Formatted message string
 */
export function formatEmergencyMessage(
  customerName: string,
  customerPhone: string,
  repairType: string,
  userLocation: Location,
  additionalDetails?: string
): string {
  const locationUrl = generateGoogleMapsUrl(userLocation);

  let message = `*PERMINTAAN DARURAT PERBAIKAN*\n\n`;
  message += `Nama: ${customerName}\n`;
  message += `No. HP: ${customerPhone}\n`;
  message += `Jenis Perbaikan: ${repairType}\n`;

  if (additionalDetails) {
    message += `Detail Tambahan: ${additionalDetails}\n`;
  }

  message += `\nLokasi Saya:\n${locationUrl}`;

  return message;
}

/**
 * Format WhatsApp message for regular order
 * @param customerName Customer's name
 * @param customerPhone Customer's phone number
 * @param repairType Type of repair needed
 * @param userLocation User's location
 * @param additionalDetails Optional additional details
 * @returns Formatted message string
 */
export function formatOrderMessage(
  customerName: string,
  customerPhone: string,
  repairType: string,
  userLocation: Location,
  additionalDetails?: string
): string {
  const locationUrl = generateGoogleMapsUrl(userLocation);

  let message = `Halo, saya ingin memesan jasa perbaikan.\n\n`;
  message += `Nama: ${customerName}\n`;
  message += `No. HP: ${customerPhone}\n`;
  message += `Jenis Perbaikan: ${repairType}\n`;

  if (additionalDetails) {
    message += `Detail: ${additionalDetails}\n`;
  }

  message += `\nLokasi Saya:\n${locationUrl}`;

  return message;
}

/**
 * Validate coordinates
 * @param location Location to validate
 * @returns true if valid, false otherwise
 */
export function isValidLocation(location: Location): boolean {
  const { latitude, longitude } = location;

  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}
