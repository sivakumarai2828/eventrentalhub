import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuoteDialog } from "@/components/QuoteDialog";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

// Primary section tabs. The homepage is intentionally minimal (hero only), so
// these tabs are how visitors reach everything that used to live on the home
// page: catalogue, category grid, the explainer, and the host CTA.
const NAV_TABS = [
  { label: "Browse", to: "/browse" },
  { label: "Categories", to: "/categories" },
  { label: "How it works", to: "/how-it-works" },
  { label: "List your decor", to: "/become-a-host" },
];

export function Navbar() {
  const { session, profile, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initial = (profile?.name || profile?.email || "?").charAt(0).toUpperCase();
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  const userMenu = (onHero: boolean) =>
    session ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`rounded-full outline-none focus-visible:ring-2 ${
              onHero ? "focus-visible:ring-white/60" : "focus-visible:ring-ring"
            }`}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback
                className={`text-sm font-semibold ${
                  onHero ? "bg-white/15 text-white" : "bg-secondary"
                }`}
              >
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="truncate text-sm">{profile?.email}</span>
            <span className="text-xs font-normal capitalize text-muted-foreground">
              {profile?.role}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/bookings">My requests</Link>
          </DropdownMenuItem>
          {profile?.role === "owner" && (
            <DropdownMenuItem asChild>
              <Link to="/owner">Owner dashboard</Link>
            </DropdownMenuItem>
          )}
          {profile?.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link to="/admin">Admin dashboard</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  if (isHome) {
    // Glassy, translucent bar floating over the full-bleed hero (Party Loft).
    return (
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-[72px] max-w-7xl animate-fade-in items-center justify-between gap-4 px-4 sm:px-8">
          {/* Serif italic logo */}
          <Link to="/" className="flex shrink-0 flex-col items-start leading-none">
            <span className="font-playfair text-2xl font-bold italic tracking-tight text-white">
              EventRentHub
            </span>
            <span className="mt-0.5 text-[10px] font-light uppercase tracking-[0.5em] text-champagne-dark">
              Rentals
            </span>
          </Link>

          {/* Glassy section tabs */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-white/15 bg-white/[0.08] p-1 backdrop-blur-md lg:flex">
            {NAV_TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="whitespace-nowrap rounded-full px-4 py-1.5 font-mont text-xs tracking-wide text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Gold "Get a Quote" CTA — opens the quote form modal */}
            <QuoteDialog
              trigger={
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative hidden overflow-hidden rounded-full px-6 py-2.5 font-mont text-[11px] font-bold uppercase tracking-[0.1em] text-champagne-ink lg:inline-flex"
                >
                  <span className="absolute inset-0 animate-shimmer bg-gold-shimmer bg-[length:200%]" />
                  <span className="relative">✦ Get a Quote</span>
                </motion.button>
              }
            />

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/cart" aria-label="Rental cart">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-gradient px-1 text-xs font-bold text-champagne-ink">
                    {count}
                  </span>
                )}
              </Link>
            </Button>

            {session ? (
              <span className="hidden lg:block">{userMenu(true)}</span>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="hidden text-white hover:bg-white/10 hover:text-white lg:inline-flex"
              >
                <Link to="/login">Log in</Link>
              </Button>
            )}

            <MobileNav variant="hero" tabs={NAV_TABS} onSignOut={handleSignOut} />
          </div>
        </div>
      </header>
    );
  }

  // Solid light bar everywhere else, with the same section tabs.
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-serif text-base text-primary-foreground">
            E
          </span>
          <span className="font-serif text-base font-semibold uppercase tracking-[0.08em] sm:text-xl sm:tracking-[0.18em]">
            EventRentHub
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                isActive(t.to)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/cart" aria-label="Rental cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {session ? (
            <span className="hidden md:block">{userMenu(false)}</span>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}

          <MobileNav variant="solid" tabs={NAV_TABS} onSignOut={handleSignOut} />
        </div>
      </div>
    </header>
  );
}
