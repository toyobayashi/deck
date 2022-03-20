var BaseError = /*#__PURE__*/ (function (SuperClass) {
  'use strict'

  var _super = createSuper(BaseError, SuperClass)

  function BaseError (message) {
    if (!(this instanceof BaseError)) {
      throw new TypeError("Class constructor BaseError cannot be invoked without 'new'")
    }
    var _newTarget = this.constructor

    var _this = _super([message])

    if (!canUseReflectConstruct && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(_this, _newTarget)
    }

    return _this
  }

  inherit(BaseError, SuperClass)

  defineMethods(BaseError, {
    what: function () {
      return this.message
    }
  })

  Object.defineProperty(BaseError.prototype, 'name', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: 'BaseError'
  })

  return BaseError
})(Error)
