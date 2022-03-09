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
import { useState, useEffect, useRef, forwardRef } from 'react'

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

  useEffect(() => {
    if (instanceRef.current) {
      const keys = Object.keys(props)
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i]
        instanceRef.current.props[key] = props[key]
      }
      const originalKeys = Object.keys(instanceRef.current.props)
      for (let i = 0; i < originalKeys.length; ++i) {
        const k = originalKeys[i]
        if (keys.indexOf(k) === -1) {
          delete instanceRef.current.props[k]
        }
      }
    }
  }, [props])

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

    const onTrack = (e) => {
      invokeLifecycle(instanceRef.current, LifecycleHooks.RENDER_TRACKED, e)
    }
    const onTrigger = (e) => {
      invokeLifecycle(instanceRef.current, LifecycleHooks.RENDER_TRIGGERED, e)
    }

    if (typeof setupResult === 'function') {
      let _args = []
      const runner = effect(() => setupResult(..._args), {
        lazy: true,
        scope: scope,
        scheduler: () => {
          if (!instanceRef.current || instanceRef.current.isMounted) {
            queuePreFlushCb(updateCallback)
          } else {
            updateCallback()
          }
        },
        onTrack,
        onTrigger
      })
      invokeLifecycle(instanceRef.current, LifecycleHooks.BEFORE_MOUNT)
      instanceRef.current.render = function (...args) {
        _args = args
        const r = scope.run(() => runner())
        _args = []
        return r
      }
    } else {
      scope.run(() => {
        watch(() => setupResult, updateCallback, {
          deep: true,
          onTrack,
          onTrigger
        })
      })
      invokeLifecycle(instanceRef.current, LifecycleHooks.BEFORE_MOUNT)
      instanceRef.current.setupState = proxyRefs(setupResult)
    }
  } // if (!instanceRef.current)

  useEffect(() => {
    instanceRef.current.isMounted = true
    instanceRef.current.isUnmounted = false
    invokeLifecycle(instanceRef.current, LifecycleHooks.MOUNTED)
    return () => {
      invokeLifecycle(instanceRef.current, LifecycleHooks.BEFORE_UNMOUNT)
      instanceRef.current.scope.stop()
      invokeLifecycle(instanceRef.current, LifecycleHooks.UNMOUNTED)
      clearAllLifecycles(instanceRef.current)
      instanceRef.current.scope = undefined
      instanceRef.current.isMounted = false
      instanceRef.current.isUnmounted = true
      instanceRef.current = undefined
    }
  }, [])

  return instanceRef.current.render ?? instanceRef.current.setupState
}

function clearAllLifecycles (target) {
  const lifecycles = [
    LifecycleHooks.BEFORE_MOUNT,
    LifecycleHooks.MOUNTED,
    LifecycleHooks.BEFORE_UPDATE,
    LifecycleHooks.UPDATED,
    LifecycleHooks.BEFORE_UNMOUNT,
    LifecycleHooks.UNMOUNTED,
    LifecycleHooks.RENDER_TRIGGERED,
    LifecycleHooks.RENDER_TRACKED,
    LifecycleHooks.ERROR_CAPTURED
  ]

  for (let i = 0; i < lifecycles.length; i++) {
    if (target[lifecycles[i]]) {
      target[lifecycles[i]].length = 0
      target[lifecycles[i]] = null
    }
  }
}

function resetParentInstance (parent) {
  if (parent) {
    setCurrentInstance(parent)
  } else {
    unsetCurrentInstance()
  }
}

function defineComponent (options) {
  if (typeof options === 'function') {
    return defineComponent({
      name: options.name,
      setup: options
    })
  }

  if (typeof options === 'object' && options !== null) {
    const setup = options.setup
    const renderFunctionProvided = typeof options.render === 'function'
    const SetupComponent = forwardRef(function (props, ref) {
      const stateOrRenderFunction = useSetup(setup, props)
      if (typeof stateOrRenderFunction === 'function') {
        return stateOrRenderFunction(props, ref)
      }
      if (renderFunctionProvided) {
        const state = stateOrRenderFunction
        return options.render(state, props, ref)
      }

      throw new TypeError('render function is not provided')
    })

    if (typeof options.name === 'string') {
      SetupComponent.displayName = options.name
    }

    return SetupComponent
  }

  throw new TypeError('Invalid component option')
}

export { useSetup, defineComponent }
