import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // shadcn semantic tokens (mapped to the monochrome theme in index.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Warm luxury accent.
        gold: {
          DEFAULT: "#C9A96E",
          dark: "#A8884F",
        },
        // Champagne-gold (Party Loft hero accent).
        champagne: {
          light: "#f5e6b2",
          DEFAULT: "#e8c96e",
          dark: "#d4a840",
          ink: "#3a2800",
        },
        // Legacy tokens kept so not-yet-migrated components keep compiling.
        brand: {
          50: "#F7F3EC",
          100: "#EFE8DC",
          200: "#E2D8C6",
          400: "#6B6059",
          500: "#2C2420",
          600: "#221B18",
          700: "#181210",
        },
        ink: { 900: "#2C2420", 700: "#3D3530", 500: "#6B6059" },
        cream: "#FAF8F4",
        sand: "#E8E0D4",
        line: "#E8E0D4",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        playfair: ["'Playfair Display'", "Georgia", "serif"],
        mont: ["Montserrat", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f5e6b2, #d4a840)",
        "gold-shimmer": "linear-gradient(135deg, #f5e6b2, #d4a840, #f5e6b2)",
      },
      boxShadow: {
        premium:
          "0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        "premium-hover":
          "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 8px 12px -6px rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2.5s ease infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
