import React from 'react'
import ReactDOM from 'react-dom'
import './options/options.scss'

import Editor from './options/Editor'

const App = () => <div>
  <Editor></Editor>
</div>

ReactDOM.render(<App />, document.querySelector('#root'))