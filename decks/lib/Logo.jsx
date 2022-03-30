import * as React from 'react'

import npm from './assets/npm.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={npm} alt='webpack' width={500} />
    </div>
  )
}
