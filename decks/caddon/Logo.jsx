import * as React from 'react'

import nodejs from './assets/nodejs.png'
import dotnet from './assets/dotnet.svg'

const style = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={dotnet} alt='webpack' width={250} />
      <span style={{ fontSize: '200px' }}>→</span>
      <img src={nodejs} alt='webpack' width={250} />
    </div>
  )
}
