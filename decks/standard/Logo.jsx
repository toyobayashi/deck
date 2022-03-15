import * as React from 'react'

import standard from './assets/standard.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={standard} alt='webpack' width={200} />
    </div>
  )
}
