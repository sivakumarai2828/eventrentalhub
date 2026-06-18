import type { ReactNode } from "react";
import { Link } from "react-router-dom";

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm text-primary-foreground/60">{children}</ul>
    </div>
  );
}

const linkClass = "transition hover:text-primary-foreground";

export function Footer() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-serif text-2xl tracking-[0.18em]">EVENTRENTHUB</div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/55">
            Curated event décor rentals for life&apos;s most beautiful moments —
            backdrops, furniture, drapes, lighting and floral. Pay owners directly
            at pickup.
          </p>
        </div>

        <FooterCol title="Rentals">
          <li>
            <Link to="/browse" className={linkClass}>
              Backdrops
            </Link>
          </li>
          <li>
            <Link to="/browse" className={linkClass}>
              Furniture
            </Link>
          </li>
          <li>
            <Link to="/browse" className={linkClass}>
              Drapes
            </Link>
          </li>
          <li>
            <Link to="/browse" className={linkClass}>
              Lighting
            </Link>
          </li>
          <li>
            <Link to="/browse" className={linkClass}>
              Floral
            </Link>
          </li>
        </FooterCol>

        <FooterCol title="Company">
          <li>
            <Link to="/browse" className={linkClass}>
              Browse rentals
            </Link>
          </li>
          <li>
            <Link to="/register" className={linkClass}>
              Become an owner
            </Link>
          </li>
          <li>
            <Link to="/bookings" className={linkClass}>
              My requests
            </Link>
          </li>
        </FooterCol>

        <FooterCol title="Support">
          <li>How it works</li>
          <li>hello@eventrenthub.com</li>
          <li>Instagram · Pinterest</li>
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-primary-foreground/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} EventRentHub. Pay owners at pickup — no online payments.</span>
          <span>Privacy Policy · Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
