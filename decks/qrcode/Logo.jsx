import * as React from 'react'

import emscripten from './assets/emscripten.png'
import nodejs from './assets/nodejs.png'
import wasm from './assets/wasm.svg'

const style = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={emscripten} alt='emscripten' width={200} />
      <img src={nodejs} alt='nodejs' width={200} />
      <img src={wasm} alt='wasm' width={200} />
    </div>
  )
}
