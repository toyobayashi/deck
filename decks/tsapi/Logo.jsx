import * as React from 'react'

import ts from './assets/ts.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={ts} alt='webpack' width={250} />
    </div>
  )
}
