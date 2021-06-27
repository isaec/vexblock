const esbuild = require('esbuild')

esbuild.build({
  allowOverwrite: true,
  entryPoints: [
    'background',
    'foreground',
    'options',
    'popup',
  ].map(str => `src/${str}.js`),
  outdir: 'build'
}).catch(() => process.exit(1))