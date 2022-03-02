const PromiseStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

function triggerPromiseReaction (reactions, reactionType) {
  let current = reactions
  let reversed = null
  while (current !== null) {
    let currentReaction = current
    current = currentReaction.next
    currentReaction.next = reversed
    reversed = currentReaction
  }

  current = reversed
  while (current !== null) {
    let currentReaction = current
    current = currentReaction.next

    if (reactionType === PromiseReaction.Type.FULFILL) {
      queueMicrotask(currentReaction.fulfillHandler)
    } else {
      queueMicrotask(currentReaction.rejectHandler)
    }
  }
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
      if (this._status !== PromiseStatus.PENDING) return

      if (!this._hasHandler) {
        queueMicrotask(() => {
          if (!this._hasHandler) {
            console.error('UnhandledPromiseRejectionWarning: ', reason)
          }
        })
      }

      const reactions = this._reactionsOrResult
      this._status = PromiseStatus.REJECTED
      this._reactionsOrResult = reason
      triggerPromiseReaction(reactions, PromiseReaction.Type.REJECT)
    }

    const _resolve = (value) => {
      const reactions = this._reactionsOrResult
      this._status = PromiseStatus.FULFILLED
      this._reactionsOrResult = value
      triggerPromiseReaction(reactions, PromiseReaction.Type.FULFILL)
    }

    const resolve = (value) => {
      if (this._status !== PromiseStatus.PENDING) return

      if ((value !== null && typeof value === 'object') || typeof value === 'function') {
        let then
        try {
          then = value.then
        } catch (err) {
          reject(err)
          return
        }

        if (typeof then === 'function') {
          if (value === this) {
            reject(new TypeError('Chaining cycle detected for promise'))
            return
          }

          queueMicrotask(() => {
            let called = false

            const onfulfilled = (v) => {
              if (called) return
              called = true
              resolve(v)
            }

            const onrejected = (e) => {
              if (called) return
              called = true
              reject(e)
            }

            try {
              then.call(value, onfulfilled, onrejected)
            } catch (err) {
              onrejected(err)
            }
          })
        } else {
          _resolve(value)
        }
      } else {
        _resolve(value)
      }
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
          queueMicrotask(createFulfillHandler(this, onfulfilled, resultPromiseDeferred))
        } else {
          queueMicrotask(createRejectHandler(this, onrejected, resultPromiseDeferred))
        }
      }

      this._hasHandler = true
    })
  }

  ['catch'] (onrejected) {
    return this.then(undefined, onrejected)
  }

  ['finally'] (onsettled) {
    return this.then((value) => {
      if (typeof onsettled === 'function') {
        return MyPromise.resolve(onsettled()).then(() => value)
      }
      return value
    }, (reason) => {
      if (typeof onsettled === 'function') {
        return MyPromise.resolve(onsettled()).then(() => { throw reason })
      }
      throw reason
    })
  }

  static resolve (value) {
    return new MyPromise((resolve) => { resolve(value) })
  }

  static reject (reason) {
    return new MyPromise((_, reject) => { reject(reason) })
  }

  static all (iterable) {
    return new MyPromise((resolve, reject) => {
      let size = 0
      let complete = 0
      const promises = []
      const result = []
      for (const promise of iterable) {
        size++
        promises.push(MyPromise.resolve(promise))
      }
      if (size === 0) {
        resolve(result)
        return
      }
      promises.forEach((p, i) => {
        p.then((value) => {
          complete++
          result[i] = value
          if (size === complete) {
            resolve(result)
          }
        }, reject)
      })
    })
  }

  static race (iterable) {
    return new MyPromise((resolve, reject) => {
      for (const p of iterable) {
        MyPromise.resolve(p).then(resolve, reject)
      }
    })
  }

  static allSettled (iterable) {
    return new MyPromise((resolve) => {
      let size = 0
      let complete = 0
      const promises = []
      const result = []
      for (const promise of iterable) {
        size++
        promises.push(MyPromise.resolve(promise))
      }
      if (size === 0) {
        resolve(result)
        return
      }
      promises.forEach((p, i) => {
        p.then((value) => {
          complete++
          result[i] = {
            status: p._status,
            value: value
          }
          if (size === complete) {
            resolve(result)
          }
        }, (reason) => {
          complete++
          result[i] = {
            status: p._status,
            reason: reason
          }
          if (size === complete) {
            resolve(result)
          }
        })
      })
    })
  }

  static any (iterable) {
    return new MyPromise((resolve, reject) => {
      let size = 0
      let complete = 0
      const promises = []
      const errors = []
      for (const promise of iterable) {
        size++
        promises.push(MyPromise.resolve(promise))
      }
      if (size === 0) {
        reject(new MyAggregateError(errors, 'All promises were rejected'))
        return
      }
      promises.forEach((p, i) => {
        p.then(resolve, (reason) => {
          complete++
          errors[i] = reason
          if (size === complete) {
            reject(new MyAggregateError(errors, 'All promises were rejected'))
          }
        })
      })
    })
  }
}

class MyAggregateError extends Error {
  get name () {
    return 'MyAggregateError'
  }

  constructor (errors, message) {
    super(message)
    if (typeof errors[Symbol.iterator] !== 'function') {
      throw new TypeError(`${typeof errors} ${errors} is not iterable`)
    }
    this.errors = errors
  }
}

function createFulfillHandler (promise, onfulfilled, resultPromiseDeferred) {
  return function () {
    try {
      typeof onfulfilled === 'function'
        ? resultPromiseDeferred.resolve(onfulfilled(promise._reactionsOrResult))
        : resultPromiseDeferred.resolve(promise._reactionsOrResult)
    } catch (err) {
      resultPromiseDeferred.reject(err)
    }
  }
}

function createRejectHandler (promise, onrejected, resultPromiseDeferred) {
  return function () {
    try {
      typeof onrejected === 'function'
        ? resultPromiseDeferred.resolve(onrejected(promise._reactionsOrResult))
        : resultPromiseDeferred.reject(promise._reactionsOrResult)
    } catch (err) {
      resultPromiseDeferred.reject(err)
    }
  }
}

class PromiseReaction {
  constructor (next, fulfillHandler, rejectHandler) {
    this.next = next
    this.fulfillHandler = fulfillHandler
    this.rejectHandler = rejectHandler
  }
}

PromiseReaction.Type = {
  FULFILL: 0,
  REJECT: 1
}