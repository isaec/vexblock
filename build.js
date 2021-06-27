const esbuild = require('esbuild')
const Path = require('path')
const { copyFile, readdir, mkdir } = require('fs/promises')
const { watch, mkdirSync } = require('fs')
const { EEXIST } = require('constants')

const mLog = e => {
  if (e.code !== 'EEXIST') console.log(e)
}

try { mkdirSync('build') }
catch (e) { mLog(e) }

const copyFileArray = (prefix, arr, suffix = '') => Promise.all(arr.map(path => copyFile(
  `${prefix}/${path}${suffix}`,
  `build/${Path.basename(path)}${suffix}`
)))

copyFileArray('src', [
  'options',
  'popup',
], '.html').then(() => console.log('html copy done'))

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


readdir('browser/icons').then(async fArr => {
  await mkdir('build/icons').catch(mLog)
  await Promise.all(fArr.map(file => copyFile(
    `browser/icons/${file}`,
    `build/icons/${file}`
  )))
  console.log('initial browser copy done')
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const fsDebounce = new Set()
watch('browser', async (e, f) => {
  if (fsDebounce.has(f)) return
  fsDebounce.add(f)
  await sleep(100)
  fsDebounce.delete(f)
  await copyFile(
    `browser/${f}`,
    `build/${f}`,
  )
  console.log(`${f} was synced (${e})`)
})