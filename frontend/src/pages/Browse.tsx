import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";

import { categoryImages } from "@/components/CategoryCard";
import { ItemCard } from "@/components/ItemCard";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/Spinner";
import { listCategories, listItems } from "@/lib/services";
import type { ItemFilters } from "@/types";

export function Browse() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const filters = useMemo<ItemFilters>(
    () => ({
      q: searchParams.get("q") ?? undefined,
      category_id: categoryId ?? searchParams.get("category_id") ?? undefined,
      min_price: searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : undefined,
      max_price: searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : undefined,
      available_from: searchParams.get("available_from") ?? undefined,
      available_to: searchParams.get("available_to") ?? undefined,
      sort: (searchParams.get("sort") as ItemFilters["sort"]) ?? "newest",
      page,
      page_size: 12,
    }),
    [searchParams, categoryId, page],
  );

  const items = useQuery({
    queryKey: ["items", filters],
    queryFn: () => listItems(filters),
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(1);
  };

  const activeCategory = categories.data?.find((c) => c.id === filters.category_id);

  const bannerImage = activeCategory
    ? activeCategory.cover_image_url ?? categoryImages[activeCategory.name]
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {activeCategory ? (
        <div className="relative overflow-hidden rounded-2xl">
          {bannerImage && (
            <img
              src={bannerImage}
              alt={activeCategory.name}
              className="h-44 w-full object-cover sm:h-56"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
          <div className="absolute bottom-0 p-6 text-white">
            <h1 className="text-3xl font-bold text-white">{activeCategory.name}</h1>
            {activeCategory.description && (
              <p className="mt-1 max-w-2xl text-sm text-white/85">
                {activeCategory.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <h1 className="text-2xl font-bold">Browse rentals</h1>
      )}

      {/* Top filter bar */}
      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label>Search</Label>
            <Input
              defaultValue={filters.q ?? ""}
              placeholder="Search by keyword…"
              onBlur={(e) => setParam("q", e.target.value)}
            />
          </div>
          {!categoryId && (
            <div className="space-y-1.5 md:w-44">
              <Label>Category</Label>
              <Select
                value={filters.category_id ?? "all"}
                onValueChange={(v) => setParam("category_id", v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Min $</Label>
            <Input
              type="number"
              className="w-24"
              defaultValue={filters.min_price ?? ""}
              onBlur={(e) => setParam("min_price", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max $</Label>
            <Input
              type="number"
              className="w-24"
              defaultValue={filters.max_price ?? ""}
              onBlur={(e) => setParam("max_price", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Available from</Label>
            <Input
              type="date"
              className="w-40"
              defaultValue={filters.available_from ?? ""}
              onChange={(e) => setParam("available_from", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Available to</Label>
            <Input
              type="date"
              className="w-40"
              defaultValue={filters.available_to ?? ""}
              onChange={(e) => setParam("available_to", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:w-48">
            <Label>Sort</Label>
            <Select value={filters.sort} onValueChange={(v) => setParam("sort", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="mt-6">
        {items.isLoading ? (
          <PageLoader />
        ) : items.isError ? (
          <ErrorState message={(items.error as Error).message} />
        ) : items.data && items.data.items.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {items.data.total} result{items.data.total === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.data.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            <Pagination
              page={items.data.page}
              pages={items.data.pages}
              onChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            title="No rentals found"
            description="Try adjusting your filters or browsing a different category."
          />
        )}
      </div>
    </div>
  );
}
