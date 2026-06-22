import { Link } from "react-router-dom";

import { TrustBar } from "@/components/TrustBar";
import { Button } from "@/components/ui/button";

const STEPS = [
  { icon: "🔍", title: "Browse & discover", body: "Search local rentals by category and date." },
  { icon: "🛒", title: "Build your request", body: "Add items to your cart and estimate the total cost." },
  { icon: "✅", title: "Get approved", body: "The owner reviews your request and confirms availability." },
  { icon: "🤝", title: "Pay at pickup", body: "No online payment — settle directly with the owner." },
];

export function HowItWorks() {
  return (
    <div>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <span className="eyebrow">The process</span>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">How it works</h1>
            <p className="mx-auto mt-3 max-w-xl text-white/60">
              Rent in four simple steps — no online payment, pay the owner at pickup.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-white/70">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild>
              <Link to="/browse">Start browsing →</Link>
            </Button>
          </div>
        </div>
      </section>

      <TrustBar />
    </div>
  );
}
