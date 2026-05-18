import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: {
          DEFAULT: '#fef9ef',
          dim: '#dedad0',
          bright: '#fef9ef',
          'container-low': '#f8f3e9',
          container: '#f2ede3',
          'container-high': '#ece8de',
          'container-highest': '#e7e2d8',
          tint: '#a73837',
          variant: '#e7e2d8',
        },
        'on-surface': '#1d1c16',
        'on-surface-variant': '#574140',
        'inverse-surface': '#32302a',
        'inverse-on-surface': '#f5f0e6',
        outline: {
          DEFAULT: '#8a716f',
          variant: '#dec0bd',
        },
        // Primary
        primary: {
          DEFAULT: '#721016',
          container: '#4f0007',
          fixed: '#ffdad7',
          'fixed-dim': '#ffb3af',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#fe7975',
        'on-primary-fixed': '#410005',
        'on-primary-fixed-variant': '#862022',
        'inverse-primary': '#ffb3af',
        // Secondary
        secondary: {
          DEFAULT: '#D95D2B',
          container: '#ff7945',
          fixed: '#ffdbcf',
          'fixed-dim': '#ffb59b',
        },
        'on-secondary': '#ffffff',
        'on-secondary-container': '#671f00',
        'on-secondary-fixed': '#380d00',
        'on-secondary-fixed-variant': '#812900',
        // Tertiary
        tertiary: {
          DEFAULT: '#4A3728',
          container: '#483526',
          fixed: '#fbddc7',
          'fixed-dim': '#dec1ac',
        },
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#b89d8a',
        'on-tertiary-fixed': '#28180b',
        'on-tertiary-fixed-variant': '#574333',
        // Error
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        // Background
        background: '#fef9ef',
        'on-background': '#1d1c16',
      },
      fontFamily: {
        headline: ['"Noto Serif"', 'serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
        label: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label-sm': ['0.875rem', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        unit: '8px',
        gutter: '24px',
        margin: '32px',
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(74, 55, 40, 0.08)',
        'card-hover': '0 4px 24px rgba(114, 16, 22, 0.12)',
        inner: 'inset 0 2px 4px rgba(74, 55, 40, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
