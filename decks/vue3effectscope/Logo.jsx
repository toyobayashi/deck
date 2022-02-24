import * as React from 'react'

import vue from './assets/vue.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={vue} alt='vue' width={300} />
    </div>
  )
}
