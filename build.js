const esbuild = require('esbuild')
const bLib = require('./buildLib')

esbuild.build({
  allowOverwrite: true,
  watch: {
    onRebuild: () => console.log('js build done')
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

bLib.ensureDir('build')

bLib.Dir.mirror('browser', 'build')
bLib.Dir.mirror('browser', 'build', 'icons')

bLib.FileArray.mirror('src', 'build', [
  'options.html',
  'popup.html',
])