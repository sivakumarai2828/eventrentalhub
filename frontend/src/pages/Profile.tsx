import { useEffect, useState } from "react";

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
import { useAuth } from "@/context/AuthContext";
import { updateMe } from "@/lib/services";
import type { Role } from "@/types";

export function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", role: "customer" as Role });
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone ?? "", role: profile.role });
    }
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setStatus("saving");
    setError("");
    try {
      await updateMe({
        name: form.name,
        phone: form.phone,
        email: profile.email,
        role: form.role,
      });
      await refreshProfile();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setStatus("idle");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card className="mt-6 space-y-4 p-6">
        {error && <ErrorState message={error} />}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={profile?.email ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Account type</Label>
          <Select
            value={form.role}
            onValueChange={(v) => setForm({ ...form, role: v as Role })}
            disabled={profile?.role === "admin"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              {profile?.role === "admin" && <SelectItem value="admin">Admin</SelectItem>}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Switch to “Owner” to list inventory and manage bookings.
          </p>
        </div>
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save changes"}
        </Button>
      </Card>
    </div>
  );
}
