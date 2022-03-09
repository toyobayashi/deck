import * as React from 'react'
import {
  ref, computed, watch, onMounted
} from '@vue/runtime-core'

import { defineComponent } from './index.jsx'

const App = defineComponent({
  // name: 'App',
  setup (vueProps) {
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
  },
  render (state, reactProps, ref) {
    // 这里可以使用其它 React Hooks
    return (
      <div>
        defineComponent: {state.count} * 2 = {state.doubleCount}
        <button onClick={state.add}>ADD</button>
      </div>
    )
  }
})

export default App
