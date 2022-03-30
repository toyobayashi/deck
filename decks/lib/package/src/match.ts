import type { Enum } from './enum'

/** @public */
export type Branches<E extends Enum, R = any> = {
  [K in keyof E['variants']]: (...args: InstanceType<E['variants'][K]>['payload']) => R
}

/** @public */
export type MatchBranches<E extends Enum, R = any> = Branches<E, R> | (Partial<Branches<E, R>> & { _: () => R })

/** @public */
export function matchEnum<E extends Enum, R = any> (e: E): (branches: MatchBranches<E, R>) => R {
  const variants = e.variants
  return function (branches) {
    const names = Object.keys(variants)
    for (let i = 0; i < names.length; ++i) {
      if (e.variant instanceof variants[names[i]]) {
        const handler = branches[names[i]]
        if (typeof handler === 'function') {
          return handler(...e.variant.payload)
        } else {
          return branches._()
        }
      }
    }
    return branches._()
  }
}
