import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { CategoryCard } from "@/components/CategoryCard";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { TrustBar } from "@/components/TrustBar";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/Spinner";
import { listCategories, listItems } from "@/lib/services";

const slide = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=72&auto=format&fit=crop`;

// Background images the hero auto-rotates through (cross-fade).
const HERO_SLIDES = [
  slide("1464366400600-7168b8af9bc3"),
  slide("1519167758481-83f550bb49b3"),
  slide("1469371670807-013ccf25f16a"),
  slide("1519225421980-715cb0215aed"),
  slide("1464047736614-af63643285bf"),
];

const STEPS = [
  { icon: "🔍", title: "Browse & discover", body: "Search local rentals by category and date." },
  { icon: "🛒", title: "Build your request", body: "Add items to your cart and estimate the total cost." },
  { icon: "✅", title: "Get approved", body: "The owner reviews your request and confirms availability." },
  { icon: "🤝", title: "Pay at pickup", body: "No online payment — settle directly with the owner." },
];

export function Home() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const featured = useQuery({
    queryKey: ["items", "featured"],
    queryFn: () => listItems({ page_size: 4, sort: "newest" }),
  });

  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % HERO_SLIDES.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {/* Hero — full-bleed auto-rotating background slider */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          {HERO_SLIDES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`animate-kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:py-36">
          <span className="eyebrow">Luxury Event Rentals</span>
          <h1 className="text-5xl font-semibold leading-[1.05] text-white sm:text-7xl">
            Find Event Rentals <span className="italic text-gold">Near You</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/85">
            Browse backdrops, furniture, drapes, lighting and floral decorations for
            weddings, birthdays and special events.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.data?.map((c) => (
              <Link
                key={c.id}
                to={`/categories/${c.id}`}
                className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                {c.name}
              </Link>
            ))}
          </div>
          {/* Slide indicators */}
          <div className="mt-8 flex justify-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust / value bar */}
      <TrustBar />

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow">What we offer</span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Shop by category</h2>
          </div>
          <Link
            to="/browse"
            className="text-sm font-medium text-foreground underline-offset-4 hover:text-gold-dark hover:underline"
          >
            View all →
          </Link>
        </div>
        {categories.isLoading ? (
          <PageLoader />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {categories.data?.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      {/* Featured rentals */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow">Handpicked</span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Featured rentals</h2>
          </div>
          <Link
            to="/browse"
            className="text-sm font-medium text-foreground underline-offset-4 hover:text-gold-dark hover:underline"
          >
            See more →
          </Link>
        </div>
        {featured.isLoading ? (
          <PageLoader />
        ) : featured.data && featured.data.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.data.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No listings yet — check back soon!</p>
        )}
      </section>

      {/* How it works */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <span className="eyebrow">The process</span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">How it works</h2>
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
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl border bg-card md:grid-cols-2">
          <div className="p-8 sm:p-12">
            <span className="eyebrow">Become a host</span>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Own event decor? Earn from it.
            </h2>
            <p className="mt-3 text-muted-foreground">
              List your backdrops, furniture, drapes, lighting or floral pieces and
              start receiving rental requests from customers near you.
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
    </div>
  );
}
