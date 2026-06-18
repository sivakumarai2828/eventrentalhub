import axios from "axios";

import { supabase } from "./supabase";

// In dev, VITE_API_BASE_URL is blank and requests hit the Vite proxy (/api).
// In prod, point it at the deployed backend.
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({ baseURL });

// Attach the Supabase access token to every request. Resilient: a session
// error (e.g. during sign-out / token refresh) must never block requests to
// public endpoints like /api/items and /api/categories.
api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    /* no session — proceed unauthenticated */
  }
  return config;
});

// Normalize API errors into readable messages.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const detail =
      error?.response?.data?.detail ??
      error?.message ??
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(typeof detail === "string" ? detail : JSON.stringify(detail)));
  },
);
