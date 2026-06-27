import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { GoogleButton } from "@/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#fbf6ee]">
      {/* Left panel — decorative photo */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src="/hero/slide-4.jpg"
          alt="Party Loft décor"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a2800]/60 via-[#3a2800]/30 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <div className="font-playfair text-4xl font-bold text-white">
            <span className="italic">Party</span>{" "}
            <span className="text-[#f5e6b2]">Loft</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Curated event décor for life's most beautiful moments.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="font-playfair text-3xl font-bold">
              <span className="italic text-[#3a2800]">Party</span>{" "}
              <span className="text-champagne-dark">Loft</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#3a2800]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#6a5a36]">Log in to your Party Loft account</p>

          <div className="mt-8 space-y-4 rounded-2xl border border-[#e8d9b5] bg-white/80 p-6 shadow-[0_8px_40px_rgba(120,80,20,0.10)] backdrop-blur-sm">
            <GoogleButton label="Log in with Google" />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e8d9b5]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#a08860]">or</span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && <ErrorState message={error} />}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#3a2800]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#e8d9b5] focus-visible:ring-champagne-dark/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#3a2800]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-[#e8d9b5] focus-visible:ring-champagne-dark/40"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gold-gradient font-mont text-xs font-bold uppercase tracking-widest text-champagne-ink hover:opacity-90"
                disabled={loading}
              >
                {loading ? <Spinner /> : "Log in"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-[#6a5a36]">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-[#3a2800] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
