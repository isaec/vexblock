import React from 'react'
import ReactDOM from 'react-dom'
import './edit/edit.scss'

import Editor from './options/Editor'

const App = () => <div>
  <Editor></Editor>
</div>

ReactDOM.render(<App />, document.querySelector('#root'))