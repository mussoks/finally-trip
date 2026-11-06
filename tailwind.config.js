/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        card: 'var(--card)',
        ink: 'var(--text)',
        soft: 'var(--text-soft)',
        line: 'var(--line)',
        rule: 'var(--rule)',
        onpop: 'var(--on-pop)',
        tomato: 'var(--tomato)',
        mango: 'var(--mango)',
        mint: 'var(--mint)',
        sky: 'var(--sky)',
        grape: 'var(--grape)',
        bubble: 'var(--bubble)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
    },
  },
  plugins: [],
};
