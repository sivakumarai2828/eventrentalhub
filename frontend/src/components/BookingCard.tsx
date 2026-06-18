import { Link } from "react-router-dom";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currency, formatDate } from "@/lib/format";
import type { BookingRequest } from "@/types";

export function BookingCard({
  booking,
  onApprove,
  onReject,
  onComplete,
  busy,
}: {
  booking: BookingRequest;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  busy?: boolean;
}) {
  const showActions = onApprove || onReject || onComplete;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">
            {booking.event_type || "Event"} · {formatDate(booking.event_date)}
          </p>
          <p className="text-xs text-muted-foreground">
            Pickup {formatDate(booking.pickup_date)} → Return{" "}
            {formatDate(booking.return_date)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <ul className="mt-4 space-y-2">
        {booking.items.map((bi) => (
          <li key={bi.id} className="flex items-center justify-between text-sm">
            <Link to={`/items/${bi.item_id}`} className="font-medium hover:underline">
              {bi.item?.name ?? "Item"}
            </Link>
            <span className="text-muted-foreground">
              {bi.quantity} × {currency(bi.daily_rate)}/day
            </span>
          </li>
        ))}
      </ul>

      {(booking.guest_name || booking.guest_email) && (
        <p className="mt-3 text-sm">
          <span className="text-muted-foreground">Requested by </span>
          <span className="font-medium">{booking.guest_name || "Guest"}</span>
          {booking.guest_email && (
            <span className="text-muted-foreground"> · {booking.guest_email}</span>
          )}
          {booking.guest_phone && (
            <span className="text-muted-foreground"> · {booking.guest_phone}</span>
          )}
        </p>
      )}

      {booking.notes && (
        <p className="mt-3 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
          “{booking.notes}”
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Estimated total</span>
        <span className="font-bold">{currency(booking.estimated_total)}</span>
      </div>

      {showActions && (
        <div className="mt-4 flex gap-2">
          {booking.status === "PENDING" && (
            <>
              <Button className="flex-1" onClick={onApprove} disabled={busy}>
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onReject}
                disabled={busy}
              >
                Reject
              </Button>
            </>
          )}
          {booking.status === "APPROVED" && onComplete && (
            <Button variant="outline" className="w-full" onClick={onComplete} disabled={busy}>
              Mark completed
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
