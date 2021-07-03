import React, { useState, useMemo } from 'react'
import './Editor.scss'

const sanitize = str => {
  const temp = document.createElement('div')
  temp.textContent = str
  return temp.innerHTML
}

const Editor = () => {

  const [content, setContent] = useState('test!')
  const highlighted = useMemo(() => ({
    __html: sanitize(content)
      .replace(
        /^(@)(?<domain>[^\s]*)/gm,
        '@<span style="color:red">$<domain></span>')
  }), [content])

  return <div>
    <textarea
      id='edit'
      onChange={e => setContent(e.target.value)}
      value={content}
    ></textarea>
    <pre id='highlight' aria-hidden='true'>
      <code
        dangerouslySetInnerHTML={highlighted}
      ></code>
    </pre>
  </div>
}

export default Editor