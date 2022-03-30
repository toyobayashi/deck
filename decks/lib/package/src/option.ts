/* eslint-disable @typescript-eslint/method-signature-style */

import { Enum, Variant } from './enum'

/** @internal */
export class Some<T> extends Variant<[T]> {}

/** @internal */
export class None extends Variant<[]> {}

/** @internal */
export type OptionVariants<T> = {
  None: new (p: []) => None
  Some: new (p: [T]) => Some<T>
}

/** @public */
export interface IRefMut<T> {
  get (): T
  set (v: T): void
}

class RefMut<T> implements IRefMut<T> {
  private value!: T

  constructor (getter: () => T, setter: (v: T) => void) {
    Object.defineProperty(this, 'value', {
      configurable: true,
      enumerable: true,
      get: getter,
      set: setter
    })
  }

  get (): T {
    return this.value
  }

  set (v: T): void {
    this.value = v
  }
}

/** @public */
export class OptionIterator<T> implements Iterator<Option<T>> {
  private _done = false
  constructor (private readonly option: Option<T>) {}
  next (): IteratorResult<Option<T>, any> {
    if (this._done) {
      return {
        done: true,
        value: undefined
      }
    }
    this._done = true
    return {
      done: false,
      value: this.option.clone()
    }
  }
}

/** @public */
export class Option<T> extends Enum<OptionVariants<T>> {
  public get variants (): OptionVariants<T> {
    return {
      None,
      Some
    }
  }

  public static default<T> (): Option<T> {
    return Option.None<T>()
  }

  public static from<T> (o: Option<T>): Option<T> {
    return o.clone()
  }

  public isSome (): boolean {
    return this.variant instanceof Some
  }

  public isNone (): boolean {
    return this.variant instanceof None
  }

  public and<U> (value: Option<U>): Option<U> {
    if (this.variant instanceof None) {
      return Option.None<U>()
    }
    return value
  }

  public andThen<U> (f: (value: T) => Option<U>): Option<U> {
    if (this.variant instanceof None) {
      return Option.None<U>()
    }
    return f(this.variant.payload[0])
  }

  public filter (f: (value: T) => boolean): Option<T> {
    if (this.variant instanceof None) {
      return Option.None<T>()
    }
    const value = this.variant.payload[0]
    const r = f(value)
    return r ? Option.Some(value) : Option.None<T>()
  }

  public or (value: Option<T>): Option<T> {
    if (this.variant instanceof None) {
      return value
    }
    return Option.Some(this.variant.payload[0])
  }

  public orElse (f: () => Option<T>): Option<T> {
    if (this.variant instanceof None) {
      return f()
    }
    return Option.Some(this.variant.payload[0])
  }

  public xor (value: Option<T>): Option<T> {
    if (this.variant instanceof None && value.variant instanceof Some) {
      return value
    }
    if (this.variant instanceof Some && value.variant instanceof None) {
      return Option.Some(this.variant.payload[0])
    }
    return Option.None()
  }

  public insert (value: T): IRefMut<T> {
    this.variant = new Some([value])
    return new RefMut<T>(
      () => this.variant.payload[0]!,
      (v: T) => { this.variant.payload[0] = v }
    )
  }

  public flatten (): T extends Option<infer U> ? Option<U> : Option<T> {
    if (this.variant instanceof None) {
      return Option.None() as any
    }
    if (this.variant.payload[0] instanceof Option) {
      return Option.Some(this.variant.payload[0].variant.payload[0]) as any
    }
    return Option.Some(this.variant.payload[0]) as any
  }

  public getOrInsert (value: T): IRefMut<T> {
    if (this.variant instanceof None) {
      this.variant = new Some([value])
    }
    return new RefMut<T>(
      () => this.variant.payload[0]!,
      (v: T) => { this.variant.payload[0] = v }
    )
  }

  public getOrInsertWith (f: () => T): IRefMut<T> {
    if (this.variant instanceof None) {
      this.variant = new Some([f()])
    }
    return new RefMut<T>(
      () => this.variant.payload[0]!,
      (v: T) => { this.variant.payload[0] = v }
    )
  }

  public replace (value: T): Option<T> {
    const old = this.variant instanceof None ? Option.None<T>() : Option.Some(this.variant.payload[0])
    this.variant = new Some([value])
    return old
  }

  public take (): Option<T> {
    const old = this.variant instanceof None ? Option.None<T>() : Option.Some(this.variant.payload[0])
    this.variant = new None([])
    return old
  }

  public zip<U> (other: Option<U>): Option<[T, U]> {
    if (this.variant instanceof Some && other.variant instanceof Some) {
      return Option.Some([this.variant.payload[0], other.variant.payload[0]] as [T, U])
    }
    return Option.None<[T, U]>()
  }

  public zipWith<U, R> (other: Option<U>, f: (s: T, o: U) => R): Option<R> {
    if (this.variant instanceof Some && other.variant instanceof Some) {
      return Option.Some(f(this.variant.payload[0], other.variant.payload[0]))
    }
    return Option.None<R>()
  }

  public contains<U> (x: U): boolean {
    if (this.variant instanceof None) {
      return false
    }
    return Object.is(this.variant.payload[0], x)
  }

  public map<U> (f: (value: T) => U): Option<U> {
    if (this.variant instanceof None) {
      return Option.None<U>()
    }
    return Option.Some(f(this.variant.payload[0]))
  }

  public mapOr<U> (defaultValue: U, f: (value: T) => U): U {
    if (this.variant instanceof None) {
      return defaultValue
    }
    return f(this.variant.payload[0])
  }

  public mapOrElse<U> (defaultF: () => U, f: (value: T) => U): U {
    if (this.variant instanceof None) {
      return defaultF()
    }
    return f(this.variant.payload[0])
  }

  public clone (): Option<T> {
    if (this.variant instanceof None) {
      return Option.None<T>()
    }
    return Option.Some(this.variant.payload[0])
  }

  public unwrap (): T {
    if (this.variant instanceof None) {
      throw new Error('Unwrap None')
    }
    return this.variant.payload[0]
  }

  public unwrapOr (defaultValue: T): T {
    if (this.variant instanceof None) {
      return defaultValue
    }
    return this.variant.payload[0]
  }

  public expect (msg: string): T {
    if (this.variant instanceof None) {
      throw new Error(msg)
    }
    return this.variant.payload[0]
  }

  public unwrapOrElse (f: () => T): T {
    if (this.variant instanceof None) {
      return f()
    }
    return this.variant.payload[0]
  }

  public iter (): OptionIterator<T> {
    return new OptionIterator<T>(this)
  }

  public [Symbol.iterator] (): OptionIterator<T> {
    return new OptionIterator<T>(this)
  }

  public static Some<T> (value: T): Option<T> {
    return new Option<T>(new Some<T>([value]))
  }

  public static None<T> (): Option<T> {
    return new Option<T>(new None([]))
  }
}
