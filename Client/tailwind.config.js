// tailwind.config.js
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Confi  g} */

module.exports = {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
        "myColor": {
          "50": "#e8ffed",
          "100": "#d0ffdb",
          "200": "#a1ffb7",
          "300": "#72ff93",
          "400": "#43ff6f",
          "500": "#14ff4b",
          "600": "#10cc3c",
          "700": "#0c992d",
          "800": "#08661e",
          "900": "#04330f"
        },
        "myRojo": {
          "50": "#ffe8ee",
          "100": "#ffd0dc",
          "200": "#ffa1ba",
          "300": "#ff7297",
          "400": "#ff4375",
          "500": "#ff1452",
          "600": "#cc1042",
          "700": "#990c31",
          "800": "#660821",
          "900": "#330410"
        },
        "myAzul": {
          "50": "#ede8ff",
          "100": "#dbd0ff",
          "200": "#b7a1ff",
          "300": "#9372ff",
          "400": "#6f43ff",
          "500": "#4b14ff",
          "600": "#3c10cc",
          "700": "#2d0c99",
          "800": "#1e0866",
          "900": "#0f0433"
        }
      }


    },
  },
  darkMode: "class",
  plugins: [nextui(),  require('@tailwindcss/line-clamp')]
}
