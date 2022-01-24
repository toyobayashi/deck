import * as React from 'react'

import webpackSrc from './assets/webpack.svg'
import vueSrc from './assets/vue.svg'
import piniaSrc from './assets/pinia.svg'
import tsSrc from './assets/ts.svg'

const style = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '60%'
}

export default function () {
  return (
    <div style={style}>
      <img src={webpackSrc} alt='webpack' width={200} />
      <img src={vueSrc} alt='vue' width={200} />
      <img src={piniaSrc} alt='pinia' width={200} />
      <img src={tsSrc} alt='ts' width={200} />
    </div>
  )
}
