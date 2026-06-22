import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { CategoryCard } from "@/components/CategoryCard";
import { ItemCard } from "@/components/ItemCard";
import { PageLoader } from "@/components/ui/Spinner";
import { listCategories, listItems } from "@/lib/services";

export function Categories() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const featured = useQuery({
    queryKey: ["items", "featured"],
    queryFn: () => listItems({ page_size: 8, sort: "newest" }),
  });

  return (
    <div>
      {/* Shop by category */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow">What we offer</span>
            <h1 className="text-3xl font-semibold sm:text-4xl">Shop by category</h1>
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
    </div>
  );
}
