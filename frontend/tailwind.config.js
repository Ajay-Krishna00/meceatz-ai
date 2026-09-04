/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18181b",
        "ink-soft": "#3f3f46",
        paper: "#fffdf7",
        "paper-2": "#fff8e7",
        "paper-3": "#fef0d2",
        "pop-yellow": "#ffd43b",
        "pop-teal": "#20c997",
        "pop-teal-deep": "#0ca678",
        "pop-red": "#ff6b6b",
        "pop-purple": "#845ef7",
        "pop-blue": "#339af0",
        "pop-orange": "#ff922b",
      },
      fontFamily: {
        display: ["'Baloo 2'", "'Nunito'", "cursive", "sans-serif"],
        body: ["'Nunito'", "-apple-system", "sans-serif"],
        mono: ["'Space Grotesk'", "monospace"],
      },
      boxShadow: {
        comic: "3px 3px 0px #18181b",
        "comic-lg": "5px 5px 0px #18181b",
        "comic-sm": "2px 2px 0px #18181b",
      },
      borderWidth: {
        3: "3px",
      }
    },
  },
  plugins: [],
};
