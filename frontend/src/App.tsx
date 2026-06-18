import { Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { Browse } from "./pages/Browse";
import { ItemDetail } from "./pages/ItemDetail";
import { Cart } from "./pages/Cart";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { MyBookings } from "./pages/MyBookings";
import { NotFound } from "./pages/NotFound";
import { OwnerOverview } from "./pages/owner/OwnerOverview";
import { OwnerInventory } from "./pages/owner/OwnerInventory";
import { OwnerItemForm } from "./pages/owner/OwnerItemForm";
import { OwnerBookings } from "./pages/owner/OwnerBookings";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminListings } from "./pages/admin/AdminListings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="categories/:categoryId" element={<Browse />} />
        <Route path="items/:itemId" element={<ItemDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Owner */}
        <Route
          path="owner"
          element={
            <ProtectedRoute roles={["owner", "admin"]}>
              <OwnerOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/inventory"
          element={
            <ProtectedRoute roles={["owner", "admin"]}>
              <OwnerInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/inventory/new"
          element={
            <ProtectedRoute roles={["owner", "admin"]}>
              <OwnerItemForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/inventory/:itemId/edit"
          element={
            <ProtectedRoute roles={["owner", "admin"]}>
              <OwnerItemForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/bookings"
          element={
            <ProtectedRoute roles={["owner", "admin"]}>
              <OwnerBookings />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/categories"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/listings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminListings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
