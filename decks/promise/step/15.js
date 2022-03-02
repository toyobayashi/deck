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