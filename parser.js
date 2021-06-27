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

    // console.log(parsedMap)
    //now, lets walk the map and parse it further
    parsedMap.forEach((lines, domain) => {
      const partialMap = new Map(),
        finishedPartials = new Set()
      //walk over every line
      lines.forEach(({ level, str }) => {
        if (partialMap.has(level)) {
          //store the old partial, its done
          console.log(partialMap.get(level), 'from', str)
          finishedPartials.add(partialMap.get(level))
        }
        partialMap.set(level, `${level !== 1 ? partialMap.get(level - 1) : ''}${str}`)
      })
      // there may still be a valid partial, if so, its the highest indexed partial not in our set
      for (let i = partialMap.size; i >= 0; i--) {
        if (!finishedPartials.has(partialMap.get(i))) {
          finishedPartials.add(partialMap.get(i))
          partialMap.delete(i)
          break
        }
      }
      console.log('\n\n', partialMap, finishedPartials, '\n\n=====\n')
    })
  })
  .catch(e => console.log(e))