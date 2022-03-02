class MyPromise {
  constructor (resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError(`Promise resolver ${resolver} is not a function`)
    }

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