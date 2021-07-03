import React, { useState } from 'react'
import './Editor.scss'

const Editor = () => {

  const [content, setContent] = useState('test!')

  return <div>
    <textarea
      id='edit'
      onChange={e => setContent(e.target.value)}
    >{content}</textarea>
    <pre id='highlight' aria-hidden='true'>
      <code>{content}</code>
    </pre>
  </div>
}

export default Editor