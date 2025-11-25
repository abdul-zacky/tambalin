// Location Types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt' | null;
}

// Shop Types
export interface ShopPhoto {
  id: string;
  shop_id: string;
  photo_url: string;
  display_order: number;
}

export interface Mechanic {
  id: string;
  shop_id: string;
  name: string;
  specialty?: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  address?: string;
  latitude: number;
  longitude: number;
  whatsapp_number: string;
  created_at: string;
  updated_at: string;
  photos?: ShopPhoto[];
  mechanics?: Mechanic[];
  distance?: number; // Distance in kilometers
}

// Emergency Request Types
export interface EmergencyFormData {
  repair_type: string;
  name: string;
  phone: string;
  additional_details?: string;
}

export interface EmergencyRequest extends EmergencyFormData {
  user_location: Location;
}

export interface EmergencyResponse {
  shops: ShopWithRouteDistance[];
  user_location: Location;
}

export interface ShopWithRouteDistance extends Shop {
  route_distance: number; // Road distance in kilometers
  route_duration: number; // Duration in minutes
}

// Search Types
export interface SearchParams {
  query: string;
  location?: Location;
}

export interface SearchResponse {
  shops: Shop[];
  query: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Review Types
export interface Review {
  id: string;
  shop_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

// WhatsApp Message Types
export interface WhatsAppMessageData {
  shop_whatsapp: string;
  customer_name: string;
  customer_phone: string;
  repair_type: string;
  additional_details?: string;
  user_location: Location;
}
