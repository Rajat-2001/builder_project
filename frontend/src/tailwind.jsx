/** @type {import('tailwindcss').Config} */
export default {
  // Only generate CSS for classes actually used in your files
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your brand colors — use as bg-navy, text-amber etc.
        navy:  "#0F172A",
        slate: {
          card: "#1E293B",
        },
      },
      borderRadius: {
        xl:  "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};