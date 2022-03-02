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
}