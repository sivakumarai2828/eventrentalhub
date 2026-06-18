import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { BookingCard } from "@/components/BookingCard";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { listBookings } from "@/lib/services";

export function MyBookings() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bookings", "customer"],
    queryFn: () => listBookings("customer"),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">My rental requests</h1>

      <div className="mt-6">
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : data && data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No requests yet"
            description="When you send a rental request, it will appear here."
            action={
              <Button asChild>
                <Link to="/browse">Browse rentals</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
