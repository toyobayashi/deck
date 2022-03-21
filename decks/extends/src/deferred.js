var Deferred = /*#__PURE__*/ (function (SuperClass) {
  'use strict'

  var _super = createSuper(Deferred, SuperClass)

  var _methods = new WeakMap()
  var _state = new WeakMap()

  function Deferred (executor) {
    if (!(this instanceof Deferred)) {
      throw new TypeError("Class constructor Deferred cannot be invoked without 'new'")
    }

    var methods

    var _this = _super(function (_resolve, _reject) {
      function fulfill (value) {
        _state.set(_this, 'fulfilled')
        _resolve(value)
      }
      function reject (reason) {
        _state.set(_this, 'rejected')
        _reject(reason)
      }
      function resolve (value) {
        if (
          (typeof value === 'object' && value !== null) ||
          typeof value === 'function'
        ) {
          let then
          try {
            then = value.then
          } catch (err) {
            reject(err)
            return
          }
          if (typeof then === 'function') {
            Promise.resolve(value).then(fulfill, reject)
          } else {
            fulfill(value)
          }
        } else {
          fulfill(value)
        }
      }
      methods = {
        resolve: resolve,
        reject: reject
      }

      /* if (typeof executor === 'function') {
        try {
          executor(resolve, reject)
        } catch (err) {
          reject(err)
        }
      } */
    })

    _state.set(_this, 'pending')
    _methods.set(_this, methods)

    return _this
  }
  inherit(Deferred, SuperClass)

  defineStaticGetter(Deferred, Symbol.species, function () {
    return Promise
  })

  defineMethods(Deferred, {
    resolve: function resolve (value) {
      _methods.get(this).resolve(value)
    },
    reject: function reject (reason) {
      _methods.get(this).reject(reason)
    }
  })

  defineGetter(Deferred, 'state', function () {
    return _state.get(this)
  })

  Object.defineProperty(Deferred.prototype, Symbol.toStringTag, {
    value: 'Deferred'
  })

  return Deferred
})(Promise)


function deferred () {
  return new Deferred()
}
