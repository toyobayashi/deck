class BaseError extends Error {
  constructor (message) {
    super(message)
    const Ctor = new.target

    if (!(this instanceof Ctor)) {
      Object.setPrototypeOf(this, Ctor.prototype)

      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, Ctor)
      }
    }
  }

  /** @virtual */
  what () {
    return this.message
  }
}

Object.defineProperty(BaseError.prototype, 'name', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: 'BaseError'
})
