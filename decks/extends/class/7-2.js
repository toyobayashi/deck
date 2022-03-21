var Component = /*#__PURE__*/ (function () {
  /* ... */
})()

var App = /*#__PURE__*/ (function (Component) {
  'use strict'

  var _super = createSuper(App, Component)

  function App () {
    if (!(this instanceof App)) {
      throw new TypeError(
        'Class constructor App ' +
        "cannot be invoked without 'new'")
    }
    var _this = _super.apply(this, arguments)

    return _this
  }

  inherit(App, Component)

  return App
})(Component)