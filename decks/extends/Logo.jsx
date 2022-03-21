import * as React from 'react'

import js from './assets/js.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={js} alt='webpack' width={200} />
    </div>
  )
}
