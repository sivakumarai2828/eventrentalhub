import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { DashboardTabs, ownerTabs } from "@/components/layout/DashboardTabs";
import { ImageUploader, type DraftImage } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { MAX_IMAGES, uploadImage, validateImage } from "@/lib/storage";
import {
  addItemImage,
  createItem,
  deleteItemImage,
  getItem,
  listCategories,
  setPrimaryImage,
  updateItem,
  type ItemInput,
} from "@/lib/services";

const empty: ItemInput = {
  category_id: "",
  name: "",
  description: "",
  price_per_day: 0,
  security_deposit: 0,
  quantity_available: 1,
  pickup_city: "",
  pickup_address: "",
  status: "active",
};

export function OwnerItemForm() {
  const { itemId } = useParams();
  const isEdit = !!itemId;
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ItemInput>(empty);
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [error, setError] = useState("");
  const [uploadingMore, setUploadingMore] = useState(false);

  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const existing = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItem(itemId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing.data) {
      const i = existing.data;
      setForm({
        category_id: i.category_id,
        name: i.name,
        description: i.description,
        price_per_day: Number(i.price_per_day),
        security_deposit: Number(i.security_deposit),
        quantity_available: i.quantity_available,
        pickup_city: i.pickup_city,
        pickup_address: i.pickup_address,
        status: i.status,
      });
    }
  }, [existing.data]);

  useEffect(() => {
    if (categories.data && !form.category_id && !isEdit) {
      setForm((f) => ({ ...f, category_id: categories.data[0]?.id ?? "" }));
    }
  }, [categories.data, isEdit, form.category_id]);

  const save = useMutation({
    mutationFn: async () => {
      if (isEdit) return updateItem(itemId!, form);
      return createItem({ ...form, images: draftImages });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate("/owner/inventory");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save"),
  });

  const imageMutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => existing.refetch(),
  });

  const handleAddImages = async (files: FileList | null) => {
    if (!files?.length || !itemId || !profile) return;
    setUploadingMore(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const invalid = validateImage(file);
        if (invalid) {
          setError(invalid);
          continue;
        }
        const url = await uploadImage(file, profile.id);
        await addItemImage(itemId, { image_url: url });
      }
      await existing.refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingMore(false);
    }
  };

  if (isEdit && existing.isLoading) return <PageLoader />;

  const set = <K extends keyof ItemInput>(key: K, value: ItemInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <DashboardTabs title="Owner Dashboard" tabs={ownerTabs} />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-lg font-semibold">
          {isEdit ? "Edit listing" : "Create listing"}
        </h2>

        {error && (
          <div className="mb-4">
            <ErrorState message={error} />
          </div>
        )}

        <Card className="p-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price per day ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price_per_day}
                  onChange={(e) => set("price_per_day", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deposit">Security deposit ($)</Label>
                <Input
                  id="deposit"
                  type="number"
                  step="0.01"
                  value={form.security_deposit}
                  onChange={(e) => set("security_deposit", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qty">Quantity available</Label>
                <Input
                  id="qty"
                  type="number"
                  min={0}
                  value={form.quantity_available}
                  onChange={(e) => set("quantity_available", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v as ItemInput["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Images</Label>
              {!isEdit && profile ? (
                <ImageUploader
                  userId={profile.id}
                  images={draftImages}
                  onChange={setDraftImages}
                />
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {existing.data?.images.map((img) => (
                      <div key={img.id} className="group relative">
                        <img
                          src={img.image_url}
                          alt=""
                          className={`aspect-square w-full rounded-lg object-cover ring-2 ${
                            img.is_primary ? "ring-foreground" : "ring-transparent"
                          }`}
                        />
                        <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                          <button
                            type="button"
                            className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            onClick={() =>
                              imageMutation.mutate(() => setPrimaryImage(itemId!, img.id))
                            }
                          >
                            {img.is_primary ? "Primary" : "Set primary"}
                          </button>
                          <button
                            type="button"
                            className="rounded bg-destructive/80 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            onClick={() =>
                              imageMutation.mutate(() => deleteItemImage(itemId!, img.id))
                            }
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" type="button">
                    <label className="cursor-pointer">
                      {uploadingMore ? "Uploading…" : "+ Add images"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        disabled={
                          uploadingMore ||
                          (existing.data?.images.length ?? 0) >= MAX_IMAGES
                        }
                        onChange={(e) => handleAddImages(e.target.files)}
                      />
                    </label>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create listing"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/owner/inventory")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
