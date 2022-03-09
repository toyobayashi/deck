import * as React from 'react'
import {
  ref, computed, watch, onMounted
} from '@vue/runtime-core'

import { useSetup } from './index.jsx'

export default function App (reactProps, refOrContext) {
  const state = useSetup((vueProps) => {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    const add = () => { count.value++ }
    watch(count, (n, o) => {
      window.alert(`count is changing: ${o} -> ${n}`)
    })

    onMounted(() => {
      setTimeout(() => {
        count.value += 100
      }, 1000)
    })

    return { count, doubleCount, add }
  }, reactProps)

  // 这里可以使用其它 React Hooks

  return (
    <div>
      useSetup: {state.count} * 2 = {state.doubleCount}
      <button onClick={state.add}>ADD</button>
    </div>
  )
}
