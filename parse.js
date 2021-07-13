import { readFile, writeFile } from 'fs/promises'
import Path from 'path'

import { strsToScopedObj } from './src/parser.js'

const inputs = process.argv.slice(2)
console.log(`attempting to parse [ ${inputs.join(', ')} ]`)

readFile(input, 'utf8')
  .then(str => {


    const output = strsToScopedObj([str, str])


    console.log(output)
    writeFile(`${Path.dirname(input)}/vexa.json`, JSON.stringify(output)).then(
      () => console.log('all done!')
    )
  })
  .catch(e => console.log(e))