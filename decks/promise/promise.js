'use strict'

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

const PromiseStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
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

const MyPromiseReactionType = {
  FULFILL: 'fulfill',
  REJECT: 'reject'
}

function triggerPromiseReaction (reactions, reactionType) {
  let current = reactions
  let reversed = null
  // 链表反转
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

    if (reactionType === MyPromiseReactionType.FULFILL) {
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

    /**
     * Promise 状态
     * @type {PromiseStatus}
     */
    this._status = PromiseStatus.PENDING

    /**
     * PENDING 状态为回调链表
     * 非 PENDING 状态为成功值或失败值
     */
    this._reactionsOrResult = null

    /**
     * 是否有 then 或 catch 回调
     * @type {boolean}
     */
    this._hasHandler = false

    // 传给 resolver 的 reject 函数
    const reject = (reason) => {
      if (this._status !== PromiseStatus.PENDING) return

      // 检查是否添加了 then 或 catch 回调
      if (!this._hasHandler) {
        // 异步再检查一次，因为 then 会同步设置 _hasHandler 为 true
        // 如果错误无法向下传播就报错
        queueMicrotask(() => {
          if (!this._hasHandler) {
            console.error('UnhandledPromiseRejectionWarning: ', reason)
          }
        })
      }

      const reactions = this._reactionsOrResult // 链表
      this._status = PromiseStatus.REJECTED // 修改状态
      this._reactionsOrResult = reason // 保存失败原因
      // 反转链表后，逐个塞入微任务队列
      triggerPromiseReaction(reactions, MyPromiseReactionType.REJECT)
    }

    // resolve 的最后一步 修改状态
    const _resolve = (value) => {
      // 确保这里传进来的 value 不是 Thenable 对象
      // 和上面 reject 同理
      const reactions = this._reactionsOrResult
      this._status = PromiseStatus.FULFILLED
      this._reactionsOrResult = value
      triggerPromiseReaction(reactions, MyPromiseReactionType.FULFILL)
    }

    // 传给 resolver 的 resolve 函数
    const resolve = (value) => {
      if (this._status !== PromiseStatus.PENDING) return
      if ((value !== null && typeof value === 'object') || typeof value === 'function') {
        // 对象或函数可能是 Thenable

        let then
        try {
          then = value.then // 如果 then 是 getter 可能会抛异常
        } catch (err) {
          reject(err)
          return
        }

        if (typeof then === 'function') {
          // Thenable 不能是自己
          if (value === this) {
            reject(new TypeError('Chaining cycle detected for promise'))
            return
          }
          let called = false // 确保 resolve 或 reject 只被调用一次

          // ES规范：确保在对任何周围代码的评估完成后对 then 方法进行评估
          queueMicrotask(() => {
            try {
              then.call(value, (v) => {
                if (called) return
                called = true
                resolve(v)
              }, (e) => {
                if (called) return
                called = true
                reject(e)
              })
            } catch (err) {
              if (called) return
              reject(err)
            }
          })
        } else {
          // then 不是函数，value 不是 Thenable
          _resolve(value)
        }
      } else {
        // value 不是 Thenable
        _resolve(value)
      }
    }

    // 同步执行 resolver，抛异常就进 reject
    try {
      resolver(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  static resolve (value) {
    return new MyPromise((resolve) => { resolve(value) })
  }

  static reject (reason) {
    return new MyPromise((_, reject) => { reject(reason) })
  }

  then (onfulfilled, onrejected) {
    return new MyPromise((resolve, reject) => {
      const resultPromiseDeferred = { resolve, reject }

      if (this._status === PromiseStatus.PENDING) {
        // PENDING 状态就像监听事件一样，往队列里塞
        const reaction = new PromiseReaction(
          this._reactionsOrResult,
          createFulfillHandler(this, onfulfilled, resultPromiseDeferred),
          createRejectHandler(this, onrejected, resultPromiseDeferred)
        )
        this._reactionsOrResult = reaction
      } else {
        if (this._status === PromiseStatus.FULFILLED) {
          // 已成功，直接微任务走成功回调
          queueMicrotask(createFulfillHandler(this, onfulfilled, resultPromiseDeferred))
        } else {
          // 已失败，直接微任务走失败回调
          queueMicrotask(createRejectHandler(this, onrejected, resultPromiseDeferred))
        }
      }

      this._hasHandler = true
    })
  }

  // 以下可以不看了，都是基于上面的实现

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

Object.defineProperty(exports, '__esModule', { value: true })
exports.MyAggregateError = MyAggregateError
exports.MyPromise = MyPromise
