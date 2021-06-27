const { readFile } = require('fs/promises')

const [input] = process.argv.slice(2)

console.log(`attempting to parse ${input}`)


const reg = {
  domain: /(?<=^@).*/gm,
  chunk: /(?<=^@)(.|\n)*?(?=\n@)/gm,
}

readFile(input, 'utf8')
  .then(str => {
    str = `${str}
@end
`// this adds the eof to the file for easy parse


    const chunks = str.match(reg.chunk)

    chunks.forEach((chunk, i) => {
      chunk = chunk.trim()
      const lines = chunk.split('\n')
      console.log(lines, i)
    })

  })
  .catch(e => console.log(e))