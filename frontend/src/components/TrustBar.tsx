import { HandCoins, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const ITEMS = [
  { icon: MapPin, label: "Local pickup & return" },
  { icon: HandCoins, label: "Pay the owner at pickup" },
  { icon: ShieldCheck, label: "No online payment" },
  { icon: Sparkles, label: "Curated, quality listings" },
];

export function TrustBar() {
  return (
    <div className="border-y bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2.5 px-4 py-5 text-center"
          >
            <Icon className="h-4 w-4 shrink-0 text-gold" />
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
