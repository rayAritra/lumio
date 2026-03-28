/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#6d28d9',
        },
        surface: {
          DEFAULT: '#0d0d0f',
          raised: '#111114',
          overlay: '#16161a',
          border: '#232328',
        },
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.08) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(263, 98%, 68%, 0.08) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(197, 98%, 61%, 0.08) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.08) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-accent': '0 0 30px rgba(99,102,241,0.25)',
        'glow-sm': '0 0 10px rgba(99,102,241,0.15)',
        'inner-glow': 'inset 0 0 20px rgba(99,102,241,0.05)',
      },
    },
  },
  plugins: [],
};
