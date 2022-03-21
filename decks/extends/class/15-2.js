var Deferred = /*#__PURE__*/ (function (Promise) {
  'use strict'

  var _super = createSuper(Deferred, Promise)

  function Deferred () {
    if (!(this instanceof Deferred)) {
      throw new TypeError(
        'Class constructor Deferred ' +
        "cannot be invoked without 'new'")
    }

    var _this = _super(function (_resolve, _reject) {

    })

    return _this
  }
  inherit(Deferred, Promise)

  return Deferred
})(Promise)