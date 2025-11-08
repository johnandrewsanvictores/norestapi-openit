// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgCard: "3A3A3A",
        bgBody: "0C162B",
        bgOrange: "F93800",
        light_blue_text_header: "F93800",
        light_blue_body_text: "74A2CD",
        bgBlack: "090A13",
      },
      fontSize: {
        h1: "3.815rem",
        h2: "3.052rem",
        h3: "2.441rem",
        h4: "1.953rem",
        h5: "1.563rem",
        h6: "1.25rem",
        p: "1rem",
        small: "0.8rem",
      },
      fontFamily: {inter: ["'Inter', sans-serif"]},
    },
  },
};
