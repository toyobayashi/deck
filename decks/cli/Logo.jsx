import * as React from 'react'

import nodejs from './assets/nodejs.png'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={nodejs} alt='webpack' width={500} />
    </div>
  )
}
