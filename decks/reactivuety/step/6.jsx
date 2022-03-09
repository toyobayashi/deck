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

const LifecycleHooks = {
  BEFORE_MOUNT: 'bm',
  MOUNTED: 'm',
  BEFORE_UPDATE: 'bu',
  UPDATED: 'u',
  BEFORE_UNMOUNT: 'bum',
  UNMOUNTED: 'um',
  RENDER_TRIGGERED: 'rtg',
  RENDER_TRACKED: 'rtc',
  ERROR_CAPTURED: 'ec'
}

function invokeLifecycle (target, type, arg) {
  const methods = target[type]
  if (!methods || methods.length === 0) return
  invokeArrayFns(methods, arg)
}

function useSetup (setup, props) {
  const forceUpdate = useState()[1]
  const instanceRef = useRef()

  if (!instanceRef.current) {
    const updateCallback = () => {
      invokeLifecycle(instanceRef.current, LifecycleHooks.BEFORE_UPDATE)
      forceUpdate(Object.create(null))
      nextTick(() => {
        invokeLifecycle(instanceRef.current, LifecycleHooks.UPDATED)
      })
    }

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
      [LifecycleHooks.BEFORE_MOUNT]: null,
      [LifecycleHooks.MOUNTED]: null,
      [LifecycleHooks.BEFORE_UPDATE]: null,
      [LifecycleHooks.UPDATED]: null,
      [LifecycleHooks.BEFORE_UNMOUNT]: null,
      [LifecycleHooks.UNMOUNTED]: null,
      [LifecycleHooks.RENDER_TRACKED]: null,
      [LifecycleHooks.RENDER_TRIGGERED]: null,
      [LifecycleHooks.ERROR_CAPTURED]: null
    }

    setCurrentInstance(instanceRef.current)
    let setupResult
    try {
      setupResult = instanceRef.current.scope.run(() => {
        return setup(
          process.env.NODE_ENV !== 'production'
            ? shallowReadonly(instanceRef.current.props)
            : instanceRef.current.props
        )
      })
    } catch (err) {
      instanceRef.current.scope.stop()
      instanceRef.current.scope = undefined
      clearAllLifecycles(instanceRef.current)
      instanceRef.current = undefined
      resetParentInstance(parent)
      throw err
    }
    resetParentInstance(parent)
  } // if (!instanceRef.current)
}

function resetParentInstance (parent) {
  if (parent) {
    setCurrentInstance(parent)
  } else {
    unsetCurrentInstance()
  }
}