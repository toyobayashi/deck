import * as React from 'react'

import vscode from './assets/vscode.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={vscode} alt='webpack' width={300} />
    </div>
  )
}
