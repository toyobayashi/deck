class BaseError extends Error {
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
