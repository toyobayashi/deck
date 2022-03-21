class Deferred extends Promise {
  #methods
  #state

  constructor () {
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
    })

    this.#state = 'pending'
    this.#methods = methods
  }
}