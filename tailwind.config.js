/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF7',
          100: '#FFF8E8',
          200: '#F8F0DC',
          300: '#F2E8D0',
          400: '#EAE0C9',
          500: '#E0D6BB',
        },
        ink: {
          light: 'rgba(0, 0, 0, 0.6)',
          default: 'rgba(0, 0, 0, 0.8)',
          dark: 'rgba(0, 0, 0, 0.9)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'ink-spread': 'inkSpread 600ms cubic-bezier(0.19, 1, 0.22, 1) forwards',
      },
      keyframes: {
        inkSpread: {
          '0%': { transform: 'scale(0)', opacity: 0.4 },
          '100%': { transform: 'scale(5)', opacity: 0 },
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'rgba(0, 0, 0, 0.8)',
            a: {
              color: 'rgba(0, 0, 0, 0.9)',
              '&:hover': {
                color: 'rgba(0, 0, 0, 1)',
              },
            },
            h1: {
              color: 'rgba(0, 0, 0, 0.9)',
            },
            h2: {
              color: 'rgba(0, 0, 0, 0.9)',
            },
            h3: {
              color: 'rgba(0, 0, 0, 0.9)',
            },
            h4: {
              color: 'rgba(0, 0, 0, 0.9)',
            },
            blockquote: {
              color: 'rgba(0, 0, 0, 0.7)',
            },
            code: {
              color: 'rgba(0, 0, 0, 0.8)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
