var BaseError = /*#__PURE__*/ (function (Error) {
  'use strict'

  var _super = createSuper(BaseError, Error)

  function BaseError () {
    if (!(this instanceof BaseError)) {
      throw new TypeError(
        'Class constructor BaseError ' +
        "cannot be invoked without 'new'")
    }

    var _this = _super.apply(this, arguments)

    return _this
  }

  inherit(BaseError, Error)

  defineMethod(BaseError, 'what',
    function what () {
      return this.message
    })

  return BaseError
})(Error)