import { Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const slide = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=72&auto=format&fit=crop`;

// Background images the hero auto-rotates through (cross-fade).
const HERO_SLIDES = [
  slide("1464366400600-7168b8af9bc3"),
  slide("1519167758481-83f550bb49b3"),
  slide("1469371670807-013ccf25f16a"),
  slide("1519225421980-715cb0215aed"),
  slide("1464047736614-af63643285bf"),
];

export function Home() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % HERO_SLIDES.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    // Minimal homepage: a single full-bleed immersive hero. Everything else
    // (categories, featured, how-it-works, become-a-host) lives on its own
    // page, reachable from the nav tabs (see Navbar) and footer.
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        {HERO_SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`animate-kenburns absolute inset-0 h-full w-full object-cover object-[center_top] transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Dark gradient — darker top & bottom, brighter middle (Party Loft). */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.58] via-black/[0.22] to-black/[0.55]" />
      </div>

      {/* Centered glass search */}
      <div className="relative flex flex-1 items-center justify-center px-4 pb-10 pt-[72px]">
        <form
          onSubmit={submitSearch}
          className="flex w-full max-w-xl items-center gap-2 rounded-[20px] border border-white/30 bg-white/[0.11] p-[7px] pl-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <Search className="h-5 w-5 shrink-0 text-white/50" />
          <input
            className="flex-1 bg-transparent px-1 py-2 font-mont text-sm tracking-wide text-white outline-none placeholder:text-white/40"
            placeholder="Search lighting, chairs, backdrops…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-[14px] bg-gold-gradient px-7 py-2.5 font-mont text-[13px] font-bold tracking-wide text-champagne-ink transition hover:scale-[1.02] hover:opacity-95"
          >
            Search
          </button>
        </form>
      </div>

      {/* Slide indicators */}
      <div className="relative mb-9 flex justify-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-champagne-dark" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
