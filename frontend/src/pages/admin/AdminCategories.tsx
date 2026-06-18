import { Tag } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardTabs, adminTabs } from "@/components/layout/DashboardTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { uploadImage, validateImage } from "@/lib/storage";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/services";
import type { Category } from "@/types";

const blank = { name: "", description: "", cover_image_url: "" };

export function AdminCategories() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{
    id?: string;
    name: string;
    description: string;
    cover_image_url: string;
  }>(blank);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const save = useMutation({
    mutationFn: () =>
      draft.id ? updateCategory(draft.id, draft) : createCategory(draft),
    onSuccess: () => {
      invalidate();
      setDraft(blank);
      setError("");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
    onError: (e) => setError(e instanceof Error ? e.message : "Could not delete"),
  });

  const handleCover = async (file?: File) => {
    if (!file || !profile) return;
    const invalid = validateImage(file);
    if (invalid) return setError(invalid);
    setUploading(true);
    try {
      const url = await uploadImage(file, profile.id);
      setDraft((d) => ({ ...d, cover_image_url: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const edit = (c: Category) =>
    setDraft({
      id: c.id,
      name: c.name,
      description: c.description,
      cover_image_url: c.cover_image_url ?? "",
    });

  return (
    <div>
      <DashboardTabs title="Admin Dashboard" tabs={adminTabs} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Categories</h2>
            {isLoading ? (
              <PageLoader />
            ) : (
              <Card className="divide-y">
                {data?.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-secondary text-muted-foreground">
                      {c.cover_image_url ? (
                        <img
                          src={c.cover_image_url}
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Tag className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{c.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{c.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => edit(c)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm(`Delete category “${c.name}”?`)) remove.mutate(c.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </Card>
            )}
          </div>

          <Card className="h-fit space-y-4 p-5">
            <h3 className="font-semibold">{draft.id ? "Edit category" : "New category"}</h3>
            {error && <ErrorState message={error} />}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cover image</Label>
              {draft.cover_image_url && (
                <img
                  src={draft.cover_image_url}
                  alt="cover"
                  className="aspect-[3/2] w-full rounded-lg object-cover"
                />
              )}
              <Button asChild variant="outline">
                <label className="cursor-pointer">
                  {uploading ? "Uploading…" : "Upload cover"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleCover(e.target.files?.[0])}
                  />
                </label>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!draft.name || save.isPending}
                onClick={() => save.mutate()}
              >
                {save.isPending ? "Saving…" : draft.id ? "Update" : "Create"}
              </Button>
              {draft.id && (
                <Button variant="outline" onClick={() => setDraft(blank)}>
                  Cancel
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
