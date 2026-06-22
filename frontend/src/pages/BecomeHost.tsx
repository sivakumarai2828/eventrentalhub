import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function BecomeHost() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl border bg-card md:grid-cols-2">
        <div className="p-8 sm:p-12">
          <span className="eyebrow">Become a host</span>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Own event decor? Earn from it.
          </h1>
          <p className="mt-3 text-muted-foreground">
            List your backdrops, furniture, drapes, lighting or floral pieces and
            start receiving rental requests from customers near you. No online
            payment — your customers pay you directly at pickup.
          </p>
          <Button asChild className="mt-6">
            <Link to="/register">List your decor →</Link>
          </Button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=70&auto=format&fit=crop"
          alt="Decorated event space"
          className="h-64 w-full object-cover md:h-full"
        />
      </div>
    </section>
  );
}
