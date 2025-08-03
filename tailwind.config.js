module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#eab308", // wheat/gold
          50: "#fdf6e3",
          100: "#f7ecd0",
          200: "#f3e1b7",
          300: "#eed69e",
          400: "#e9cb85",
          500: "#eab308", // main
          600: "#c89a06",
          700: "#a78205",
          800: "#866a04",
          900: "#665302",
        },
        wheat: "#f5deb3",
      },
    },
  },
  plugins: [],
};
