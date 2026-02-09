import { defineConfig } from 'tsdown';

export default defineConfig([
  // ESM and CJS for bundlers (externalize all deps)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    outDir: 'dist',
  },
  // IIFE bundle for browsers (non-minified)
  // Bundles @uirouter/core and other deps, only React is external
  // react/jsx-runtime must be in noExternal because tsdown prefix-matches
  // external: ['react'] to also externalize react/* subpaths.
  // Bundling it is fine — it's a tiny shim whose internal require('react')
  // resolves to the React global.
  {
    entry: { 'ui-router-react': 'src/index.ts' },
    format: 'iife',
    sourcemap: true,
    external: ['react', 'react-dom'],
    noExternal: ['@uirouter/core', 'prop-types', 'classnames', 'react/jsx-runtime'],
    outDir: 'dist',
    globalName: 'UIRouterReact',
    platform: 'browser',
    outputOptions: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  },
  // IIFE bundle for browsers (minified)
  {
    entry: { 'ui-router-react.min': 'src/index.ts' },
    format: 'iife',
    sourcemap: true,
    minify: true,
    external: ['react', 'react-dom'],
    noExternal: ['@uirouter/core', 'prop-types', 'classnames', 'react/jsx-runtime'],
    outDir: 'dist',
    globalName: 'UIRouterReact',
    platform: 'browser',
    outputOptions: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  },
]);
