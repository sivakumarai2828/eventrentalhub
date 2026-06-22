import { motion } from "framer-motion";
import { ImageIcon, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/format";
import { thumbnail } from "@/lib/storage";
import type { ItemCard as ItemCardType } from "@/types";

export function ItemCard({ item }: { item: ItemCardType }) {
  const remaining = item.remaining_available;
  const soldOut = remaining === 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/items/${item.id}`}
        className="group block overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-premium transition-shadow duration-300 hover:shadow-premium-hover"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {item.primary_image_url ? (
            <img
              src={thumbnail(item.primary_image_url)}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}

          {/* Subtle overlay that deepens on hover for legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {soldOut && (
            <Badge
              variant="destructive"
              className="absolute left-3 top-3 rounded-full"
            >
              Unavailable
            </Badge>
          )}

          {/* Glassmorphism price tag */}
          <div className="glass-panel absolute bottom-3 right-3 rounded-full px-3 py-1.5">
            <span className="text-sm font-semibold text-slate-900">
              {currency(item.price_per_day)}
              <span className="text-xs font-normal text-slate-600"> / day</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-gold-dark">
            {item.name}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            {item.pickup_city ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-gold" />
                {item.pickup_city}
              </span>
            ) : (
              <span />
            )}
            {remaining != null && remaining > 0 && (
              <span className="text-xs text-muted-foreground">
                {remaining} available
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
