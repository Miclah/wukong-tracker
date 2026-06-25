/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas-rgb) / <alpha-value>)',
        'canvas-solid': 'rgb(var(--color-canvas-rgb))',
        'canvas-soft': 'var(--color-canvas-soft)',
        parchment: '#d9c89e',
        'parchment-aged': '#c4b285',
        'parchment-stained': '#ad9c70',
        'parchment-text': 'var(--color-parchment-text)',
        'parchment-text-mute': 'var(--color-parchment-text-mute)',
        ink: '#1f1812',
        'ink-soft': '#3a2e22',
        'ink-mute': '#6b5a44',
        'ink-faded': '#8a7558',
        'ink-bleed': '#6b1f1a',
        primary: '#c4453a',
        'primary-active': '#9e3329',
        'primary-disabled': '#5c3a36',
        jade: '#5a8a6e',
        gold: '#c89b3c',
        'on-vermilion': '#f5e9d4',
        'on-jade': '#f0ead8',
        'surface-dark-card': 'var(--color-surface-dark-card)',
        hairline: '#4a3a2a',
        'hairline-dark': 'var(--color-hairline-dark)',
        // Semantic aliases
        success: '#5a8a6e',
        warning: '#c89b3c',
        error: '#c4453a',
      },

      fontFamily: {
        display: ['Cinzel', '"Cormorant SC"', 'serif'],
        'display-alt': ['"Cormorant SC"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        zh: ['"Noto Serif SC"', 'serif'],
      },

      fontSize: {
        // [size, { lineHeight, letterSpacing }]
        'display-xl':  ['56px', { lineHeight: '1.1',  letterSpacing: '0.5px'  }],
        'display-lg':  ['40px', { lineHeight: '1.15', letterSpacing: '0.5px'  }],
        'display-md':  ['28px', { lineHeight: '1.2',  letterSpacing: '0.3px'  }],
        'display-sm':  ['22px', { lineHeight: '1.25', letterSpacing: '0.3px'  }],
        'title-md':    ['18px', { lineHeight: '1.4',  letterSpacing: '0'      }],
        'title-sm':    ['14px', { lineHeight: '1.4',  letterSpacing: '0'      }],
        'body-md':     ['15px', { lineHeight: '1.6',  letterSpacing: '0'      }],
        'body-sm':     ['13px', { lineHeight: '1.55', letterSpacing: '0'      }],
        'caption':     ['12px', { lineHeight: '1.4',  letterSpacing: '0.3px'  }],
        'caption-uc':  ['11px', { lineHeight: '1.4',  letterSpacing: '1.2px'  }],
        'zh':          ['14px', { lineHeight: '1.4',  letterSpacing: '0'      }],
        'counter-lg':  ['48px', { lineHeight: '1.0',  letterSpacing: '0'      }],
        'counter-md':  ['22px', { lineHeight: '1.0',  letterSpacing: '0'      }],
        'counter-sm':  ['14px', { lineHeight: '1.0',  letterSpacing: '0'      }],
        'btn':         ['14px', { lineHeight: '1.0',  letterSpacing: '0.3px'  }],
      },

      borderRadius: {
        sm:     '4px',
        md:     '8px',
        lg:     '12px',
        scroll: '0px',
        pill:   '9999px',
      },

      spacing: {
        section: '80px',
      },

      boxShadow: {
        'card-lift': '0 2px 8px rgba(107, 31, 26, 0.25)',
      },

      keyframes: {
        'achievement-in': {
          '0%':   { opacity: '0', transform: 'translateX(-50%) translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)'    },
        },
        'stamp-in': {
          '0%':   { transform: 'scale(1.4) rotate(-3deg)', opacity: '0' },
          '60%':  { transform: 'scale(0.92) rotate(-3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-3deg)',    opacity: '1' },
        },
      },

      animation: {
        'achievement-in': 'achievement-in 0.3s ease-out both',
        'stamp-in':       'stamp-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
}
