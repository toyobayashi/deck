var BaseError = /*#__PURE__*/ (function (Error) {
  'use strict'

  var _super = createSuper(BaseError, Error)

  function BaseError () {
    if (!(this instanceof BaseError)) {
      throw new TypeError(
        'Class constructor BaseError ' +
        "cannot be invoked without 'new'")
    }
    var _newTarget =
      Object.getPrototypeOf(this).constructor

    var _this = _super.apply(this, arguments)

    if (
      !canUseReflectConstruct &&
      typeof Error.captureStackTrace === 'function'
    ) {
      Error.captureStackTrace(_this, _newTarget)
    }

    return _this
  }

  inherit(BaseError, Error)

  defineMethod(BaseError, 'what',
    function what () {
      return this.message
    })

  Object.defineProperty(BaseError.prototype, 'name', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: 'BaseError'
  })

  return BaseError
})(Error)