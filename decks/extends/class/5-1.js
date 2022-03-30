class Component {
  constructor (props, context, updater) {
    this.props = props
    this.context = context
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
          Object.assign(publicInstance.state,
            partialState)
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
}