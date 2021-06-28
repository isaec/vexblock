const { readFile, writeFile } = require('fs/promises')
const Path = require('path')

const [input] = process.argv.slice(2)
console.log(`attempting to parse ${input}`)

const macros = new Map(Object.entries({
  class: (str => `.${str
    .split(/[\n\r\s]+/g)
    .filter(s => s !== '')
    .join('.')}`),
}))


readFile(input, 'utf8')
  .then(str => {
    str = `${str}
@end
`// this adds the eof to the file for easy parse

    //macro step

    //match the entire macro, for every macro
    const macroArr = str.match(/&\w*?\(.*?\)/sgm) || []
    macroArr.forEach(mStr => {
      //match the macro name
      const fnName = mStr.match(/(?<=&).*?(?=\()/)[0]
      if (!macros.has(fnName)) throw new Error('unknown macro function')
      const param = mStr.match(/(?<=\().*?(?=\))/sm)[0]
      //inject the new value
      //if the same macro exists twice, this will get both
      str = str.replace(mStr, macros.get(fnName)(param))
    })

    //end macro step


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
    const scopedObj = {}
    parsedMap.forEach((lines, domain) => {
      const partialMap = new Map(),
        finishedPartials = new Set()
      //walk over every line
      lines.forEach(({ level, str }, i, arr) => {
        if (partialMap.has(level)) {
          //test if we just dropped a scope
          if (arr[i - 1].level <= level) {
            //if we didnt, store the old partial, its done
            finishedPartials.add(partialMap.get(level))
          }
        }
        partialMap.set(level, `${level !== 1 ? partialMap.get(level - 1) : ''}${str}`)
      })
      // there may still be a valid partial, if so, its the highest indexed partial not in our set
      for (let i = partialMap.size; i >= 0; i--) {
        if (!finishedPartials.has(partialMap.get(i))) {
          finishedPartials.add(partialMap.get(i))
          break
        }
      }
      scopedObj[domain] = {
        default: Array.from(finishedPartials).join(',')
      }
    })

    console.log(scopedObj)
    writeFile(`${Path.dirname(input)}/vexa.json`, JSON.stringify(scopedObj)).then(
      () => console.log('all done!')
    )
  })
  .catch(e => console.log(e))