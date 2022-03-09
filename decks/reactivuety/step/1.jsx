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

}