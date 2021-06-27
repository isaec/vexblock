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

    //store all the parsed chunks in one map
    const parsedMap = new Map()

    chunks.forEach(chunk => {
      chunk = chunk.trim()
      const lines = chunk.split('\n')
      parsedMap.set(lines[0], (
        lines.slice(1)
          //check for empty lines and comments
          .filter(str => !/^((\s*?\/\/)|\s*$)/.test(str))
          .map(line => ({
            //match for double spaces
            level: line.match(/(\s\s)/g).length,
            str: line.trim(),
          }))
      ))
    })

    console.log(parsedMap)
    //now, lets walk the map and parse it further
    parsedMap.forEach((lines, domain) => {
      const partialMap = new Map(),
        finishedPartials = new Set()
      lines.forEach(({ level, str }) => {
        if(partialMap.has(level)) {
          //store the old partial, its done
          finishedPartials.add(partialMap.get(level))
        }
      })
      console.log(partialBuf)
    })
  })
  .catch(e => console.log(e))