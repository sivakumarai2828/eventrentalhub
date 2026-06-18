import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { DashboardTabs, adminTabs } from "../../components/layout/DashboardTabs";
import { PageLoader } from "../../components/ui/Spinner";
import { adminListItems, adminListUsers, listCategories } from "../../lib/services";

export function AdminOverview() {
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const items = useQuery({
    queryKey: ["admin", "items", 1],
    queryFn: () => adminListItems({ status: "all" }),
  });

  const loading = users.isLoading || categories.isLoading || items.isLoading;

  return (
    <div>
      <DashboardTabs title="Admin Dashboard" tabs={adminTabs} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card to="/admin/users" label="Users" value={users.data?.length ?? 0} />
              <Card
                to="/admin/categories"
                label="Categories"
                value={categories.data?.length ?? 0}
              />
              <Card
                to="/admin/listings"
                label="Listings"
                value={items.data?.total ?? 0}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ to, label, value }: { to: string; label: string; value: number }) {
  return (
    <Link
      to={to}
      className="rounded-xl border bg-card p-6 text-card-foreground transition hover:border-foreground/20 hover:shadow-md"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-foreground">Manage →</p>
    </Link>
  );
}
