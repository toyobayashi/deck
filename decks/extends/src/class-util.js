var canUseReflectConstruct = typeof Proxy === 'function' && typeof Reflect !== 'undefined' && typeof Reflect.construct === 'function'
// var canUseReflectConstruct = false

function createSuper (SubClass, SuperClass) {
  return canUseReflectConstruct
    ? function () {
        var args = Array.prototype.slice.call(arguments)
        var newTarget = SubClass // Object.getPrototypeOf(this).constructor
        return Reflect.construct(SuperClass, args, newTarget)
      }
    : function () {
        var args = Array.prototype.slice.call(arguments)
        var bindArgs = [null]
        Array.prototype.push.apply(bindArgs, args)
        var boundSuperClass = Function.prototype.bind.apply(SuperClass, bindArgs)
        var _this = new boundSuperClass()
        Object.setPrototypeOf(_this, SubClass.prototype)
        return _this
      }
}

function initializePrototype (Class) {
  Object.defineProperty(Class, 'prototype', {
    configurable: false,
    enumerable: false,
    writable: false
  })
  Object.defineProperty(Class.prototype, 'constructor', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: Class
  })
}

function inherit (SubClass, SuperClass) {
  initializePrototype(SubClass)
  Object.setPrototypeOf(SubClass, SuperClass)
  Object.setPrototypeOf(SubClass.prototype, SuperClass.prototype)
}

function defineMethods (Class, options) {
  options = options || {}
  var keys = Object.keys(options)
  for (var i = 0; i < keys.length; ++i) {
    var name = keys[i]
    defineMethod(Class, name, options[name])
  }
}

function defineStaticMethods (Class, options) {
  options = options || {}
  var keys = Object.keys(options)
  for (var i = 0; i < keys.length; ++i) {
    var name = keys[i]
    defineStaticMethod(Class, name, options[name])
  }
}

function defineMethod (Class, name, fn) {
  Object.defineProperty(Class.prototype, name, {
    configurable: true,
    writable: true,
    enumerable: false,
    value: Object.defineProperty(function () {
      'use strict'
      if (this && !(this instanceof Class)) {
        throw new TypeError(`${name} is not a constructor`)
      }
      var args = Array.prototype.slice.call(arguments)
      return fn.apply(this, args)
    }, 'name', {
      configurable: true,
      writable: false,
      enumerable: false,
      value: name
    })
  })
}

function defineStaticMethod (Class, name, fn) {
  Object.defineProperty(Class, name, {
    configurable: true,
    writable: true,
    enumerable: false,
    value: Object.defineProperty(function () {
      'use strict'
      if (this && !(this instanceof Class.constructor)) {
        throw new TypeError(`${name} is not a constructor`)
      }
      var args = Array.prototype.slice.call(arguments)
      return fn.apply(this, args)
    }, 'name', {
      configurable: true,
      writable: false,
      enumerable: false,
      value: name
    })
  })
}

function defineGetter (Class, name, fn) {
  Object.defineProperty(Class.prototype, name, {
    configurable: true,
    enumerable: false,
    get: Object.defineProperty(fn, 'name', {
      configurable: true,
      writable: false,
      enumerable: false,
      value: name
    })
  })
}

function defineStaticGetter (Class, name, fn) {
  Object.defineProperty(Class, name, {
    configurable: true,
    enumerable: false,
    get: Object.defineProperty(fn, 'name', {
      configurable: true,
      writable: false,
      enumerable: false,
      value: name
    })
  })
}

function defineStaticField (Class, name, value) {
  Object.defineProperty(Class, name, {
    configurable: true,
    writable: true,
    enumerable: true,
    value: value
  })
}
