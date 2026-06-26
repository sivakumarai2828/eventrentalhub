import { NavLink } from "react-router-dom";

interface Tab {
  to: string;
  label: string;
  end?: boolean;
}

export function DashboardTabs({ title, tabs }: { title: string; tabs: Tab[] }) {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-4">
        <div className="pt-8">
          <span className="eyebrow">Party Loft</span>
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        </div>
        <nav className="mt-5 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-gold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export const ownerTabs: Tab[] = [
  { to: "/owner", label: "Overview", end: true },
  { to: "/owner/inventory", label: "Inventory" },
  { to: "/owner/bookings", label: "Bookings" },
  { to: "/profile", label: "Profile" },
];

export const adminTabs: Tab[] = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/listings", label: "Listings" },
];
