export type Role = "customer" | "owner" | "admin";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  created_at: string;
  item_count?: number;
}

export interface ItemImage {
  id: string;
  item_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  owner_id: string;
  category_id: string;
  name: string;
  description: string;
  price_per_day: number;
  security_deposit: number;
  quantity_available: number;
  pickup_city: string;
  pickup_address: string;
  status: "active" | "inactive";
  created_at: string;
  images: ItemImage[];
}

export interface ItemCard {
  id: string;
  name: string;
  price_per_day: number;
  pickup_city: string;
  category_id: string;
  quantity_available: number;
  status: string;
  primary_image_url: string | null;
  remaining_available: number | null;
}

export interface PaginatedItems {
  items: ItemCard[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface AvailabilityCheck {
  remaining: number;
  is_available: boolean;
  next_available_date: string | null;
}

export interface BookingItem {
  id: string;
  item_id: string;
  quantity: number;
  daily_rate: number;
  item: ItemCard | null;
}

export interface BookingRequest {
  id: string;
  customer_id: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  owner_id: string;
  status: BookingStatus;
  event_type: string;
  event_date: string | null;
  pickup_date: string;
  return_date: string;
  budget: number | null;
  notes: string;
  created_at: string;
  items: BookingItem[];
  estimated_total: number | null;
}

export interface ItemFilters {
  q?: string;
  category_id?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  available_from?: string;
  available_to?: string;
  owner_id?: string;
  status?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  page_size?: number;
}
