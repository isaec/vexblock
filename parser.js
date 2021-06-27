const { readFile } = require('fs/promises')

const [input] = process.argv.slice(2)
console.log(`attempting to parse ${input}`)

readFile(input, 'utf8')
  .then(str => {
    str = `${str}
@end
`// this adds the eof to the file for easy parse

    //split the string into chunks, one domain per chunk, using @ symbol
    const chunks = str.match(/(?<=^@)(.|\n)*?(?=\n@)/gm)

    chunks.forEach(chunk => {
      chunk = chunk.trim()
      const lines = chunk.split('\n')
      const chunkMap = {
        domain: lines[0],
        lines: (
          lines.slice(1)
            //check for empty lines and comments
            .filter(str => !/^((\s*?\/\/)|\s*$)/.test(str))
            .map(line => ({
              //match for double spaces
              level: line.match(/(\s\s)/g).length,
              str: line.trim(),
            }))
        ),
      }
      console.log(chunkMap)
    })

  })
  .catch(e => console.log(e))