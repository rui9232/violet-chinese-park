/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        sun: "#ffb703",
        sky: "#4cc9f0",
        grass: "#8ac926",
        berry: "#ff6b6b",
        grape: "#7b2cbf",
        ink: "#24305e",
        cream: "#fff8e7",
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"Microsoft JhengHei"', "sans-serif"],
        display: ['"ZCOOL KuaiLe"', '"Noto Sans TC"', "sans-serif"],
      },
      boxShadow: {
        chunky: "0 8px 0 rgba(36, 48, 94, 0.18)",
        pop: "0 6px 0 #e09f00",
      },
    },
  },
  plugins: [],
};
