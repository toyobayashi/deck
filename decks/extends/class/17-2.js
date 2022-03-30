var Deferred = /*#__PURE__*/ (function (Promise) {
  'use strict'

  var _super = createSuper(Deferred, Promise)

  var _methods = new WeakMap()
  var _state = new WeakMap()

  function Deferred () {
    if (!(this instanceof Deferred)) {
      throw new TypeError(
        'Class constructor Deferred ' +
        "cannot be invoked without 'new'")
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
          var then
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
    })

    _state.set(_this, 'pending')
    _methods.set(_this, methods)

    return _this
  }
  inherit(Deferred, Promise)

  return Deferred
})(Promise)