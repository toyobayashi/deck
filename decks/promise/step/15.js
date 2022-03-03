const PromiseStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

function triggerPromiseReaction (reactions, value, reactionType) {
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
      queueMicrotask(
        createFulfillTask(
          value,
          currentReaction.fulfillHandler,
          currentReaction.deferred
        )
      )
    } else {
      queueMicrotask(
        createRejectTask(
          value,
          currentReaction.rejectHandler,
          currentReaction.deferred
        )
      )
    }
  }
}

class MyPromise {
  constructor (executor) {
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
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
      triggerPromiseReaction(reactions, reason, PromiseReaction.Type.REJECT)
    }

    const fulfill = (value) => {
      const reactions = this._reactionsOrResult
      this._status = PromiseStatus.FULFILLED
      this._reactionsOrResult = value
      triggerPromiseReaction(reactions, value, PromiseReaction.Type.FULFILL)
    }

    const resolve = (value) => {
      if (this._status !== PromiseStatus.PENDING) return

      if ((value === null || typeof value !== 'object') && typeof value !== 'function') {
        fulfill(value)
        return
      }
    }

    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then (onfulfilled, onrejected) {
    return new MyPromise((resolve, reject) => {
      const resultPromiseDeferred = { resolve, reject }
      const onFulfilled = typeof onfulfilled === 'function' ? onfulfilled : undefined
      const onRejected = typeof onrejected === 'function' ? onrejected : undefined

      if (this._status === PromiseStatus.PENDING) {
        const reaction = new PromiseReaction(
          this._reactionsOrResult,
          onFulfilled,
          onRejected,
          resultPromiseDeferred
        )
        this._reactionsOrResult = reaction
      } else {
        if (this._status === PromiseStatus.FULFILLED) {
          queueMicrotask(
            createFulfillTask(
              this._reactionsOrResult,
              onFulfilled,
              resultPromiseDeferred
            )
          )
        } else {
          queueMicrotask(
            createRejectTask(
              this._reactionsOrResult,
              onRejected,
              resultPromiseDeferred
            )
          )
        }
      }

      this._hasHandler = true
    })
  }
}

function createFulfillTask (value, onfulfilled, resultPromiseDeferred) {
  return function () {
    try {
      typeof onfulfilled === 'function'
        ? resultPromiseDeferred.resolve(onfulfilled(value))
        : resultPromiseDeferred.resolve(value)
    } catch (err) {
      resultPromiseDeferred.reject(err)
    }
  }
}

function createRejectTask (reason, onrejected, resultPromiseDeferred) {
  return function () {
    try {
      typeof onrejected === 'function'
        ? resultPromiseDeferred.resolve(onrejected(reason))
        : resultPromiseDeferred.reject(reason)
    } catch (err) {
      resultPromiseDeferred.reject(err)
    }
  }
}

class PromiseReaction {
  constructor (next, fulfillHandler, rejectHandler, deferred) {
    this.next = next
    this.fulfillHandler = fulfillHandler
    this.rejectHandler = rejectHandler
    this.deferred = deferred
  }
}

PromiseReaction.Type = {
  FULFILL: 0,
  REJECT: 1
}