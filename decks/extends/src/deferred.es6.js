const _methods = new WeakMap()
const _state = new WeakMap()

class Deferred extends Promise {
  constructor (executor) {
    let methods

    super(function (_resolve, _reject) {
      function fulfill (value) {
        _state.set(_this, 'fulfilled')
        _resolve(value)
      }
      function reject (reason) {
        _state.set(_this, 'rejected')
        _reject(reason)
      }
      function resolve (value) {
        if (value && typeof value.then === 'function') {
          Promise.resolve(value).then(fulfill, reject)
        } else {
          fulfill(value)
        }
      }
      methods = {
        resolve: resolve,
        reject: reject
      }

      /* if (typeof executor === 'function') {
        try {
          executor(resolve, reject)
        } catch (err) {
          reject(err)
        }
      } */
    })

    const _this = this
    _state.set(_this, 'pending')
    _methods.set(_this, methods)
  }

  static get [Symbol.species] () {
    return Promise
  }

  resolve (value) {
    _methods.get(this).resolve(value)
  }

  reject (reason) {
    _methods.get(this).reject(reason)
  }

  get state () {
    return _state.get(this)
  }

  get [Symbol.toStringTag] () {
    return 'Deferred'
  }
}

function deferred () {
  return new Deferred()
}
