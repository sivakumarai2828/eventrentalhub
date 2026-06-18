import { Upload } from "lucide-react";
import { useState, type DragEvent } from "react";

import { MAX_IMAGES, uploadImage, validateImage } from "@/lib/storage";
import { Spinner } from "@/components/ui/Spinner";

export interface DraftImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export function ImageUploader({
  userId,
  images,
  onChange,
}: {
  userId: string;
  images: DraftImage[];
  onChange: (images: DraftImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");

    const room = MAX_IMAGES - images.length;
    const selected = Array.from(files).slice(0, room);
    if (selected.length < files.length) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
    }

    setUploading(true);
    try {
      const uploaded: DraftImage[] = [];
      for (const file of selected) {
        const invalid = validateImage(file);
        if (invalid) {
          setError(invalid);
          continue;
        }
        const url = await uploadImage(file, userId);
        uploaded.push({ image_url: url, is_primary: false, display_order: 0 });
      }
      const next = [...images, ...uploaded].map((img, i) => ({
        ...img,
        display_order: i,
        is_primary: images.length === 0 && i === 0 ? true : img.is_primary,
      }));
      if (!next.some((i) => i.is_primary) && next.length) next[0].is_primary = true;
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const setPrimary = (idx: number) =>
    onChange(images.map((img, i) => ({ ...img, is_primary: i === idx })));

  const remove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    if (!next.some((i) => i.is_primary) && next.length) next[0].is_primary = true;
    onChange(next.map((img, i) => ({ ...img, display_order: i })));
  };

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver ? "border-foreground bg-secondary" : "border-input bg-card"
        }`}
      >
        {uploading ? (
          <Spinner className="h-6 w-6 text-foreground" />
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              Drag & drop images here, or click to browse
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG or WEBP · up to {MAX_IMAGES} images
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, idx) => (
            <div key={img.image_url} className="group relative">
              <img
                src={img.image_url}
                alt={`upload ${idx + 1}`}
                className={`aspect-square w-full rounded-lg object-cover ring-2 ${
                  img.is_primary ? "ring-foreground" : "ring-transparent"
                }`}
              />
              <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setPrimary(idx)}
                  className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                >
                  {img.is_primary ? "Primary" : "Set primary"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded bg-red-600/80 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
