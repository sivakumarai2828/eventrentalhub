import { ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/format";
import { thumbnail } from "@/lib/storage";
import type { ItemCard as ItemCardType } from "@/types";

export function ItemCard({ item }: { item: ItemCardType }) {
  const remaining = item.remaining_available;
  const soldOut = remaining === 0;

  return (
    <Link
      to={`/items/${item.id}`}
      className="group overflow-hidden rounded-xl border bg-card text-card-foreground transition hover:border-foreground/20 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {item.primary_image_url ? (
          <img
            src={thumbnail(item.primary_image_url)}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        {soldOut && (
          <Badge variant="destructive" className="absolute left-3 top-3 rounded-full">
            Unavailable
          </Badge>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 font-semibold">{item.name}</h3>
        <div className="flex items-baseline justify-between pt-1">
          <p className="font-bold">
            {currency(item.price_per_day)}
            <span className="text-xs font-normal text-muted-foreground"> / day</span>
          </p>
          {remaining != null && remaining > 0 && (
            <span className="text-xs text-muted-foreground">{remaining} available</span>
          )}
        </div>
      </div>
    </Link>
  );
}
