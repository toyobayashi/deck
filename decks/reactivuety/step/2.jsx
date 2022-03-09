import {
  effect,
  effectScope,
  shallowReactive,
  shallowReadonly,
  getCurrentInstance,
  nextTick,
  watch,
  proxyRefs,
  // @vue/runtime-core 3.2.31 未导出这三个 API，后面演示如何处理
  setCurrentInstance, unsetCurrentInstance, queuePreFlushCb,
} from '@vue/runtime-core'
import { invokeArrayFns } from '@vue/shared'
import { useState, useEffect, useRef } from 'react'

function useSetup (setup, props) {
  const instanceRef = useRef()

  if (!instanceRef.current) {
    const scope = effectScope()
    const parent = getCurrentInstance()

    instanceRef.current = {
      scope: scope, // 响应式效果作用域
      setupState: null, // setup 函数返回的状态
      render: null, // setup 函数返回的渲染函数
      props: shallowReactive({ ...props }), // vueProps
      parent: parent, // 父组件实例
      provides: parent ? parent.provides : {},
      isMounted: false,
      isUnmounted: false,
    }
  } // if (!instanceRef.current)
}