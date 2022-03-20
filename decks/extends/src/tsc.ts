declare interface ErrorConstructor {
  captureStackTrace (error: object, constructorOpt?: Function): void
}

class BaseError extends Error {
  constructor (message?: string) {
    super(message)
    const Ctor = new.target

    if (!(this instanceof Ctor)) {
      // TypeScript compiler ES5 target
      Object.setPrototypeOf(this, Ctor.prototype)

      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, Ctor)
      }
    }
  }

  /** @virtual */
  what (): string {
    return this.message
  }
}

Object.defineProperty(BaseError.prototype, 'name', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: 'BaseError'
})
