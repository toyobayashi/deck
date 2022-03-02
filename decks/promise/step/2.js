class MyPromise {
  constructor (resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError(`Promise resolver ${resolver} is not a function`)
    }

    try {
      resolver(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
}