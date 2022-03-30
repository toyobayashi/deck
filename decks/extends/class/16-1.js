class Deferred extends Promise {
  #methods
  #state

  constructor () {
    let methods

    super((_resolve, _reject) => {
      const fulfill = (value) => {

      }
      const reject = (reason) => {

      }
      const resolve = (value) => {

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