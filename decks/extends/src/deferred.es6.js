class Deferred extends Promise {
  #methods
  #state

  constructor (/* executor */) {
    let methods

    super((_resolve, _reject) => {
      const fulfill = (value) => {
        this.#state = 'fulfilled'
        _resolve(value)
      }
      const reject = (reason) => {
        this.#state = 'rejected'
        _reject(reason)
      }
      const resolve = (value) => {
        if (
          (typeof value === 'object' && value !== null) ||
          typeof value === 'function'
        ) {
          let then
          try {
            then = value.then
          } catch (err) {
            reject(err)
            return
          }
          if (typeof then === 'function') {
            Promise.resolve(value).then(fulfill, reject)
          } else {
            fulfill(value)
          }
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

    this.#state = 'pending'
    this.#methods = methods
  }

  static get [Symbol.species] () {
    return Promise
  }

  resolve (value) {
    this.#methods.resolve(value)
  }

  reject (reason) {
    this.#methods.reject(reason)
  }

  get state () {
    return this.#state
  }

  get [Symbol.toStringTag] () {
    return 'Deferred'
  }
}

function deferred () {
  return new Deferred()
}
