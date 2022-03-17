import * as React from 'react'

import cpp from './assets/cpp.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={cpp} alt='webpack' width={200} />
    </div>
  )
}
