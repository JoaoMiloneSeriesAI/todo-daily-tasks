/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
        },
        secondary: {
          pink: '#EC4899',
          cyan: '#06B6D4',
          teal: '#14B8A6',
          green: '#10B981',
          yellow: '#F59E0B',
        },
        background: {
          primary: '#F8F9FB',
          secondary: '#FFFFFF',
          tertiary: '#F3F4F6',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
