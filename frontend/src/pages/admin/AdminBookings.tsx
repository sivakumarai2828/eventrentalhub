import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BookingCard } from "@/components/BookingCard";
import { DashboardTabs, adminTabs } from "@/components/layout/DashboardTabs";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { adminListBookings, updateBookingStatus } from "@/lib/services";
import type { BookingStatus } from "@/types";

const FILTERS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Completed", value: "COMPLETED" },
];

export function AdminBookings() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => adminListBookings(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  });

  const filtered = filter === "ALL" ? data : data?.filter((b) => b.status === filter);

  return (
    <div>
      <DashboardTabs title="Admin Dashboard" tabs={adminTabs} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {mutation.isError && (
          <div className="mb-4">
            <ErrorState message={(mutation.error as Error).message} />
          </div>
        )}

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : filtered && filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                busy={mutation.isPending}
                onApprove={() => mutation.mutate({ id: b.id, status: "APPROVED" })}
                onReject={() => mutation.mutate({ id: b.id, status: "REJECTED" })}
                onComplete={() => mutation.mutate({ id: b.id, status: "COMPLETED" })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No requests"
            description="Rental requests from customers will appear here for approval."
          />
        )}
      </div>
    </div>
  );
}
