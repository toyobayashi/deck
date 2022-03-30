/** @abstract */
class Component {
  static createElement (type, config, ...children) {
    const { key, ref, ...props } = config
    return {
      $$typeof: Symbol.for('element'),
      type,
      key,
      ref,
      props,
      children
    }
  }

  constructor (props, context, updater) {
    this.props = props
    this.context = context
    this.refs = {}
    this.updater = updater || {
      enqueueSetState (
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

  setState (partialState, callback) {
    this.updater.enqueueSetState(this,
      partialState, callback, 'setState')
  }
}

class App extends Component {
  get count () {
    return this.state.count
  }

  constructor (props) {
    super(props)
    console.log(new.target)
    this.state = { count: 0 }
    this.onClick = this.add.bind(this)
  }

  add () {
    this.setState({
      count: this.count + 1
    })
  }

  render () {
    return App.createElement(
      'div', {},
      App.createElement(
        'p',
        { onClick: this.onClick },
        `count: ${this.count}`
      )
    )
  }

  static defaultProps = {}

  static get displayName () {
    return 'App'
  }
}
