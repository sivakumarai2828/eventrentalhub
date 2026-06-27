import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { currency, daysBetween, todayISO } from "@/lib/format";
import { createBooking, type BookingInput } from "@/lib/services";

const EVENT_TYPES = ["Wedding", "Birthday", "Baby Shower", "Graduation", "Corporate", "Other"];

export function Cart() {
  const { lines, updateQuantity, remove, clear } = useCart();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    event_type: "Wedding",
    event_date: "",
    pickup_date: todayISO(),
    return_date: todayISO(),
    budget: "",
    notes: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
  });

  const guestReady = !!form.guest_name && !!form.guest_email;

  const days = daysBetween(form.pickup_date, form.return_date);
  const perDay = lines.reduce((sum, l) => sum + Number(l.item.price_per_day) * l.quantity, 0);
  const estimatedTotal = perDay * days;

  const mutation = useMutation({
    mutationFn: (payload: BookingInput) => createBooking(payload),
    onSuccess: () => {
      clear();
      navigate("/bookings");
    },
  });

  const submit = () => {
    if (!session && !guestReady) return;
    mutation.mutate({
      event_type: form.event_type,
      event_date: form.event_date || null,
      pickup_date: form.pickup_date,
      return_date: form.return_date,
      budget: form.budget ? Number(form.budget) : null,
      notes: form.notes,
      items: lines.map((l) => ({ item_id: l.item.id, quantity: l.quantity })),
      ...(session
        ? {}
        : {
            guest_name: form.guest_name,
            guest_email: form.guest_email,
            guest_phone: form.guest_phone || null,
          }),
    });
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="Your rental request is empty"
          description="Browse rentals and add items to build a request."
          action={
            <Button asChild>
              <Link to="/browse">Browse rentals</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Rental Request</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="divide-y p-0">
          {lines.map((l) => (
            <div key={l.item.id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                {l.item.primary_image_url && (
                  <img
                    src={l.item.primary_image_url}
                    alt={l.item.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/items/${l.item.id}`} className="font-semibold hover:underline">
                  {l.item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {currency(l.item.price_per_day)} / day
                </p>
              </div>
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(l.item.id, l.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(l.item.id, l.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-20 text-right font-semibold">
                {currency(Number(l.item.price_per_day) * l.quantity)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => remove(l.item.id)}
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </Card>

        <Card className="h-fit space-y-4 p-5">
          <h2 className="font-semibold">Request details</h2>

          {!session && (
            <div className="space-y-3 rounded-lg border border-dashed bg-secondary/40 p-3">
              <p className="text-sm font-medium">Your contact details</p>
              <div className="space-y-1.5">
                <Label htmlFor="g_name">Full name</Label>
                <Input
                  id="g_name"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="g_email">Email</Label>
                <Input
                  id="g_email"
                  type="email"
                  value={form.guest_email}
                  onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="g_phone">Phone (optional)</Label>
                <Input
                  id="g_phone"
                  value={form.guest_phone}
                  onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Have an account?{" "}
                <Link
                  to="/login"
                  state={{ from: "/cart" }}
                  className="font-medium text-foreground hover:underline"
                >
                  Log in
                </Link>{" "}
                to track your requests.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Event type</Label>
            <Select
              value={form.event_type}
              onValueChange={(v) => setForm({ ...form, event_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event_date">Event date</Label>
            <Input
              id="event_date"
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pickup">Pickup</Label>
              <Input
                id="pickup"
                type="date"
                value={form.pickup_date}
                min={todayISO()}
                onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="return">Return</Label>
              <Input
                id="return"
                type="date"
                value={form.return_date}
                min={form.pickup_date}
                onChange={(e) => setForm({ ...form, return_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget (optional)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="$"
              min="0"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Tell the owner about your event…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Per day</span>
              <span>{currency(perDay)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Rental length</span>
              <span>
                {days} day{days === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Estimated total</span>
              <span>{currency(estimatedTotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimate only — no payment is taken online. Pay the owner at pickup.
            </p>
          </div>

          {mutation.isError && (
            <ErrorState message={(() => {
              const raw = (mutation.error as Error).message;
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed[0]?.msg) return parsed[0].msg;
              } catch {}
              return raw;
            })()} />
          )}

          <Button
            className="w-full"
            onClick={submit}
            disabled={mutation.isPending || (!session && !guestReady)}
          >
            {mutation.isPending ? "Sending…" : "Send Rental Request"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
