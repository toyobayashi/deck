var Component = /*#__PURE__*/ (function () {
  /* ... */
})()

var canUseReflectConstruct =
  typeof Proxy === 'function' &&
  typeof Reflect !== 'undefined' &&
  typeof Reflect.construct === 'function'

function createSuper (Derived, Base) {
  return canUseReflectConstruct
    ? function () {
        return Reflect.construct(
          Base, arguments, Derived)
      }
    : function () {
        var bindArgs = [null]
        Array.prototype.push.apply(bindArgs, arguments)
        var BoundBase =
          Function.prototype.bind.apply(Base, bindArgs)
        var _this = new BoundBase()
        Object.setPrototypeOf(_this, Derived.prototype)
        return _this
      }
}

var App = /*#__PURE__*/ (function (Component) {
  'use strict'

  var _super = createSuper(App, Component)

  function App (props) {
    if (!(this instanceof App)) {
      throw new TypeError(
        'Class constructor App ' +
        "cannot be invoked without 'new'")
    }
    var _newTarget =
      Object.getPrototypeOf(this).constructor
    var _this = _super(props)
    // 这里开始 _this 可用
    console.log(_newTarget)
    _this.state = { count: 0 }

    return _this
  }

  inherit(App, Component)

  defineGetter(App, 'count', function () {
    return this.state.count
  })

  defineStaticGetter(App, 'displayName', function () {
    return 'App'
  })

  defineStaticField(App, 'defaultProps', {})

  return App
})(Component)

function defineStaticField (Class, name, value) {
  Object.defineProperty(Class, name, {
    configurable: true,
    writable: true,
    enumerable: true,
    value: value
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

function inherit (Derived, Base) {
  initializePrototype(Derived)
  Object.setPrototypeOf(Derived, Base)
  Object.setPrototypeOf(
    Derived.prototype, Base.prototype)
}