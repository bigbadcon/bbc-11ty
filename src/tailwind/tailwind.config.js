const scale = {
  xxs: '0.236rem',
  xs: '0.382rem',
  sm: '0.618rem',
  base: '1rem',
  md: '1.618rem',
  lg: '2.618rem',
  xl: '4.236rem'
}

const colors = {
  'primary': 'var(--primary)',
  'primary-2': 'var(--primary-2)',
  'primary-3': 'var(--primary-3)',
  'primary-4': 'var(--primary-4)',
  'secondary': 'var(--secondary)',
  'highlight': 'var(--highlight)',
  'highlight-2': 'var(--highlight-2)',
  'sky': 'var(--sky)',
  'body': 'var(--body)',
  'body-highlight': 'var(--body-highlight)',
  'header': 'var(--header)',
  'subheader': 'var(--subheader)',
  'card': 'var(--card)',
  'menu-icon': 'var(--menu-icon)',
  'main-gradient-top': 'var(--main-gradient-top)',
  'main-gradient-bottom': 'var(--main-gradient-bottom)',
}

module.exports = {
  purge: {
    content: [
      "./dist/**/*.html",
      "./src/**/*.njk",
      "./src/**/*.njk",
      "./src/**/*.html",
    ],
    options: {
      safelist: [],
    },
  },
  theme: {
    darkMode: 'class',
    extend: {
      margin: scale,
      padding: scale,
      space: scale,
      colors: colors,
      fontSize: {
        '2xs': '0.6rem'
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--body)',
            h1: {
              color: 'var(--header)',
              fontFamily: 'var(--serif)',
              fontSize: '3rem',
              lineHeight: '1.20',
              marginBottom: '0.5em',
              marginTop: '1.4em',
            },
            h2: {
              color: 'var(--header)',
              fontFamily: 'var(--serif)',
              fontSize: '2.25rem',
              lineHeight: '1.10',
              marginBottom: '0.5em',
              marginTop: '1.4em'
            },
            h3: {
              color: 'var(--subheader)',
              fontFamily: 'var(--serif)',
              fontSize: '1.75rem',
              lineHeight: '1.05',
              marginBottom: '0.5em',
              marginTop: '1.4em'
            },
            a:{
              color: 'var(--highlight)',
              transition: 'color 500ms',
              '&:hover': {
                color: 'var(--body)'
              }
            },
            strong: {
              color: 'inherit'
            },
            'ul > li::before': {
                backgroundColor: 'var(--secondary)'
            }
          }
        }
      },
      height: {
        'footer-mobile': '36rem',
      },
      fill: {
        highlight: 'var(--fill-highlight)'
      },
    },
    maxWidth: {
      'hero': '120ch',
      'content': '70ch'
    },
    fontFamily: {
      sans: ['Open Sans', 'Hevetica', 'sans-serif'],
      serif: ['Rokkitt', 'serif']
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
};
