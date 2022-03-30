/**
 * Rust Enum
 *
 * @packageDocumentation
 */

import { Option } from './option'

/** @public */
export const Some = Option.Some

/** @public */
export const None = Option.None

export { Option }
export type { IRefMut } from './option'
export { OptionIterator } from './option'

export { Enum, Variant } from './enum'
export type { VariantParameter } from './enum'

export { matchEnum } from './match'
export type { MatchBranches, Branches } from './match'
