import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listCategories } from "@/lib/services";

const EMPTY = { name: "", email: "", phone: "", eventDate: "", details: "" };

// Used for the category chips if the live categories haven't loaded.
const FALLBACK_CATEGORIES = ["Backdrops", "Furniture", "Drapes", "Lighting", "Floral"];

/**
 * "Get a Quote" lead-capture modal. The trigger (a styled button/link) is
 * passed in so it can match its surroundings (e.g. the gold hero CTA).
 *
 * NOTE: submission is currently client-side only — it shows a confirmation but
 * does not yet POST anywhere. Wire to a backend lead/email endpoint before this
 * goes live (see eventrenthub-next-steps).
 */
export function QuoteDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [picked, setPicked] = useState<string[]>([]);

  // Only fetch categories once the modal is actually opened.
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    enabled: open,
  });
  const chips =
    categories.data && categories.data.length > 0
      ? categories.data.map((c) => c.name)
      : FALLBACK_CATEGORIES;

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggle = (name: string) =>
    setPicked((p) =>
      p.includes(name) ? p.filter((x) => x !== name) : [...p, name],
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  // Reset back to the empty form whenever the dialog fully closes.
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSent(false);
      setForm(EMPTY);
      setPicked([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-gold" />
            <h2 className="mt-4 font-serif text-2xl font-semibold">Request received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}! We&apos;ll get
              back to you shortly with availability and a quote.
            </p>
            <DialogClose asChild>
              <Button className="mt-6">Done</Button>
            </DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Get a quote</DialogTitle>
              <DialogDescription>
                Tell us about your event and what you need — we&apos;ll reply with
                availability and pricing. No payment online.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="q-name">Name</Label>
                <Input
                  id="q-name"
                  required
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="q-email">Email</Label>
                  <Input
                    id="q-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    placeholder="jane@email.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-phone">Phone (optional)</Label>
                  <Input
                    id="q-phone"
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q-date">Event date (optional)</Label>
                <Input
                  id="q-date"
                  type="date"
                  value={form.eventDate}
                  onChange={set("eventDate")}
                />
              </div>

              <div className="space-y-2">
                <Label>What do you need?</Label>
                <div className="flex flex-wrap gap-2">
                  {chips.map((name) => {
                    const on = picked.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(name)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                          on
                            ? "border-transparent bg-gold-gradient text-champagne-ink"
                            : "border-input text-foreground hover:bg-secondary"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q-details">Anything else?</Label>
                <Textarea
                  id="q-details"
                  rows={3}
                  value={form.details}
                  onChange={set("details")}
                  placeholder="e.g. backdrop + 50 gold chiavari chairs for a wedding in Austin"
                />
              </div>

              <Button type="submit" className="w-full">
                Send request
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
