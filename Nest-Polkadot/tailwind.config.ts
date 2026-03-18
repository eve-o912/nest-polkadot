import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Polkadot brand colors
        'polkadot': {
          'primary': '#E6007A',
          'hover': '#FF1A8C', 
          'dark': '#B3005F',
          'glow': 'rgba(230, 0, 122, 0.15)',
          'subtle': 'rgba(230, 0, 122, 0.08)',
        },
        // Surface colors
        'surface': {
          'primary': '#0A0A0A',
          'secondary': '#111111',
          'tertiary': '#1A1A1A',
        },
        // Border colors
        'border': {
          'default': 'rgba(255, 255, 255, 0.08)',
          'hover': 'rgba(230, 0, 122, 0.3)',
        },
        // Text colors
        'text': {
          'primary': '#FFFFFF',
          'secondary': '#999999',
          'muted': '#555555',
        },
        // Status colors
        'success': '#00D395',
        'warning': '#F5A623',
        'error': '#FF4D4D',
      },
      fontFamily: {
        'sans': ['Inter', 'SF Pro Display', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'glassmorphism': 'rgba(255,255,255,0.03)',
      },
      boxShadow: {
        'polkadot-glow': '0 0 24px rgba(230,0,122,0.2)',
        'polkadot-glow-hover': '0 0 32px rgba(230,0,122,0.3)',
      },
      animation: {
        'polkadot-spin': 'spin 8s linear infinite',
        'pulse-polkadot': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
