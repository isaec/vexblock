import Path from 'path'
import { copyFile, unlink, readdir, mkdir } from 'fs/promises'
import { watch, mkdirSync } from 'fs'

const mLog = e => {
  if (e.code !== 'EEXIST' && e.code !== 'EISDIR') console.log(e)
}

const ensureDir = dir => {
  try { mkdirSync(dir, { recursive: true }) }
  catch (e) { mLog(e) }
}

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
).then(() => console.log(`${from}/[${arr.join(', ')}] copy done`))

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

const mirrorFileArray = (from, to, arr) => {
  copyFileArray(from, to, arr)
  syncFileArray(from, to, arr)
}

const Dir = {
  copy: copyDir,
  sync: syncDir,
  mirror: mirrorDir,
}
const FileArray = {
  copy: copyFileArray,
  sync: syncFileArray,
  mirror: mirrorFileArray,
}

export default {
  ensureDir,
  Dir,
  FileArray,
}