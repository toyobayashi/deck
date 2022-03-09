import * as React from 'react'

import reactSrc from './assets/react.svg'
import vueSrc from './assets/vue.svg'

const style = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={reactSrc} alt='webpack' width={200} />
      <span style={{fontSize: '5em'}}>＋</span>
      <img src={vueSrc} alt='vue' width={200} />
    </div>
  )
}
