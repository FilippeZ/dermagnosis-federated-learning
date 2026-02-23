/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#06f9f9",
                "primary-glow": "rgba(6, 249, 249, 0.4)",
                "background-dark": "#0f2323",
                "panel-dark": "#121d1d",
                "border-dark": "#1f2e2e",
            },
            fontFamily: {
                display: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
