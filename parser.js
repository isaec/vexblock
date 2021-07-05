const { readFile, writeFile } = require('fs/promises')
const Path = require('path')
require('css.escape')

const [input] = process.argv.slice(2)
console.log(`attempting to parse ${input}`)

const macros = new Map(Object.entries({
  class: (str => `.${str
    .split(/[\n\r\s]+/g)
    .filter(s => s !== '')
    .join('.')}`),
  comment: (() => ''),
}))

const directives = new Set([
  'load',
  'update',
])

const parsedToList = lines => {
  const partialMap = new Map(),
    finishedPartials = new Set()
  // walk over every line
  lines.forEach(({ level, str }, i, arr) => {
    if (partialMap.has(level)) {
      // test if we just dropped a scope
      if (arr[i - 1].level <= level) {
        // if we didnt, store the old partial, its done
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
  return Array.from(finishedPartials).join(',')
}


readFile(input, 'utf8')
  .then(str => {
    str = `${str}
@end
`// this adds the eof to the file for easy parse

    // escape macro step
    // this is needed because escape macros can be nested
    const escapeArr = str.match(/(?<=^\s*)&escape.*/gm) || []
    escapeArr.forEach(mStr => {
      // escape everything after the space
      str = str.replace(mStr, CSS.escape(mStr.match(/(?<=\s).*/)[0]))
    })

    // macro step

    // match the entire macro, for every macro
    const macroArr = str.match(/&\w*?\(.*?\)/sgm) || []
    macroArr.forEach(mStr => {
      // match the macro name
      const fnName = mStr.match(/(?<=&).*?(?=\()/)[0]
      if (!macros.has(fnName)) throw new Error(`unknown macro function, "${fnName}"`)
      const param = mStr.match(/(?<=\().*?(?=\))/sm)[0]
      // inject the new value
      // if the same macro exists twice, this will get both
      str = str.replace(mStr, macros.get(fnName)(param))
    })

    // end macro step


    // split the string into chunks, one domain per chunk, using @ symbol
    const chunks = str.match(/(?<=^@)(.|\n)*?(?=\n@)/gm)

    // store all the parsed chunks in one map
    const parsedMap = new Map()

    chunks.forEach(chunk => {
      chunk = chunk.trim()
      const lines = chunk.split('\n')
      parsedMap.set(lines[0], (
        lines.slice(1)
          // check for empty lines and comments
          .filter(str => !/^((\s*?\/\/)|\s*$)/.test(str))
          .map(line => ({
            // match for double spaces
            level: (line.match(/(\s\s)/g) || []).length,
            str: line.trim(),
          }))
      ))
    })

    const parsedSections = new Map()

    parsedMap.forEach((lines, domain) => {
      const sectionMap = new Map()
      let directive = 'css'
      lines.forEach(line => {
        if (/^on/m.test(line.str) && line.level === 0) {
          // we have a directive, lets get the name
          directive = line.str.match(/(?<=^on\s)[^(\n]*/m)[0]
          if (!directives.has(directive)) throw new Error(`illegal directive, on "${directive}" is not valid`)
        } else {
          if(sectionMap.has(directive)) {
            sectionMap.set(directive, [...sectionMap.get(directive), line])
          } else {
            sectionMap.set(directive, [line])
          }
        }
      })
      parsedSections.set(domain, sectionMap)
    })


    // now, lets walk the sections and parse it further
    const scopedObj = {}
    parsedSections.forEach((sections, domain) => {
      scopedObj[domain] = {}
      sections.forEach((parsedMapSection, directive) => {
        scopedObj[domain][directive] = parsedToList(parsedMapSection)
      })
    })

    console.log(scopedObj)
    writeFile(`${Path.dirname(input)}/vexa.json`, JSON.stringify(scopedObj)).then(
      () => console.log('all done!')
    )
  })
  .catch(e => console.log(e))