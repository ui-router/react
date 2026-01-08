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
  {
    entry: { 'ui-router-react': 'src/index.ts' },
    format: 'iife',
    sourcemap: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    noExternal: ['@uirouter/core', 'prop-types', 'classnames'],
    outDir: 'dist',
    globalName: 'UIRouterReact',
    platform: 'browser',
    outputOptions: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react/jsx-runtime': 'React',
      },
    },
  },
  // IIFE bundle for browsers (minified)
  {
    entry: { 'ui-router-react.min': 'src/index.ts' },
    format: 'iife',
    sourcemap: true,
    minify: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    noExternal: ['@uirouter/core', 'prop-types', 'classnames'],
    outDir: 'dist',
    globalName: 'UIRouterReact',
    platform: 'browser',
    outputOptions: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react/jsx-runtime': 'React',
      },
    },
  },
]);
