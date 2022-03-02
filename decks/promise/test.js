const promisesAplusTests = require("promises-aplus-tests")
const { MyPromise } = require('./promise.js')

function testAplus (adapter) {
  return new Promise((resolve, reject) => {
    promisesAplusTests(adapter, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function testEs () {
  return new Promise((resolve, reject) => {
    let r = ''
    Promise.all([
      MyPromise.resolve().then(() => {
        r += '0'
        return MyPromise.resolve(4)
      }).then(res => {
        r += res
      }),
  
      MyPromise.resolve().then(() => {
        r += '1'
      }).then(() => {
        r += '2'
      }).then(() => {
        r += '3'
      }).then(() => {
        r += '5'
      }).then(() => {
        r += '6'
      })
    ]).then(() => {
      console.log(r)
      if (r === '0123456') {
        resolve()
      } else {
        reject(new Error(`testEs: ${r}`))
      }
    })
  })
}

async function main () {
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

  await testAplus(adapter)
  await testEs()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
