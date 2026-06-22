import type {
  AvailabilityCheck,
  BookingRequest,
  Category,
  Item,
  ItemFilters,
  ItemImage,
  PaginatedItems,
  UserProfile,
} from "../types";
import { api } from "./api";

// --- Auth / profile ---
export const getMe = () => api.get<UserProfile>("/api/me").then((r) => r.data);
export const updateMe = (payload: Partial<UserProfile>) =>
  api.put<UserProfile>("/api/me", payload).then((r) => r.data);

// --- Categories ---
export const listCategories = () =>
  api.get<Category[]>("/api/categories").then((r) => r.data);
export const getCategory = (id: string) =>
  api.get<Category>(`/api/categories/${id}`).then((r) => r.data);
export const createCategory = (payload: Partial<Category>) =>
  api.post<Category>("/api/categories", payload).then((r) => r.data);
export const updateCategory = (id: string, payload: Partial<Category>) =>
  api.patch<Category>(`/api/categories/${id}`, payload).then((r) => r.data);
export const deleteCategory = (id: string) =>
  api.delete(`/api/categories/${id}`).then((r) => r.data);

// --- Items ---
export const listItems = (filters: ItemFilters = {}) =>
  api
    .get<PaginatedItems>("/api/items", { params: filters })
    .then((r) => r.data);
export const getItem = (id: string) =>
  api.get<Item>(`/api/items/${id}`).then((r) => r.data);
export const checkAvailability = (
  id: string,
  pickup_date: string,
  return_date: string,
) =>
  api
    .get<AvailabilityCheck>(`/api/items/${id}/availability`, {
      params: { pickup_date, return_date },
    })
    .then((r) => r.data);

export interface ItemInput {
  category_id: string;
  name: string;
  description: string;
  price_per_day: number;
  security_deposit: number;
  quantity_available: number;
  pickup_city: string;
  pickup_address: string;
  status: "active" | "inactive";
  images?: { image_url: string; display_order: number; is_primary: boolean }[];
}

export const createItem = (payload: ItemInput) =>
  api.post<Item>("/api/items", payload).then((r) => r.data);
export const updateItem = (id: string, payload: Partial<ItemInput>) =>
  api.patch<Item>(`/api/items/${id}`, payload).then((r) => r.data);
export const deleteItem = (id: string) =>
  api.delete(`/api/items/${id}`).then((r) => r.data);

// --- Item images ---
export const addItemImage = (
  itemId: string,
  payload: { image_url: string; display_order?: number; is_primary?: boolean },
) =>
  api.post<ItemImage>(`/api/items/${itemId}/images`, payload).then((r) => r.data);
export const deleteItemImage = (itemId: string, imageId: string) =>
  api.delete(`/api/items/${itemId}/images/${imageId}`).then((r) => r.data);
export const setPrimaryImage = (itemId: string, imageId: string) =>
  api
    .patch<ItemImage>(`/api/items/${itemId}/images/${imageId}/primary`)
    .then((r) => r.data);

// --- Bookings ---
export interface BookingInput {
  event_type: string;
  event_date: string | null;
  pickup_date: string;
  return_date: string;
  budget: number | null;
  notes: string;
  items: { item_id: string; quantity: number }[];
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
}

export const createBooking = (payload: BookingInput) =>
  api.post<BookingRequest[]>("/api/bookings", payload).then((r) => r.data);
export const listBookings = (role: "customer" | "owner", status?: string) =>
  api
    .get<BookingRequest[]>("/api/bookings", { params: { role, status } })
    .then((r) => r.data);
export const updateBookingStatus = (id: string, status: string) =>
  api
    .patch<BookingRequest>(`/api/bookings/${id}/status`, { status })
    .then((r) => r.data);

// --- Quote requests ("Get a Quote" lead form) ---
export interface QuoteInput {
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  categories: string[];
  details?: string;
}

export const createQuote = (payload: QuoteInput) =>
  api.post("/api/quotes", payload).then((r) => r.data);

// --- Admin ---
export const adminListUsers = (params: { q?: string; role?: string } = {}) =>
  api.get<UserProfile[]>("/api/admin/users", { params }).then((r) => r.data);
export const adminUpdateUser = (id: string, payload: Partial<UserProfile>) =>
  api.patch<UserProfile>(`/api/admin/users/${id}`, payload).then((r) => r.data);
export const adminListItems = (params: { status?: string; page?: number } = {}) =>
  api.get<PaginatedItems>("/api/admin/items", { params }).then((r) => r.data);
export const adminSetItemStatus = (id: string, status: "active" | "inactive") =>
  api
    .patch<Item>(`/api/admin/items/${id}/status`, null, { params: { status } })
    .then((r) => r.data);
export const adminListBookings = (status?: string) =>
  api
    .get<BookingRequest[]>("/api/admin/bookings", { params: { status } })
    .then((r) => r.data);
