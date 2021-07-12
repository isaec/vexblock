import React, { useState, useMemo, useRef } from 'react'
import './Editor.scss'

const sanitize = str => {
  const temp = document.createElement('div')
  temp.textContent = str
  return temp.innerHTML
}
const color = (code, str = '$&') => `<span class="${code}">${str}</span>`

const Editor = () => {
  const [content, setContent] = useState('test!')
  const textarea = useRef()
  const highlighted = useMemo(() => ({
    __html: sanitize(content)
      .replace(
        /^(@)(?<domain>[^\s]*)/gm, // domains
        `${color('magenta', '@')}${color('blue', '$<domain>')}`
      )
      .replace(
        /^\s*?\/\/.*/gm, // comments
        color('base01')
      )
      .replace(
        /(?<name>&amp;\w*?\()(?<arg>.*?)\)/gms, // macros
        color('yellow', `$<name>${color('green', '$<arg>')})`)
      )
      .replace(
        /(?<space>^\s*)&amp;escape\s(?<arg>.+)/gm, // escape single liners
        `$<space>${color('yellow', '&escape')} ${color('cyan bg-base02', '$<arg>')}`
      )
      .replace( 
        /^(on\s)(?<directive>\w+)/gm, // directives
        `${color('violet', 'on')} ${color('cyan', '$<directive>')}`
      )
      + ' '
  }), [content])

  return <div
    className='Editor'
    onClick={() => {
      textarea.current.focus()
    }}
  >
    <div className='EditorScroll'>
      <textarea
        id='edit'
        spellCheck='false'
        onChange={e => setContent(e.target.value)}
        ref={textarea}
        value={content}
      ></textarea>
      <pre id='highlight' aria-hidden='true'>
        <code
          dangerouslySetInnerHTML={highlighted}
        ></code>
      </pre>
    </div>
  </div>
}

export default Editor