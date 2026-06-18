import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-full items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm"
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
      <input
        className="flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
        placeholder="Search backdrops, lighting, furniture…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Button type="submit" className="gap-2 sm:px-6">
        Search
      </Button>
    </form>
  );
}
