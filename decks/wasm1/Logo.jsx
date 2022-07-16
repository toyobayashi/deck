import * as React from 'react'

import wasm from './assets/wasm.svg'

const style = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

export default function () {
  return (
    <div style={style}>
      <img src={wasm} alt='wasm' width={200} />
    </div>
  )
}
