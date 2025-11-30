/**
 * Supabase client utilities for shop operations
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { Shop, Mechanic } from '../types';
import { Tables } from '../supabase/database.types';

type DbShop = Tables<'shops'>;
type DbMechanic = Tables<'mechanics'>;

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
 * Get all shops with mechanics
 */
export async function getAllShops(): Promise<Shop[]> {
  const supabase = await createServerClient();

  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false });

  if (shopsError) throw shopsError;
  if (!shops) return [];

  // Get mechanics for all shops
  const { data: mechanics, error: mechanicsError } = await supabase
    .from('mechanics')
    .select('*');

  if (mechanicsError) throw mechanicsError;

  // Map mechanics to shops
  return shops.map(shop => {
    const shopMechanics = mechanics?.filter(m => m.shop_id === shop.id) || [];
    return mapDbShopToShop(shop, shopMechanics);
  });
}

/**
 * Search shops by name
 */
export async function searchShops(query: string): Promise<Shop[]> {
  const supabase = await createServerClient();

  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });

  if (shopsError) throw shopsError;
  if (!shops) return [];

  // Get mechanics for found shops
  const shopIds = shops.map(s => s.id);
  const { data: mechanics, error: mechanicsError } = await supabase
    .from('mechanics')
    .select('*')
    .in('shop_id', shopIds);

  if (mechanicsError) throw mechanicsError;

  return shops.map(shop => {
    const shopMechanics = mechanics?.filter(m => m.shop_id === shop.id) || [];
    return mapDbShopToShop(shop, shopMechanics);
  });
}

/**
 * Get shop by ID
 */
export async function getShopById(id: string): Promise<Shop | null> {
  const supabase = await createServerClient();
  const shopId = parseInt(id);

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('id', shopId)
    .single();

  if (shopError || !shop) return null;

  // Get mechanics for this shop
  const { data: mechanics, error: mechanicsError } = await supabase
    .from('mechanics')
    .select('*')
    .eq('shop_id', shopId);

  if (mechanicsError) throw mechanicsError;

  return mapDbShopToShop(shop, mechanics || []);
}
