import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { DashboardTabs, ownerTabs } from "@/components/layout/DashboardTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { listBookings, listItems } from "@/lib/services";

export function OwnerOverview() {
  const { profile } = useAuth();

  const inventory = useQuery({
    queryKey: ["items", "owner", profile?.id],
    queryFn: () => listItems({ owner_id: profile!.id, status: "all", page_size: 1 }),
    enabled: !!profile,
  });
  const bookings = useQuery({
    queryKey: ["bookings", "owner"],
    queryFn: () => listBookings("owner"),
  });

  const pending = bookings.data?.filter((b) => b.status === "PENDING").length ?? 0;
  const approved = bookings.data?.filter((b) => b.status === "APPROVED").length ?? 0;

  return (
    <div>
      <DashboardTabs title="Owner Dashboard" tabs={ownerTabs} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {inventory.isLoading || bookings.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Listings" value={inventory.data?.total ?? 0} />
              <Stat label="Pending requests" value={pending} accent />
              <Stat label="Approved" value={approved} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/owner/inventory/new">+ Create listing</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/owner/inventory">Manage inventory</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/owner/bookings">Review requests</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? "text-foreground" : ""}`}>{value}</p>
    </Card>
  );
}
