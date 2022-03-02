const PromiseStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

class MyPromise {
  constructor (resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError(`Promise resolver ${resolver} is not a function`)
    }

    this._status = PromiseStatus.PENDING
    this._hasHandler = false
    this._reactionsOrResult = null

    const reject = (reason) => {

    }

    const resolve = (value) => {
      
    }

    try {
      resolver(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then (onfulfilled, onrejected) {
    return new MyPromise((resolve, reject) => {
      const resultPromiseDeferred = { resolve, reject }

      if (this._status === PromiseStatus.PENDING) {
        const reaction = new PromiseReaction(
          this._reactionsOrResult,
          createFulfillHandler(this, onfulfilled, resultPromiseDeferred),
          createRejectHandler(this, onrejected, resultPromiseDeferred)
        )
        this._reactionsOrResult = reaction
      } else {
        if (this._status === PromiseStatus.FULFILLED) {

        } else {

        }
      }

      this._hasHandler = true
    })
  }
}