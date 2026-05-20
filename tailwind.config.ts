import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './docs-content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system tokens
        'wb-blue': '#0055AA',
        'wb-orange': '#FF8800',
        'wb-dimblue': '#003388',
        surface: '#fafafa',
        border: {
          DEFAULT: '#e8e8e8',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', ...fontFamily.sans],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
        vt323: ['"VT323"', 'monospace'],
      },
      borderRadius: {
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        card: '3px 3px 0 0 #000',
        'card-hover': '4px 4px 0 0 #000',
      },
      fontSize: {
        '2xs': ['9px', { lineHeight: '1.2', letterSpacing: '0.06em' }],
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['12px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}

export default config
