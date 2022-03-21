var Component = /*#__PURE__*/ (function () {
  'use strict'

  function Component (props, context, updater) {
    if (!(this instanceof Component)) {
      throw new TypeError(
        'Class constructor Component ' +
        "cannot be invoked without 'new'")
    }

    this.props = props
    this.context = context
    this.refs = {}
    this.updater = updater || {
      enqueueSetState: function (
        publicInstance,
        partialState,
        callback,
        callerName
      ) {
        if (typeof partialState === 'function') {
          Object.assign(publicInstance.state,
            partialState(publicInstance.state))
        } else {
          Object.assign(publicInstance.state, partialState)
        }
        if (typeof callback === 'function') {
          Promise.resolve().then(callback)
        }
      }
    }
  }

  initializePrototype(Component)

  defineStaticMethod(Component, 'createElement',
    function createElement() {
      var type = arguments[0]
      var config = arguments[1]
      var children = Array.prototype.slice.call(arguments, 2)
      var key = config.key
      var ref = config.ref
      var props = {}
      Object.keys(config).forEach(function (k) {
        if (k !== 'key' && k !== 'ref') {
          props[k] = config[k]
        }
      })
      return {
        $$typeof: Symbol.for('element'),
        type,
        key,
        ref,
        props,
        children
      }
    })

  defineMethod(Component, 'setState',
    function setState (partialState, callback) {
      this.updater.enqueueSetState(this,
        partialState, callback, 'setState')
    })

  return Component
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

    var _newTarget = Object.getPrototypeOf(this).constructor
    var _this = _super(props)
    console.log(_newTarget)
    _this.state = { count: 0 }
    _this.onClick = _this.add.bind(_this)

    return _this
  }

  inherit(App, Component)

  defineStaticMethod(App, 'getDerivedStateFromProps',
    function getDerivedStateFromProps (props, state) {
      return null
    })

  defineStaticField(App, 'defaultProps', {})
  defineStaticGetter(App, 'displayName', function () {
    return 'App'
  })

  defineGetter(App, 'count', function () {
    return this.state.count
  })

  defineMethod(App, 'add', function add () {
    this.setState({
      count: this.count + 1
    })
  })

  defineMethod(App, 'render', function render () {
    return App.createElement(
      'div', {},
      App.createElement(
        'p',
        { onClick: this.onClick },
        `count: ${this.count}`
      )
    )
  })

  return App
})(Component)
