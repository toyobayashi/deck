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

class MyPromise {
  constructor (resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError(`Promise resolver ${resolver} is not a function`)
    }

    this._status = PromiseStatus.PENDING // Promise 状态
    this._result = undefined // 成功值
    this._reason = undefined // 失败值

    // then 和 catch 可以调用多次，所以需要队列
    this._onSuccess = [] // 成功事件队列
    this._onFail = [] // 失败事件队列

    // 传给 resolver 的 reject 函数
    const reject = (reason) => {
      if (this._status === PromiseStatus.PENDING) {
        this._status = PromiseStatus.REJECTED
        this._reason = reason // 保存失败原因
        this._onSuccess.length = 0 // 清空成功事件队列
        // 微任务走 catch 回调
        queueMicrotask(() => {
          while (this._onFail.length) {
            this._onFail.shift()()
          }
        })
      }
    }

    // resolve 的最后一步 修改状态
    const _resolve = (value) => {
      // 确保这里传进来的 value 不是 Thenable
      // 和上面 reject 同理
      this._status = PromiseStatus.FULFILLED
      this._result = value
      this._onFail.length = 0
      queueMicrotask(() => {
        while (this._onSuccess.length) {
          this._onSuccess.shift()()
        }
      })
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
          if (value === this) {
            // Thenable 不能是自己
            reject(new TypeError('Chaining cycle detected for promise'))
            return
          }
          let called = false // 确保 resolve 或 reject 只被调用一次
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
      // 成功和失败都包一层，让新返回的 Promise 有结果
      const onSuccess = () => {
        try {
          typeof onfulfilled === 'function'
            ? resolve(onfulfilled(this._result))
            : resolve(this._result)
        } catch (err) {
          reject(err)
        }
      }
      const onFail = () => {
        try {
          typeof onrejected === 'function'
            ? resolve(onrejected(this._reason))
            : reject(this._reason)
        } catch (err) {
          reject(err)
        }
      }

      if (this._status === PromiseStatus.FULFILLED) {
        // 已成功，直接微任务走成功回调
        queueMicrotask(onSuccess)
      } else if (this._status === PromiseStatus.REJECTED) {
        // 已失败，直接微任务走失败回调
        queueMicrotask(onFail)
      } else {
        // PENDING 状态就像监听事件一样，往队列里塞
        this._onSuccess.push(onSuccess)
        this._onFail.push(onFail)
      }
    })
  }

  ['catch'] (onrejected) {
    return this.then(_ => _, onrejected)
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
