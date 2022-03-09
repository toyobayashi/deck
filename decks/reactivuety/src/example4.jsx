import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  ref, computed, watch, onMounted
} from '@vue/runtime-core'

function defineComponent (options) { /* TODO */ }

const App = defineComponent(function (vueProps) {
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

    return (reactProps, ref) => {
      // 这里可以使用其它 React Hooks
      return <div>
        defineComponent: {count.value} * 2 = {doubleCount.value}
        <button onClick={add}>ADD</button>
      </div>
    }
})

ReactDOM.render(<App />, document.getElementById('app'))
