import { type Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)'],
        inter: ['var(--font-inter)'],

      },
      fontWeight: {
        '700': '700',
      },
      fontSize: {
        '14': '14px',
      },
      padding: {
        '32': '32px',
        '12': '12px',
        '16': '16px',
        'custom': '12px 12px 12px 16px',
      },

    },
    colors: {
      'white': '#ffffff',
      'gray-50': '#f8fafc',
      'gray-100': '#f1f5f9',
      'gray-200': '#e2e8f0',
      'gray-300': '#cbd5e1',
      'gray-400': '#94a3b8',
      'gray-500': '#64748b',
      'gray-600': '#475569',
      'gray-700': '#334155',
      'gray-800': '#1e293b',
      'gray-900': '#0f172a',
      'gray-950': '#020617',
      'darker': '#f1f5f9',
    },
    borderRadius: {
      6: '6px',
      12: '12px',
      full: '9999px',
    },

  },
  plugins: [],
} satisfies Config
