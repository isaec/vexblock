import 'css.escape'

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

export const parsedToTargetSet = lines => {
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
  return finishedPartials
}

export const targetSetToList = targetSet => Array.from(targetSet).join(',')

export const addEnd = str => `${str}
@end`// this adds the eof to the file for easy parse

export const strToSectionTargetMap = str => {
  str = addEnd(str)

  // escape macro step
  // this is needed because escape macros can be nested
  const escapeArr = str.match(/(?<=^\s*)&escape\s.*/gm) || []
  escapeArr.forEach(mStr => {
    // escape everything after the space
    str = str.replace(mStr, CSS.escape(mStr.match(/(?<=\s).*/)[0]))
  })
  // this step matches escape macros with () syntax
  const mEscapeArr = str.match(/&escape\(.*?\)/gs) || []
  mEscapeArr.forEach(mStr => {
    str = str.replace(
      mStr,
      mStr
        .match(/(?<=\().*?(?=\))/s)[0]
        .split(/[\n\r\s]+/g)
        .filter(s => s !== '')
        .map(CSS.escape)
        .join(' ')
    )
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
        if (sectionMap.has(directive)) {
          sectionMap.set(directive, [...sectionMap.get(directive), line])
        } else {
          sectionMap.set(directive, [line])
        }
      }
    })

    sectionMap.forEach((parsedMapSection, mapDirective) => {
      sectionMap.set(mapDirective, parsedToTargetSet(parsedMapSection))
    })

    parsedSections.set(domain, sectionMap)
  })

  return parsedSections
}

export const sectionTargetMapToScopedObj = sectionMap => {
  const scopedObj = {}
  sectionMap.forEach((sections, domain) => {
    scopedObj[domain] = {}
    sections.forEach((parsedMapSection, directive) => {
      scopedObj[domain][directive] = targetSetToList(parsedMapSection)
    })
  })
  return scopedObj
}

const mergeSet = (target, source) => {
  for (const item of source) {
    target.add(item)
  }
}

const mergeMapSets = (target, ...sources) => {
  for (const source of sources) {
    for (const [domain, directives] of source) {
      if (!target.has(domain)) {
        target.set(domain, directives)
      } else {
        for (const [directive, selectors] of directives) {
          mergeSet(target.get(domain).get(directive), selectors)
        }
      }
    }
  }
}

export const strsToScopedObj = (strs) => {
  const sectionTargetMapsArr = strs.map(strToSectionTargetMap)
  mergeMapSets(...sectionTargetMapsArr)
  return sectionTargetMapToScopedObj(sectionTargetMapsArr[0])
}

export const strToScopedObj = (str) => sectionTargetMapToScopedObj(strToSectionTargetMap(str))

const getDomainName = str => str.trim().split('\n')[0]

export const strToSortedStr = str => Array.from(addEnd(str).matchAll(/^@(.|\n)*?(?=\n@)/gm), m => m[0])
  .sort((a, b) => getDomainName(a).localeCompare(getDomainName(b)))
  .map(str => str.trim())
  .join('\n\n')