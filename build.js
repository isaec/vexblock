const esbuild = require('esbuild')
const Path = require('path')
const { copyFile, unlink, readdir, mkdir } = require('fs/promises')
const { watch, mkdirSync } = require('fs')

const mLog = e => {
  if (e.code !== 'EEXIST' && e.code !== 'EISDIR') console.log(e)
}

try { mkdirSync('build') }
catch (e) { mLog(e) }

const copyDir = (from, to, append) => {
  if (append) {
    from = `${from}/${append}`
    to = `${to}/${append}`
  }
  readdir(from).then(async fArr => {
    await mkdir(to, { recursive: true }).catch(mLog)
    await Promise.all(fArr.map(file => copyFile(
      `${from}/${file}`,
      `${to}/${file}`
    ).catch(mLog)))
    console.log(`${from} copy done`)
  })
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const syncDir = (from, to, append) => {
  if (append) {
    from = `${from}/${append}`
    to = `${to}/${append}`
  }
  const fsDebounce = new Set()
  watch(from, async (e, f) => {
    if (fsDebounce.has(f)) return
    fsDebounce.add(f)
    await sleep(100)
    fsDebounce.delete(f)
    await copyFile(
      `${from}/${f}`,
      `${to}/${f}`,
    ).catch(async err => {
      if (err.code === 'ENOENT') {
        await unlink(`${to}/${f}`)
        console.log(`${to}/${f} was deleted`)
      } else {
        console.log(err)
      }
    })
    console.log(`${f} was synced (${e})`)
  })
}

const mirrorDir = async (from, to, append) => {
  copyDir(from, to, append)
  syncDir(from, to, append)
}

const copyFileArray = (from, to, arr) => Promise.all(
  arr.map(path => copyFile(
    `${from}/${path}`,
    `${to}/${Path.basename(path)}`
  ))
)

const syncFileArray = (from, to, arr) => {
  arr.forEach(file => {
    let debounce = false
    watch(`${from}/${file}`, async (e, f) => {
      if (debounce) return
      debounce = true
      await sleep(100)
      debounce = false
      await copyFile(
        `${from}/${f}`,
        `${to}/${f}`,
      ).catch(async err => {
        if (err.code === 'ENOENT') {
          await unlink(`${to}/${f}`)
          console.log(`${to}/${f} was deleted`)
        } else {
          console.log(err)
        }
      })
      console.log(`${f} was synced (${e})`)
    })
  })
}

copyFileArray('src', 'build', [
  'options.html',
  'popup.html',
]).then(() => console.log('html copy done'))

syncFileArray('src', 'build', [
  'options.html',
  'popup.html',
])

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

mirrorDir('browser', 'build')
mirrorDir('browser', 'build', 'icons')