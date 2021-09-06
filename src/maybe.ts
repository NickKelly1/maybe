/* eslint-disable max-len */
import { Unary } from './types';
import { $ANY } from './utility-types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SOME = 'some';
export const SOME: SOME = 'some';

export type NONE = 'none';
export const NONE: NONE = 'none';

export type TAG = SOME | NONE;

export type Falsy = 0 | false | null | undefined;

export interface ErrorLike { message: string }

export type MaybeValue<T extends MaybeKindLike<any>> = T extends SomeLike<any> ? T['zV'] : never;

export interface MaybeKindLike<T> {
  readonly tag: TAG;
  readonly value: T | undefined;
  isSome(): this is SomeLike<T>;
  isNone(): this is NoneLike;
  readonly zV: T;
}

/**
 * Base class for Some and None
 */
export class MaybeKind<T> implements MaybeKindLike<T> {
  // virtual property
  readonly zV!: T;

  constructor(
    public readonly tag: TAG,
    public readonly value: T | undefined = undefined,
  ) {
    //
  }

  protected _arr: undefined | unknown[];
  protected _cachedArray(): undefined | unknown[] {
    if (this._arr) return this._arr;
    if (!this.value) return undefined;
    if (Array.isArray(this.value)) {
      this._arr = this.value;
      return this.value;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (this.value as any)[Symbol.iterator] === 'function') {
      this._arr = [...(this.value as unknown as Iterable<number>),];
      return this._arr;
    }
    return undefined;
  }


  /**
   * Remove falsy values
   *
   * @param this
   * @returns
   */
  compact(): Maybe<NonNullable<T>> {
    if (this.isNone()) return Maybe.none;
    if (!this.value) return Maybe.none;
    return Maybe.some(this.value) as Maybe<NonNullable<T>>;
  }

  /**
   * Map the value
   *
   * @param callbackfn
   * @returns
   */
  map<U>(callbackfn: (item: T) => U): Maybe<U> {
    if (this.isNone()) return this;
    return Maybe.some(callbackfn(this.value!));
  }

  /**
   * Map this instance to another value and return that value
   *
   * @param callbackfn
   * @returns
   */
  mapSelf<R>(callbackfn: (self: this) => R): R {
    return callbackfn(this);
  }

  /**
   * Map the value
   *
   * @param callbackfn
   * @returns
   */
  tap(callbackfn: (item: T) => unknown): this {
    if (this.isSome()) callbackfn(this.value);
    return this;
  }

  /**
   * Map the value
   *
   * @param callbackfn
   * @returns
   */
  tapNone(callbackfn: () => unknown): this {
    if (this.isNone()) callbackfn();
    return this;
  }

  /**
   * Map the value
   *
   * @param callbackfn
   * @returns
   */
  tapSelf(callbackfn: (self: this) => unknown): this {
    callbackfn(this);
    return this;
  }

  /**
   * Flatten the maybe
   *
   * @param mapFn
   * @returns
   */
  flat<U>(this: Some<Some<U>>): Some<U>
  flat<U>(this: Maybe<Some<U>>): Maybe<U>
  flat<U>(this: Some<Maybe<U>>): Maybe<U>
  flat<U>(this: Maybe<Maybe<U>>): Maybe<U>
  flat(this: Maybe<None>): None
  flat(this: None): None
  flat(): T extends Maybe<Maybe<infer U>> ? Maybe<U> : Maybe<T> {
    if (this.isNone()) return this;
    const value = this.unwrap();

    // value is not a Maybe<U>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!value) return this as unknown as any;

    // value is not a Maybe<U>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(typeof value === 'object')) return this as unknown as any;

    // value is not a Maybe<U>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!('tag' in value)) return this as unknown as any;

    // value is a None<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((value as any).tag === NONE) return value as unknown as any;

    // value is a Some<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((value as any).tag === SOME) return value as unknown as any;

    // value is unknown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as unknown as any;
  }

  /**
   * Flat map the value
   *
   * @param mapFn
   * @returns
   */
  flatMap<U extends MaybeLike<any>>(mapFn: (item: T) => U):
    this extends SomeLike<T> ?
      U extends SomeLike<any> ? Some<MaybeValue<U>>
      : U extends None ? None
      : Maybe<MaybeValue<U>>
    : this extends NoneLike ? None
    : Maybe<MaybeValue<U>>
  {
    if (this.isNone()) return this as $ANY;
    return mapFn(this.value!) as $ANY;
  }

  /**
   * Map the none side of this option
   *
   * @param mapFn
   * @returns
   */
  mapNone<U>(mapFn: () => U):
    this extends SomeLike<T> ? Some<T>
    : this extends NoneLike ?
      U extends SomeLike<any> ? Some<MaybeValue<U>>
      : U extends NoneLike ? None
      : Maybe<U>
    : Maybe<T | U>
  {
    if (this.isNone()) return Maybe.some(mapFn()) as $ANY;
    return this as $ANY;
  }

  /**
   * Map the none side of this option
   *
   * @param mapFn
   * @returns
   */
  // flatMapNone(mapFn: () => None): Maybe<T>;
  // flatMapNone<U>(mapFn: () => Some<U>): Maybe<T | U>;
  // flatMapNone<U>(mapFn: () => Maybe<U>): Maybe<T | U>;
  flatMapNone<U>(mapFn: () => Maybe<U>): Maybe<T | U> {
    if (this.isNone()) return mapFn();
    return this as Maybe<T | U>;
  }

  /**
   * Filter in items matching
   *
   * @param filterFn
   * @returns
   */
  filter(filterFn: (item: T) => boolean): Maybe<T> {
    if (this.isNone()) return this;
    if (filterFn(this.value!)) return this as Maybe<T>;
    return Maybe.none;
  }

  /**
   * Filter in items greater than the given value
   *
   * @param gt
   * @returns
   */
  gt(gt: Date | number | BigInt): Maybe<T> {
    if (this.isNone()) return this;
    return this.filter((i) => Number(i) > Number(gt));
  }

  /**
   * Filter in items greater than the given value
   *
   * @param gte
   * @returns
   */
  gte(gt: Date | number | BigInt): Maybe<T> {
    if (this.isNone()) return this;
    return this.filter((i) => Number(i) >= Number(gt));
  }

  /**
   * Filter in items greater than the given value
   *
   * @param gt
   * @returns
   */
  lt(gt: Date | number | BigInt): Maybe<T> {
    if (this.isNone()) return this;
    return this.filter((i) => Number(i) < Number(gt));
  }

  /**
   * Filter in items greater than the given value
   *
   * @param gte
   * @returns
   */
  lte(gt: Date | number | BigInt): Maybe<T> {
    if (this.isNone()) return this;
    return this.filter((i) => Number(i) <= Number(gt));
  }

  /**
   * Exclude items that test positive
   *
   * @param regexp
   * @returns
   */
  notMatching(regexp: RegExp): Maybe<T> {
    if (this.isNone()) return this;
    const _regexp = typeof regexp === 'string'
      ? new RegExp(regexp)
      : regexp;
    if (!_regexp.test(String(this.value))) {
      return Maybe.some(this.value!);
    }
    return Maybe.none;
  }

  /**
   * Keep values that are not undefined
   *
   * @param this
   * @returns
   */
  notUndefined(): Maybe<T extends undefined ? never : T> {
    if (this.isSome()) {
      if (this.value === undefined) return Maybe.none;
      return Maybe.some(this.value as T) as Maybe<T extends undefined ? never : T>;
    }
    return Maybe.none;
  }

  /**
   * Keep values that are not null
   *
   * @param this
   * @returns
   */
  notNull(): Maybe<T extends null ? never : T> {
    if (this.isSome()) {
      if (this.value === null) return Maybe.none;
      return Maybe.some(this.value as T) as Maybe<T extends null ? never : T>;
    }
    return Maybe.none;
  }

  /**
   * Keep values that are not null or undefined
   *
   * @param this
   * @returns
   */
  notNullable(): Maybe<NonNullable<T>> {
    if (this.isSome()) {
      if (this.value == null) return Maybe.none;
      return Maybe.some(this.value as T) as Maybe<NonNullable<T>>;
    }
    return Maybe.none;
  }

  /**
   * Filter out the specific value
   *
   * @param value
   */
  exclude(value: T): Maybe<T> {
    return this.filter((item) => item !== value);
  }

  /**
   * Keep items that test positive
   *
   * @param regexp
   * @returns
   */
  matching(regexp: string | RegExp): Maybe<T> {
    if (this.isNone()) return this;
    const _regexp = typeof regexp === 'string'
      ? new RegExp(regexp)
      : regexp;
    if (_regexp.test(String(this.value))) {
      return Maybe.some(this.value!);
    }
    return Maybe.none;
  }

  /**
   * Match
   *
   * @param regexp
   * @returns
   */
  match(regexp: string | RegExp): Maybe<RegExpMatchArray> {
    if (this.isNone()) return this;
    const result = String(this.value).match(regexp);
    if (!result) return Maybe.none;
    return Maybe.some(result);
  }

  /**
   * Get the value at the given array index
   *
   * @param this
   * @param index
   * @returns
   *
   * Tuples:
   *  - Positive indeces will be typed to the correct value
   *  - Negative indeces will be typed as a union of the tuple
   * This is because "I extends keyof U" is true for any positive
   * number I. However for negative I, this is false.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  at<U extends any[], I extends keyof U>(this: MaybeKind<U>, index: I): Maybe<U[I]>
  at<U>(this: MaybeKind<readonly U[]>, index: number): Maybe<U>
  at<U>(this: MaybeKind<Iterable<U>>, index: number): Maybe<U>
  at(index: number): None
  at<U>(this: MaybeKind<Iterable<U>>, index: number): Maybe<U> {
    // none
    if (this.isNone()) return none;

    // extract value as cached array
    const arr = this._cachedArray() as undefined | U[];

    // not array-like
    if (!arr) {
      if (index === 0 || index === -1) return this as Maybe<U>;
      return Maybe.none;
    }

    // forward index
    if (index >= 0) {
      // index is positive
      if (index >= arr.length) return Maybe.none;
      return Maybe.some(arr[index]!);
    }

    // reverse index
    if (index < -arr.length) return Maybe.none;
    return Maybe.some(arr[arr.length + index]!);
  }

  /**
   * Pluck a value from the object
   *
   * @param key
   * @returns
   */
  pluck<K extends keyof T>(key: K): Maybe<T[K]> {
    if (this.isNone()) return Maybe.none;
    if (!this.value) return Maybe.none;
    if (key in this.value) return Maybe.some(this.value[key]);
    return Maybe.none;
  }


  /**
   * Unwrap, throwing an error if is none
   *
   * @returns
   */
  unwrap(): T {
    if (this.isNone()) throw new TypeError('value is None');
    return this.value!;
  }

  /**
   * Is this a some?
   *
   * @returns
   */
  isSome(): this is Some<T> {
    return this.tag === SOME;
  }

  /**
   * Is this a none?
   *
   * @returns
   */
  isNone(): this is None {
    return this.tag === NONE;
  }

  /**
   * Throw if Some
   *
   * TS: Only allow running on errors
   *
   * @param this
   * @returns
   */
  throw(this: MaybeLike<Error>): None {
    if (this.isNone()) return Maybe.none;
    throw this.value;
  }

  /**
   * Throw if Some
   *
   * Allows throwing any kind
   *
   * @returns
   */
  throwW(): None {
    if (this.isNone()) return Maybe.none;
    throw this.value;
  }

  /**
   * Throw if Some with error-instance value
   *
   * @returns
   */
  throwError(): Maybe<Exclude<T, Error>> {
    if (this.isNone())
      return Maybe.none;

    if (this.value && this.value instanceof Error)
      throw this.value;

    return Maybe.some(this.value as T) as T extends Error ? None : Maybe<Exclude<T, Error>>;
  }

  /**
   * Throw if Some with error-like value
   *
   * @returns
   */
  throwErrorLike(): Maybe<Exclude<T, ErrorLike>> {
    if (this.isNone())
      return Maybe.none;

    if (this.value && (
      this.value instanceof Error
      || typeof (this.value as any).message === 'string'
    ))
      throw this.value;

    return Maybe.some(this.value as T) as T extends ErrorLike ? None : Maybe<Exclude<T, ErrorLike>>;
  }

  // /**
  //  * TODO is this desirable? probably not
  //  *
  //  * Split the Maybe into many different values and join in a tuple
  //  *
  //  * Similar to Promise.all
  //  *
  //  * @param splits
  //  */
  // allAny<M extends Record<PropertyKey, Unary<this, unknown>>>(splits: M): Maybe<{ [K in keyof M]: ReturnType<M[K]> }>;
  // allAny<R1>(...splits: readonly [Unary<this, R1>]): Maybe<[R1]>
  // allAny<R1, R2>(...splits: readonly [Unary<this, R1>, Unary<this, R2>]): Maybe<[R1, R2]>
  // allAny<R1, R2, R3>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>]): Maybe<[R1, R2, R3]>
  // allAny<R1, R2, R3, R4>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>]): Maybe<[R1, R2, R3, R4]>
  // allAny<R1, R2, R3, R4, R5>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>]): Maybe<[R1, R2, R3, R4, R5]>
  // allAny<R1, R2, R3, R4, R5, R6>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>]): Maybe<[R1, R2, R3, R4, R5, R6]>
  // allAny<R1, R2, R3, R4, R5, R6, R7>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>]): Maybe<[R1, R2, R3, R4, R5, R6, R7]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8, R9>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>, Unary<this, R9>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>, Unary<this, R9>, Unary<this, R10>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>, Unary<this, R9>, Unary<this, R10>, Unary<this, R11>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>, Unary<this, R9>, Unary<this, R10>, Unary<this, R11>, Unary<this, R12>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>, Unary<this, R9>, Unary<this, R10>, Unary<this, R11>, Unary<this, R12>, Unary<this, R13>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>, Unary<this, R9>, Unary<this, R10>, Unary<this, R11>, Unary<this, R12>, Unary<this, R13>, Unary<this, R14>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14]>
  // allAny<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15>(...splits: readonly [Unary<this, R1>, Unary<this, R2>, Unary<this, R3>, Unary<this, R4>, Unary<this, R5>, Unary<this, R6>, Unary<this, R7>, Unary<this, R8>, Unary<this, R9>, Unary<this, R10>, Unary<this, R11>, Unary<this, R12>, Unary<this, R13>, Unary<this, R14>, Unary<this, R15>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15]>
  // allAny<R>(...splits: readonly (Unary<this, R>)[]): Maybe<R[]>;
  // allAny(mapOrFunction?: (Unary<this, unknown> | Record<PropertyKey, Unary<this, unknown>>), ...rest: Unary<this, unknown>[]): $ANY {
  //   if (this.isNone()) return Maybe.none;

  //   if (!mapOrFunction)
  //     throw new TypeError('[@nkp/maybe::Maybe.all]: you must provide an object or at least one function');

  //   if (typeof mapOrFunction === 'object') {
  //     const mapping = mapOrFunction as Record<PropertyKey, Unary<this, unknown>>;
  //     const mappedResults: Record<PropertyKey, $ANY> = {};
  //     Object.keys(mapping).map(key => {
  //       mappedResults[key] = mapping[key]!(this);
  //     });
  //     return Maybe.some(mappedResults);
  //   }

  //   const zeroFn = mapOrFunction as Unary<this, unknown>;
  //   // given an array of functions
  //   // given an array
  //   const fns = [zeroFn, ...rest,] as Unary<this, unknown>[];
  //   return Maybe.some([fns.map(split => split(this)),]);
  // }



  /**
   * Split the Maybe into many different values and join in a tuple
   *
   * Similar to Promise.all
   *
   * @param splits
   */
  all<M extends Record<PropertyKey, Unary<this, MaybeLike<unknown>>>>(splits: M): Maybe<{ [K in keyof M]: MaybeValue<ReturnType<M[K]>> }>;
  all<R1>(...splits: readonly [Unary<this, MaybeLike<R1>>]): Maybe<[R1]>
  all<R1, R2>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>]): Maybe<[R1, R2]>
  all<R1, R2, R3>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>]): Maybe<[R1, R2, R3]>
  all<R1, R2, R3, R4>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>]): Maybe<[R1, R2, R3, R4]>
  all<R1, R2, R3, R4, R5>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>]): Maybe<[R1, R2, R3, R4, R5]>
  all<R1, R2, R3, R4, R5, R6>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>]): Maybe<[R1, R2, R3, R4, R5, R6]>
  all<R1, R2, R3, R4, R5, R6, R7>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7]>
  all<R1, R2, R3, R4, R5, R6, R7, R8>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8]>
  all<R1, R2, R3, R4, R5, R6, R7, R8, R9>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>, Unary<this, MaybeLike<R9>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9]>
  all<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>, Unary<this, MaybeLike<R9>>, Unary<this, MaybeLike<R10>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>
  all<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>, Unary<this, MaybeLike<R9>>, Unary<this, MaybeLike<R10>>, Unary<this, MaybeLike<R11>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11]>
  all<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>, Unary<this, MaybeLike<R9>>, Unary<this, MaybeLike<R10>>, Unary<this, MaybeLike<R11>>, Unary<this, MaybeLike<R12>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12]>
  all<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>, Unary<this, MaybeLike<R9>>, Unary<this, MaybeLike<R10>>, Unary<this, MaybeLike<R11>>, Unary<this, MaybeLike<R12>>, Unary<this, MaybeLike<R13>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13]>
  all<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>, Unary<this, MaybeLike<R9>>, Unary<this, MaybeLike<R10>>, Unary<this, MaybeLike<R11>>, Unary<this, MaybeLike<R12>>, Unary<this, MaybeLike<R13>>, Unary<this, MaybeLike<R14>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14]>
  all<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15>(...splits: readonly [Unary<this, MaybeLike<R1>>, Unary<this, MaybeLike<R2>>, Unary<this, MaybeLike<R3>>, Unary<this, MaybeLike<R4>>, Unary<this, MaybeLike<R5>>, Unary<this, MaybeLike<R6>>, Unary<this, MaybeLike<R7>>, Unary<this, MaybeLike<R8>>, Unary<this, MaybeLike<R9>>, Unary<this, MaybeLike<R10>>, Unary<this, MaybeLike<R11>>, Unary<this, MaybeLike<R12>>, Unary<this, MaybeLike<R13>>, Unary<this, MaybeLike<R14>>, Unary<this, MaybeLike<R15>>]): Maybe<[R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15]>
  all<R>(...splits: readonly (Unary<this, R>)[]): Maybe<R[]>;
  all(mapOrFunction?: (Unary<this, MaybeLike<unknown>> | Record<PropertyKey, Unary<this, MaybeLike<unknown>>>), ...rest: Unary<this, MaybeLike<unknown>>[]): $ANY {
    if (this.isNone()) return Maybe.none;

    if (!mapOrFunction)
      throw new TypeError('[@nkp/maybe::Maybe.all]: you must provide an object or at least one function');

    if (typeof mapOrFunction === 'object') {
      const mapping = mapOrFunction as Record<PropertyKey, Unary<this, MaybeLike<unknown>>>;
      const mappedResults: Record<PropertyKey, $ANY> = {};
      const keys = Object.keys(mapping);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]!;
        const next = mapping[key]!(this);
        // short circuit on early none
        if (next.isNone()) return Maybe.none;
        // use the some value
        mappedResults[key] = next.value;
      }
      return Maybe.some(mappedResults);
    }

    const zeroFn = mapOrFunction as Unary<this, MaybeLike<unknown>>;
    // given an array of functions
    // given an array
    const fns = [zeroFn, ...rest,] as Unary<this, MaybeLike<unknown>>[];
    const mappedResults: unknown[] = [];
    for (let i = 0; i < fns.length; i += 1) {
      const next = fns[i]!(this);
      // short circuit on early none
      if (next.isNone()) return Maybe.none;
      mappedResults.push(next.value);
    }
    return Maybe.some(mappedResults);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SomeLike<T> extends MaybeKindLike<T> {
  tag: SOME;
  value: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NoneLike extends MaybeKindLike<never> {
  tag: NONE;
  value: undefined
}

//
// MaybeLike allows library consumers to interoperate with multiple
// incompatible versions of the @nkp/maybe library
//
// If your library function requires a Maybe<T>, type it as
// the more basic MaybeLike<T> instead, if you can forego the
// extra methods attached to Maybe<T>.
//
// All version of @nkp/maybe will remain compatible with MaybeLike<T>
//
export type MaybeLike<T> = SomeLike<T> | NoneLike;

export interface Some<T> extends MaybeKind<T> {
  tag: SOME;
  value: T;
}

export interface None extends MaybeKind<never> {
  tag: NONE;
  value: undefined;
}

export type Maybe<T> = None | Some<T>;

export const none = new MaybeKind<never>(NONE) as None;

export const Maybe = {
  /**
   * Create a Some
   *
   * @param value
   * @returns
   */
  some<T>(value: T): Some<T> {
    return new MaybeKind(SOME, value) as Some<T>;
  },

  /**
   * Get the None instance
   *
   * @type {None}
   */
  none,

  /**
   * Create a Maybe from the value
   * Some if not undefined
   * None if undefined
   *
   * @param value
   * @returns
   */
  from<T>(value: T | undefined): Maybe<T> {
    if (value === undefined) return none;
    return Maybe.some(value);
  },

  /**
   * Create a Maybe from the value
   * Some if not null and not undefined
   * None if null or undefined
   *
   * @param value
   * @returns
   */
  fromNonNullable<T>(value: T | null | undefined): Maybe<T> {
    if (value == null) return none;
    return Maybe.some(value);
  },

  /**
   * Create a Maybe from the value
   * Some if truthy
   * None if falsy
   *
   * @param value
   * @returns
   */
  fromTruthy<T>(value: T | Falsy): Maybe<T> {
    if (!value) return none;
    return Maybe.some(value);
  },

  /**
   * Create a Some from the value
   *
   * @param value
   * @returns
   */
  toSome<T>(value: T): Some<T> {
    return Maybe.some(value);
  },

  /**
   * Is the value a Some?
   *
   * @param maybe
   * @returns
   */
  isSome<T>(maybe: Maybe<T>): maybe is Some<T> {
    return maybe.isSome();
  },

  /**
   * Is the value a None?
   *
   * @param maybe
   * @returns
   */
  isNone<T>(maybe: Maybe<T>): maybe is Some<T> {
    return maybe.isNone();
  },

  /**
   * Catch errors to None
   */
  catch<T>(fn: () => T): Maybe<T> {
    try {
      return Maybe.some(fn());
    } catch (err) {
      return none;
    }
  },

  /**
   * Catch errors to None
   */
  async catchAsync<T>(fn: () => T): Promise<Maybe<T>> {
    try {
      return Maybe.some(await fn());
    } catch (err) {
      return none;
    }
  },
};

export const some = Maybe.some;
