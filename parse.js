import { readFile, writeFile } from 'fs/promises'
import Path from 'path'

import { strToSectionMap, sectionMapToScopedObj, sectionMapToTargetSet } from './src/parser.js'

const [input] = process.argv.slice(2)
console.log(`attempting to parse ${input}`)

readFile(input, 'utf8')
  .then(str => {

    console.log(sectionMapToTargetSet(strToSectionMap(str)))


    const output = sectionMapToScopedObj(strToSectionMap(str))


    console.log(output)
    writeFile(`${Path.dirname(input)}/vexa.json`, JSON.stringify(output)).then(
      () => console.log('all done!')
    )
  })
  .catch(e => console.log(e))