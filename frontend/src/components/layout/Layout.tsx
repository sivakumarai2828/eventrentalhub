import { Outlet, useLocation } from "react-router-dom";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  // The homepage is a single full-bleed hero — no footer, so it stays a clean
  // one-screen landing. Every other page keeps the footer.
  const isHome = useLocation().pathname === "/";

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isHome && <Footer />}
    </div>
  );
}
