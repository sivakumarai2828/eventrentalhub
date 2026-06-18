import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { DashboardTabs, ownerTabs } from "@/components/layout/DashboardTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { currency } from "@/lib/format";
import { thumbnail } from "@/lib/storage";
import { deleteItem, listItems } from "@/lib/services";

export function OwnerInventory() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["items", "owner", "list", profile?.id],
    queryFn: () => listItems({ owner_id: profile!.id, status: "all", page_size: 60 }),
    enabled: !!profile,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  return (
    <div>
      <DashboardTabs title="Owner Dashboard" tabs={ownerTabs} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <Button asChild>
            <Link to="/owner/inventory/new">+ Create listing</Link>
          </Button>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : data && data.items.length > 0 ? (
          <Card className="divide-y">
            {data.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="h-14 w-14 overflow-hidden rounded-lg bg-secondary">
                  {item.primary_image_url ? (
                    <img
                      src={thumbnail(item.primary_image_url, 120)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">🎉</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currency(item.price_per_day)}/day · qty {item.quantity_available} ·{" "}
                    <span
                      className={
                        item.status === "active" ? "text-green-600" : "text-muted-foreground"
                      }
                    >
                      {item.status}
                    </span>
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/owner/inventory/${item.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`Delete “${item.name}”? This cannot be undone.`)) {
                      remove.mutate(item.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </Card>
        ) : (
          <EmptyState
            title="No listings yet"
            description="Create your first rental listing to start receiving requests."
            action={
              <Button asChild>
                <Link to="/owner/inventory/new">+ Create listing</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
