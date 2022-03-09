import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  ref, computed, watch, onMounted
} from '@vue/runtime-core'

function useSetup (setup, props) { /* TODO */ }

function App (reactProps, refOrContext) {
  const render = useSetup((vueProps) => {
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

    return (reactProps, refOrContext) => {
      // 这里可以使用其它 React Hooks

      return <div>
        useSetup: {count.value} * 2 = {doubleCount.value}
        <button onClick={add}>ADD</button>
      </div>
    }
  }, reactProps)

  return render(reactProps, refOrContext)
}

ReactDOM.render(<App />, document.getElementById('app'))
