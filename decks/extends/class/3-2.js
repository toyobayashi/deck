var Component = /*#__PURE__*/ (function () {
  'use strict'

  function Component (props, context, updater) {
    if (!(this instanceof Component)) {
      throw new TypeError(
        'Class constructor Component ' +
        "cannot be invoked without 'new'")
    }

    this.props = props
    this.context = context
    this.updater = updater || {
      enqueueSetState: function (
        publicInstance,
        partialState,
        callback,
        callerName
      ) {
        if (typeof partialState === 'function') {
          Object.assign(publicInstance.state,
            partialState(publicInstance.state))
        } else {
          Object.assign(publicInstance.state,
            partialState)
        }
        if (typeof callback === 'function') {
          Promise.resolve().then(callback)
        }
      }
    }
  }

  initializePrototype(Component)

  return Component
})()

function initializePrototype (Class) {
  Object.defineProperty(
    Class, 'prototype', {
      configurable: false,
      enumerable: false,
      writable: false
    })
  Object.defineProperty(
    Class.prototype, 'constructor', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: Class
    })
}