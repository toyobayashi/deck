var Component = /*#__PURE__*/ (function () {
  /* ... */
})()

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

  return App
})(Component)