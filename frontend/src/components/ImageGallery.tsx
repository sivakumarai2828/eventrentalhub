import { useState } from "react";

import { thumbnail } from "../lib/storage";
import type { ItemImage } from "../types";

export function ImageGallery({ images, name }: { images: ItemImage[]; name: string }) {
  const ordered = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
  );
  const [active, setActive] = useState(0);

  if (ordered.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary text-6xl text-muted-foreground">
        🎉
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
        <img
          src={ordered[active].image_url}
          alt={`${name} ${active + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {ordered.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {ordered.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-lg border-2 ${
                i === active ? "border-foreground" : "border-transparent"
              }`}
            >
              <img
                src={thumbnail(img.image_url, 200)}
                alt={`${name} thumbnail ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
