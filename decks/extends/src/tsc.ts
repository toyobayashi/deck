declare interface ErrorConstructor {
  captureStackTrace<
    E extends Error,
    C extends new (message?: string) => Error
  > (error: E, constructorOpt?: C): void
}

class BaseError extends Error {
  constructor (message?: string) {
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
