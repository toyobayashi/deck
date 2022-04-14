import * as React from 'react'

import node from './assets/node.png'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={node} alt='webpack' width={500} />
    </div>
  )
}
