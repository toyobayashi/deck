const promisesAplusTests = require("promises-aplus-tests")
const { MyPromise } = require('./promise.js')

const adapter = {
  resolved: MyPromise.resolve.bind(MyPromise),
  rejected: MyPromise.reject.bind(MyPromise),
  deferred () {
    const r = {}
    const promise = new MyPromise((resolve, reject) => {
      r.resolve = resolve
      r.reject = reject
    })
    r.promise = promise
    return r
  }
}

promisesAplusTests(adapter, (err) => {
  console.error(err)
})
