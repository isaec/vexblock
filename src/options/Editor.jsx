import React, { useState } from 'react'

const Editor = () => {

  const [content, setContent] = useState('test!')

  return <div
    tabIndex='0'
    onKeyDown={e => {
      setContent(`${content}${e.key}`)
    }}
  >
    {content}
  </div>
}

export default Editor