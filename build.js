const esbuild = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')
const bLib = require('./buildLib')

const envSettings = (
  env => {
    if (env === 'production') {
      return {
        minify: true,
      }
    }
    return {
      minify: false,
      watch: {
        onRebuild: () => console.log('js build done')
      },
    }
  }
)(process.env.NODE_ENV)

esbuild.build({
  ...envSettings,
  allowOverwrite: true,
  bundle: true,
  entryPoints: [
    'background.js',
    'options.jsx',
    'popup.jsx',
    'edit.jsx',
  ].map(str => `src/${str}`),
  outdir: 'build',
  plugins: [sassPlugin({cache: true})],
}).catch(() => process.exit(1))

bLib.ensureDir('build')

bLib.Dir.mirror('browser', 'build')
bLib.Dir.mirror('browser', 'build', 'icons')
bLib.Dir.mirror('config', 'build/config')

bLib.FileArray.mirror('src', 'build', [
  'options.html',
  'popup.html',
  'edit.html',
])