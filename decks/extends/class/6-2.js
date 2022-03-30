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

  defineMethod(Component, 'setState',
    function setState (partialState, callback) {
      this.updater.enqueueSetState(this,
        partialState, callback, 'setState')
    })
  
  defineStaticMethod(Component, 'createElement',
    function createElement() {
      var type = arguments[0]
      var config = arguments[1]
      var children =
        Array.prototype.slice.call(arguments, 2)
      var key = config.key
      var ref = config.ref
      var props = {}
      Object.keys(config).forEach(function (k) {
        if (k !== 'key' && k !== 'ref') {
          props[k] = config[k]
        }
      })
      return {
        $$typeof: Symbol.for('element'),
        type: type,
        key: key,
        ref: ref,
        props: props,
        children: children
      }
    })

  return Component
})()

function defineStaticMethod (Class, name, fn) {
  Object.defineProperty(Class, name, {
    configurable: true,
    writable: true,
    enumerable: false,
    value: Object.defineProperty(function () {
      'use strict'
      if (this &&
          !(this instanceof Class.constructor)
      ) {
        throw new TypeError(
          `${name} is not a constructor`)
      }
      return fn.apply(this, arguments)
    }, 'name', {
      configurable: true,
      writable: false,
      enumerable: false,
      value: name
    })
  })
}

function defineMethod (Class, name, fn) {
  Object.defineProperty(Class.prototype, name, {
    configurable: true,
    writable: true,
    enumerable: false,
    value: Object.defineProperty(function () {
      'use strict'
      if (this && !(this instanceof Class)) {
        throw new TypeError(
          `${name} is not a constructor`)
      }
      return fn.apply(this, arguments)
    }, 'name', {
      configurable: true,
      writable: false,
      enumerable: false,
      value: name
    })
  })
}

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