import { readFile, writeFile } from 'fs/promises'
import { strToSortedStr } from './src/parser.js'

const [input] = process.argv.slice(2)
console.log(`attempting to sort ${input}`)

const getName = str => str.trim().split('\n')[0]


readFile(input, 'utf8')
  .then(str => {
    const sorted = strToSortedStr(str)
    writeFile(input, sorted)
    console.log('sorted.')
  })