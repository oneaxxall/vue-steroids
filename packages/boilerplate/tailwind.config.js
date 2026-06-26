/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./*.html",
    "./apps/**/*.tpl",
    "./components/**/*.tpl"
  ],
  safelist: [
    {
      pattern: /^(bg|text|border)-(primary|secondary|accent|success|warning|error|info|neutral|slate|gray|zinc|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        sky: colors.sky,
        stone: colors.stone,
        neutral: colors.neutral,
        gray: colors.gray,
        slate: colors.slate,

        // Primary Soft Blue
        primary: {
          50:  '#eff8ff',
          100: '#dbeffe',
          200: '#bce3fe',
          300: '#8dd2fd',
          400: '#59b8f9',
          500: '#3b96f5',
          600: '#2774ea',
          700: '#1e5dd9',
          800: '#204eb1',
          900: '#22458c',
          950: '#1b2d56',
        },
        // Secondary Soft Blue (Lighter)
        secondary: {
          50:  '#f0f7ff',
          100: '#e0edfe',
          200: '#b9ddfe',
          300: '#7cc6fc',
          400: '#39aaf8',
          500: '#168ee9',
          600: '#0972d1',
          700: '#0a5baa',
          800: '#0f4c8b',
          900: '#134173',
          950: '#0d2a4b',
        },
        // Accent Soft Indigo
        accent: {
          50:  '#f1f2ff',
          100: '#e5e7ff',
          200: '#cdd0fe',
          300: '#a8aefd',
          400: '#7e83f8',
          500: '#6060f1',
          600: '#4a45e0',
          700: '#3d37c8',
          800: '#3531a4',
          900: '#302f85',
          950: '#1c1b52',
        },
        // Success Soft Green
        success: {
          50:  '#f0fdf6',
          100: '#dcfce9',
          200: '#bdf8d5',
          300: '#88efb3',
          400: '#4ddf87',
          500: '#23c864',
          600: '#14a44c',
          700: '#138240',
          800: '#156736',
          900: '#13552e',
          950: '#073019',
        },
        // Warning Soft Orange
        warning: {
          50:  '#fff8f0',
          100: '#ffedd8',
          200: '#ffd8af',
          300: '#ffba7b',
          400: '#ff8e3f',
          500: '#ff721a',
          600: '#ed5008',
          700: '#c5390a',
          800: '#9d2e11',
          900: '#7f2811',
          950: '#451104',
        },
        // Error Soft Red
        error: {
          50:  '#fef2f2',
          100: '#fee3e3',
          200: '#fecdcd',
          300: '#fdabab',
          400: '#fb7676',
          500: '#f54747',
          600: '#e02828',
          700: '#bb2020',
          800: '#9d2121',
          900: '#842121',
          950: '#490c0c',
        },
        // Info Soft Cyan
        info: {
          50:  '#ecfeff',
          100: '#cff8fe',
          200: '#a4effc',
          300: '#69e4f8',
          400: '#22d1ee',
          500: '#07b5d9',
          600: '#0794b6',
          700: '#0a7795',
          800: '#10617b',
          900: '#135267',
          950: '#073547',
        },
        // Neutral Soft Gray (Blue-tinted)
        neutral: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#060b14',
        },
      },
      // Soft Blue Gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b96f5 0%, #2774ea 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8dd2fd 0%, #3b96f5 100%)',
        'gradient-light': 'linear-gradient(135deg, #eff8ff 0%, #dbeffe 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6060f1 0%, #4a45e0 100%)',
        'gradient-success': 'linear-gradient(135deg, #23c864 0%, #14a44c 100%)',
        'gradient-warning': 'linear-gradient(135deg, #ff8e3f 0%, #ff721a 100%)',
        'gradient-error': 'linear-gradient(135deg, #f54747 0%, #e02828 100%)',
        'gradient-info': 'linear-gradient(135deg, #22d1ee 0%, #07b5d9 100%)',
      },
      // Soft Shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(59, 150, 245, 0.07), 0 10px 20px -2px rgba(59, 150, 245, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(59, 150, 245, 0.1), 0 20px 25px -5px rgba(59, 150, 245, 0.05)',
        'soft-xl': '0 20px 50px -12px rgba(59, 150, 245, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(59, 150, 245, 0.06)',
      },
      // Soft Border Radius
      borderRadius: {
        'soft': '1rem',
        'soft-lg': '1.5rem',
        'soft-xl': '2rem',
      },
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
