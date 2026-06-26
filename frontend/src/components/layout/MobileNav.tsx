import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { QuoteDialog } from "@/components/QuoteDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type Tab = { label: string; to: string };

/**
 * Hamburger menu for small screens. Used by both navbar variants — on the home
 * hero (white trigger) and on inner pages (dark trigger). Exposes the section
 * tabs, the Get-a-Quote modal, and auth actions that are hidden inline on mobile.
 */
export function MobileNav({
  variant,
  tabs,
  onSignOut,
}: {
  variant: "hero" | "solid";
  tabs: Tab[];
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { session, profile } = useAuth();
  const close = () => setOpen(false);

  // The inline nav appears at `lg` on the hero (wider) and `md` elsewhere, so
  // the hamburger is hidden from that breakpoint up.
  const hide = variant === "hero" ? "lg:hidden" : "md:hidden";
  const triggerColor =
    variant === "hero"
      ? "text-[#3a2800] hover:bg-black/5"
      : "text-foreground hover:bg-secondary";

  // Close on Escape and lock body scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const itemClass =
    "rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary";

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className={`${hide} inline-flex items-center justify-center rounded-md p-2 transition ${triggerColor}`}
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className={`fixed inset-0 z-50 ${hide}`}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <div className="absolute inset-x-0 top-0 max-h-[92vh] overflow-y-auto rounded-b-3xl bg-background p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg font-semibold uppercase tracking-[0.14em]">
                Party Loft
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="rounded-md p-2 text-foreground transition hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-0.5">
              {tabs.map((t) => (
                <Link key={t.to} to={t.to} onClick={close} className={itemClass}>
                  {t.label}
                </Link>
              ))}
            </nav>

            <div className="my-4 h-px bg-border" />

            {/* Get a Quote — leaves the menu mounted so the modal can open over it */}
            <QuoteDialog
              trigger={
                <button
                  type="button"
                  className="relative w-full overflow-hidden rounded-full px-6 py-3 font-mont text-xs font-bold uppercase tracking-[0.1em] text-champagne-ink"
                >
                  <span className="absolute inset-0 animate-shimmer bg-gold-shimmer bg-[length:200%]" />
                  <span className="relative">✦ Get a Quote</span>
                </button>
              }
            />

            <div className="mt-4 flex flex-col gap-2">
              {session ? (
                <>
                  <Link to="/bookings" onClick={close} className={itemClass}>
                    My requests
                  </Link>
                  {profile?.role === "owner" && (
                    <Link to="/owner" onClick={close} className={itemClass}>
                      Owner dashboard
                    </Link>
                  )}
                  {profile?.role === "admin" && (
                    <Link to="/admin" onClick={close} className={itemClass}>
                      Admin dashboard
                    </Link>
                  )}
                  <Link to="/profile" onClick={close} className={itemClass}>
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onSignOut();
                    }}
                    className={`${itemClass} text-left text-destructive hover:bg-destructive/10`}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Button asChild variant="secondary">
                    <Link to="/login" onClick={close}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register" onClick={close}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
