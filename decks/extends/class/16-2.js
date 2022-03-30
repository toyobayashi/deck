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

      }
      function reject (reason) {

      }
      function resolve (value) {

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