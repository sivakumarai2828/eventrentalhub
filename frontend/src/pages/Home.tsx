import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

// Hero slides. Each has a warm-dark gradient base so the slider looks complete
// even before the photos are added; the <img> (dropped into public/hero/) layers
// on top and gracefully hides itself if the file isn't there yet.
const SLIDES: { src: string; grad: string }[] = [
  { src: "/hero/slide-1.jpg", grad: "linear-gradient(135deg,#2a2018,#4a3620)" },
  { src: "/hero/slide-2.jpg", grad: "linear-gradient(135deg,#1d241e,#2d3328)" },
  { src: "/hero/slide-3.jpg", grad: "linear-gradient(135deg,#2e2416,#5a4222)" },
  { src: "/hero/slide-4.jpg", grad: "linear-gradient(135deg,#13110f,#2a2014)" },
  { src: "/hero/slide-5.jpg", grad: "linear-gradient(135deg,#3a1530,#6a3018)" },
];

export function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    // Dark, immersive single-screen hero (renderevents style): full-bleed
    // rotating photo slider + gradient scrim + bold headline + glass search.
    // The navbar floats over the top in its white-on-dark theme (see Navbar).
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#fbf6ee]">
      <div className="absolute inset-0" aria-hidden>
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            style={{ background: s.grad }}
          >
            <img
              src={s.src}
              alt=""
              className="animate-kenburns h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ))}
        {/* Keep the photos vivid — only a faint top/bottom fade (for the nav +
            dots) plus a focused glow behind the brand & search for legibility. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,251,244,0.18) 0%, transparent 26%, transparent 72%, rgba(255,249,240,0.26) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 48% 38% at 50% 47%, rgba(255,252,247,0.62), transparent 66%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 pt-[72px] text-center">
        {/* Brand */}
        <h1
          className="animate-fade-in font-playfair text-4xl font-bold leading-none text-[#3a2800] sm:text-6xl"
          style={{ textShadow: "0 2px 24px rgba(255,250,242,0.7)" }}
        >
          <span className="italic">Party</span>{" "}
          <span className="text-champagne-dark">Loft</span>
        </h1>
        <p className="animate-fade-in mt-4 font-mont text-[11px] font-semibold uppercase tracking-[0.4em] text-[#7a6038]">
          Rentals for unforgettable events
        </p>

        <form
          onSubmit={submitSearch}
          className="animate-fade-in mt-9 flex w-full max-w-xl items-center gap-2 rounded-[20px] border border-white/80 bg-white/75 p-[7px] pl-5 shadow-[0_20px_60px_rgba(120,80,20,0.18)] backdrop-blur-md transition-colors duration-300 focus-within:border-champagne-dark/40 focus-within:bg-white/90"
        >
          <Search className="h-5 w-5 shrink-0 text-[#c19a4a]" />
          <input
            className="flex-1 bg-transparent px-1 py-2 font-mont text-sm tracking-wide text-[#3a2800] outline-none placeholder:text-[#a3936f]"
            placeholder="Search lighting, chairs, backdrops…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="whitespace-nowrap rounded-[14px] bg-gold-gradient px-7 py-2.5 font-mont text-[13px] font-bold tracking-wide text-champagne-ink hover:opacity-95"
          >
            Search
          </motion.button>
        </form>
      </div>

      {/* Slide indicators */}
      <div className="relative mb-9 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-champagne-dark" : "w-1.5 bg-[#3a2800]/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
