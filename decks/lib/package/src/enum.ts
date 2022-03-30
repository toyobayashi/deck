/** @public */
export type VariantParameter<Variants> = Variants extends Record<string, new (...args: any[]) => Variant<any[]>>
  ? InstanceType<Variants[keyof Variants]>
  : never

/** @public */
export class Variant<P extends any[]> {
  constructor (
    public payload: P
  ) {}
}

/** @public */
export abstract class Enum<
  Variants extends Record<string, new (...args: any[]) => Variant<any[]>> = Record<string, new (...args: any[]) => Variant<any[]>>
> {
  protected constructor (
    public variant: VariantParameter<Variants>
  ) {}

  public abstract get variants (): Variants
}
