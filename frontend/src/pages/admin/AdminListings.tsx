import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { DashboardTabs, adminTabs } from "@/components/layout/DashboardTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { currency } from "@/lib/format";
import { thumbnail } from "@/lib/storage";
import { adminListItems, adminSetItemStatus } from "@/lib/services";

export function AdminListings() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "items", page],
    queryFn: () => adminListItems({ status: "all", page }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      adminSetItemStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "items"] }),
  });

  return (
    <div>
      <DashboardTabs title="Admin Dashboard" tabs={adminTabs} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="mb-4 text-lg font-semibold">All listings</h2>

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : (
          <>
            <Card className="divide-y">
              {data?.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-secondary text-muted-foreground">
                    {item.primary_image_url ? (
                      <img
                        src={thumbnail(item.primary_image_url, 120)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/items/${item.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {currency(item.price_per_day)}/day
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      item.status === "active" ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {item.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        id: item.id,
                        status: item.status === "active" ? "inactive" : "active",
                      })
                    }
                  >
                    {item.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              ))}
            </Card>
            {data && (
              <Pagination page={data.page} pages={data.pages} onChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
