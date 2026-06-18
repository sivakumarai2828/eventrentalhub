import { PartyPopper, Tag } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { GoogleButton } from "@/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

export function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer" as Role,
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        role: form.role,
      });
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      if (message.toLowerCase().includes("confirm")) {
        setInfo("Check your email to confirm your account, then log in.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: Role; label: string; icon: typeof PartyPopper }[] = [
    { value: "customer", label: "I want to rent", icon: PartyPopper },
    { value: "owner", label: "I want to list", icon: Tag },
  ];

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground">Rent decorations or list your own inventory</p>
      </div>
      <Card className="space-y-4 p-6">
        <GoogleButton label="Sign up with Google" />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorState message={error} />}
          {info && (
            <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
              {info}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-semibold transition",
                  form.role === r.value
                    ? "border-foreground bg-secondary"
                    : "text-muted-foreground hover:border-foreground/40",
                )}
              >
                <r.icon className="h-5 w-5" />
                {r.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : "Create account"}
          </Button>
        </form>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-foreground hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
