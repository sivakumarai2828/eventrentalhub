import { PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";

import type { Category } from "@/types";

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=70&auto=format&fit=crop`;

// Cover photos chosen to differ from the item images shown inside each category.
export const categoryImages: Record<string, string> = {
  Backdrops: U("1530103862676-de8c9debad1d"),
  Furniture: U("1556228453-efd6c1ff04f6"),
  Drapes: U("1523438885200-e635ba2c371e"),
  Lighting: U("1464366400600-7168b8af9bc3"),
  Floral: U("1513161455079-7dc1de15ef3e"),
};

export function CategoryCard({ category }: { category: Category }) {
  const src = category.cover_image_url ?? categoryImages[category.name];
  const count = category.item_count ?? 0;
  return (
    <Link
      to={`/categories/${category.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg"
    >
      {src ? (
        <img
          src={src}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover brightness-[0.78] transition duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.62]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
          <PartyPopper className="h-8 w-8" />
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 to-transparent p-5">
        <h3 className="font-serif text-2xl font-semibold leading-none text-white">
          {category.name}
        </h3>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-gold">
          {count} item{count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
