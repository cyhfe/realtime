/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      animation: {
        slideUp: "slideUp 300ms ease-out",
        slideDown: "slideDown 300ms ease-out",
      },
      keyframes: {
        slideDown: {
          from: {
            height: 0,
          },
          to: {
            height: "var(--radix-collapsible-content-height)",
          },
        },
        slideUp: {
          from: {
            height: "var(--radix-collapsible-content-height)",
          },
          to: {
            height: 0,
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
