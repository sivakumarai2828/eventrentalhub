import { ArrowLeft, Check, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/Spinner";
import { useCart } from "@/context/CartContext";
import { currency, todayISO } from "@/lib/format";
import { checkAvailability, getItem, listCategories } from "@/lib/services";
import type { AvailabilityCheck, ItemCard } from "@/types";

export function ItemDetail() {
  const { itemId } = useParams();
  const { add } = useCart();
  const [pickup, setPickup] = useState(todayISO());
  const [returnDate, setReturnDate] = useState(todayISO());
  const [availability, setAvailability] = useState<AvailabilityCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { data: item, isLoading, isError, error } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItem(itemId!),
    enabled: !!itemId,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  if (isLoading) return <PageLoader />;
  if (isError || !item)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={(error as Error)?.message ?? "Item not found"} />
      </div>
    );

  const runCheck = async () => {
    setChecking(true);
    try {
      setAvailability(await checkAvailability(item.id, pickup, returnDate));
    } finally {
      setChecking(false);
    }
  };

  const card: ItemCard = {
    id: item.id,
    name: item.name,
    price_per_day: item.price_per_day,
    pickup_city: item.pickup_city,
    category_id: item.category_id,
    quantity_available: item.quantity_available,
    status: item.status,
    primary_image_url: item.images.find((i) => i.is_primary)?.image_url ?? null,
    remaining_available: availability?.remaining ?? null,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/browse"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ImageGallery images={item.images} name={item.name} />

        <div>
          {categories?.find((c) => c.id === item.category_id)?.name && (
            <span className="eyebrow">
              {categories.find((c) => c.id === item.category_id)?.name}
            </span>
          )}
          <h1 className="text-4xl font-semibold leading-tight">{item.name}</h1>

          <p className="mt-4 text-3xl font-semibold">
            {currency(item.price_per_day)}
            <span className="text-base font-normal text-muted-foreground"> / day</span>
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Card className="p-3">
              <dt className="text-muted-foreground">Security deposit</dt>
              <dd className="font-semibold">{currency(item.security_deposit)}</dd>
            </Card>
            <Card className="p-3">
              <dt className="text-muted-foreground">In stock</dt>
              <dd className="font-semibold">{item.quantity_available}</dd>
            </Card>
          </dl>

          <p className="mt-4 whitespace-pre-line text-foreground/80">{item.description}</p>

          <Card className="mt-6 space-y-3 p-4">
            <h3 className="font-semibold">Check availability</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pickup">Pickup date</Label>
                <Input
                  id="pickup"
                  type="date"
                  value={pickup}
                  min={todayISO()}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="return">Return date</Label>
                <Input
                  id="return"
                  type="date"
                  value={returnDate}
                  min={pickup}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={runCheck} disabled={checking}>
              {checking ? "Checking…" : "Check availability"}
            </Button>
            {availability && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  availability.is_available
                    ? "bg-green-50 text-green-800"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {availability.is_available ? (
                  <>
                    <Check className="h-4 w-4" /> {availability.remaining} available for those
                    dates
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" /> Unavailable for those dates.
                    {availability.next_available_date &&
                      ` Next available around ${availability.next_available_date}.`}
                  </>
                )}
              </div>
            )}
          </Card>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1"
              disabled={item.status !== "active"}
              onClick={() => {
                add(card, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
            >
              {added ? "Added to request ✓" : "Add to Rental Request"}
            </Button>
          </div>
          {item.status !== "active" && (
            <p className="mt-2 text-sm text-destructive">
              This listing is currently inactive.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
