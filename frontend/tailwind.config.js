/**
 * @type {import('tailwindcss/types/config').Config}
 */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '320px', // 超小屏幕
        'sm': '640px', // 小屏幕
        'md': '768px', // 中等屏幕
        'lg': '1024px', // 大屏幕
        'xl': '1280px', // 超大屏幕
        '2xl': '1536px', // 2倍超大屏幕
        // 移动端专用断点
        'mobile-s': '320px',
        'mobile-m': '375px',
        'mobile-l': '425px',
        'tablet': '768px',
        'laptop': '1024px',
        'laptop-l': '1440px',
        'desktop': '2560px'
      },
      // 移动端优化的间距
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)'
      },
      // 移动端优化的字体大小
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1rem' }],
        'sm-mobile': ['0.875rem', { lineHeight: '1.25rem' }],
        'base-mobile': ['1rem', { lineHeight: '1.5rem' }],
        'lg-mobile': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl-mobile': ['1.25rem', { lineHeight: '1.75rem' }]
      }
    }
  },
  plugins: []
}
