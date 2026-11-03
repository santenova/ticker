/**
 * Babel runs only inside Jest. It compiles JSX and leaves `import`/`export`
 * untouched (modules: false) so Jest's native ESM runner loads the app's
 * sources exactly as Vite does.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
    ['@babel/preset-react', { runtime: 'automatic', development: true }],
  ],
  // Vite's import.meta.env does not exist outside Vite; map it to process.env.
  plugins: ['transform-vite-meta-env'],
};