/**
 * Supabase client utilities
 * This file will be used by Developer 2 to setup Supabase connection
 * For now, it contains placeholder functions
 */

import { Shop } from '../types';

/**
 * Get Supabase client (to be implemented by Dev 2)
 * @returns Supabase client instance
 */
export function getSupabaseClient() {
  // TODO: Implement Supabase client
  // This will be configured by Developer 2
  throw new Error('Supabase client not yet configured. Developer 2 will implement this.');
}

/**
 * Mock function to get all shops (for development/testing)
 * Replace this with actual Supabase query
 * @returns Array of shops
 */
export async function getAllShops(): Promise<Shop[]> {
  // TODO: Replace with actual Supabase query
  // Example:
  // const { data, error } = await supabase.from('shops').select('*');
  // if (error) throw error;
  // return data;

  // Mock data for testing
  return [
    {
      id: '1',
      name: 'Bengkel Motor Jaya',
      description: 'Bengkel motor terpercaya sejak 2010. Spesialis Honda dan Yamaha.',
      latitude: -6.2088,
      longitude: 106.8456,
      whatsapp_number: '6281234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Bengkel Sentosa Motor',
      description: 'Servis cepat dan berkualitas. Buka 24 jam.',
      latitude: -6.2145,
      longitude: 106.8567,
      whatsapp_number: '6281234567891',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Bengkel Mitra Motor',
      description: 'Spesialis ban dan oli. Harga terjangkau.',
      latitude: -6.2000,
      longitude: 106.8300,
      whatsapp_number: '6281234567892',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

/**
 * Mock function to search shops by name
 * @param query Search query
 * @returns Array of matching shops
 */
export async function searchShops(query: string): Promise<Shop[]> {
  // TODO: Replace with actual Supabase query
  // Example:
  // const { data, error } = await supabase
  //   .from('shops')
  //   .select('*')
  //   .ilike('name', `%${query}%`);
  // if (error) throw error;
  // return data;

  const allShops = await getAllShops();
  return allShops.filter(shop =>
    shop.name.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Mock function to get shop by ID
 * @param id Shop ID
 * @returns Shop or null
 */
export async function getShopById(id: string): Promise<Shop | null> {
  // TODO: Replace with actual Supabase query
  const allShops = await getAllShops();
  return allShops.find(shop => shop.id === id) || null;
}
