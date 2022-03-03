const PromiseStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

class MyPromise {
  constructor (executor) {
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }

    this._status = PromiseStatus.PENDING
    this._hasHandler = false

    const reject = (reason) => {

    }

    const resolve = (value) => {
      
    }

    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then (onfulfilled, onrejected) {
    return new MyPromise((resolve, reject) => {
      if (this._status === PromiseStatus.PENDING) {

      } else {
        if (this._status === PromiseStatus.FULFILLED) {

        } else {

        }
      }

      this._hasHandler = true
    })
  }
}