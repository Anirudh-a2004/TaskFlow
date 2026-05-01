export default {
  darkMode: 'class',
  content: ['./index.html', './client/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 20px 70px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};
