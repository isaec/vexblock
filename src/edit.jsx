import React from 'react'
import ReactDOM from 'react-dom'
import './edit/edit.scss'

import Editor from './edit/Editor'

const App = () => <div
  id='App'
>
  <Editor></Editor>
</div>

ReactDOM.render(<App />, document.querySelector('#root'))