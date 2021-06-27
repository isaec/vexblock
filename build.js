const esbuild = require('esbuild')
let buildCount = 0

esbuild.build({
  allowOverwrite: true,
  watch: {
    onRebuild: () => console.log(`watch build ${buildCount++} done!`),
  },
  bundle: true,
  entryPoints: [
    'background.js',
    'foreground.js',
    'options.jsx',
    'popup.jsx'
  ].map(str => `src/${str}`),
  outdir: 'build'
}).catch(() => process.exit(1))