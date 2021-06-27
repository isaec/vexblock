const { readFile } = require('fs/promises')

const [input] = process.argv.slice(2)

console.log(`attempting to parse ${input}`)

readFile(input, 'utf8')
  .then(str => {
    console.log(str.match(/(?<=^@).*/gm))


  })
  .catch(e => console.log(e))