const { readFile } = require('fs/promises')

const [input] = process.argv.slice(2)

const reg = {
  chunk: /(?<=^@)(.|\n)*?(?=\n@)/gm,
  indent: str => str.match(/(\s\s)/g).length,
}

const lineObj = line => ({
  level: reg.indent(line),
  str: line.trim(),
})

console.log(`attempting to parse ${input}`)

readFile(input, 'utf8')
  .then(str => {
    str = `${str}
@end
`// this adds the eof to the file for easy parse


    const chunks = str.match(reg.chunk)

    chunks.forEach((chunk, i) => {
      chunk = chunk.trim()
      const lines = chunk.split('\n')
      const chunkMap = {
        domain: lines[0],
        lines: new Set(lines.slice(1).map(lineObj))
      }
      console.log(chunkMap)
    })

  })
  .catch(e => console.log(e))