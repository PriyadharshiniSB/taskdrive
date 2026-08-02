/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF3F7',
          100: '#D7E3EC',
          200: '#AFC7DA',
          300: '#83A8C4',
          400: '#4F7FA0',
          500: '#2C5F82',
          600: '#1E3E5C',
          700: '#16324F',
          800: '#0F2438',
          900: '#091925',
        },
        accent: {
          50: '#FDF4ED',
          100: '#FAE3D0',
          200: '#F3C29C',
          300: '#EBA06A',
          400: '#D98247',
          500: '#C2703D',
          600: '#A85A2D',
          700: '#8A4823',
          800: '#6B3719',
          900: '#4D2712',
        },
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#18181B',
        },
        surfaceMuted: {
          light: '#FAFAF9',
          dark: '#27272A',
        },
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(28, 25, 23, 0.04), 0 1px 3px 0 rgba(28, 25, 23, 0.06)',
        card: '0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 4px 12px -2px rgba(28, 25, 23, 0.06)',
        cardHover: '0 4px 10px -2px rgba(79, 70, 229, 0.12), 0 8px 24px -4px rgba(28, 25, 23, 0.10)',
        modal: '0 20px 50px -12px rgba(28, 25, 23, 0.25)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
        scaleIn: 'scaleIn 0.18s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}