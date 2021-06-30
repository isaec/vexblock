const { readFile, writeFile } = require('fs/promises')
const Path = require('path')

const [input] = process.argv.slice(2)
console.log(`attempting to sort ${input}`)

const getName = str => str.trim().split('\n')[0]


readFile(input, 'utf8')
  .then(str => {
    str = `${str}
@end
`// this adds the eof to the file for easy parse

    const sorted = Array.from(str.matchAll(/^@(.|\n)*?(?=\n@)/gm), m => m[0])
      .sort((a, b) => getName(a).localeCompare(getName(b)))
      .map(str => str.trim())
      .join('\n\n')

    writeFile(input, sorted)
  })