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

export interface IHasSlice {
  slice(start?: number, end?: number): IHasSlice;
}

export interface MaybeKindLike<T> {
  readonly tag: TAG;
  readonly value: T | undefined;
  isSome(): this is SomeLike<T>;
  isNone(): this is NoneLike;
  readonly zV: T;
}

// unique for each file
// if the project has multiple versions of Maybe,
// their `version` will be different (even if it is
// actuall the same npm "version"...)
const version = Symbol('version');

/**
 * Base class for Some and None
 */
export class MaybeKind<T> implements MaybeKindLike<T> {
  // virtual property
  readonly zV!: T;
  protected get version(): symbol { return version; }

  constructor(
    public readonly tag: TAG,
    public readonly value: T | undefined = undefined,
  ) {
    //
  }

  /**
   * Ensure the instance is compatible with this version of the library
   *
   * @param like
   * @returns
   */
  protected _compatible<T>(like: MaybeLike<T>): Maybe<T> {
    if (this.version === (like as any).version) {
      return like as Maybe<T>;
    }
    if (like.isSome()) return some(like.value);
    return none;
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
   * Map both sides of the value to a new Some
   *
   * @param onSome
   * @param onNone
   * @returns
   */
  bimap<S, N>(onSome: (value: T) => S, onNone: () => N): Maybe<S | N> {
    if (this.isNone()) return this._compatible(some(onNone()));
    return Maybe.some(onSome(this.value!));
  }

  /**
   * Map both sides of the value to a new Some
   *
   * @param onSome
   * @param onNone
   * @returns
   */
  flatBimap<S extends MaybeLike<any>, N extends MaybeLike<any>>(
    onSome: (value: T) => S,
    onNone: () => N
  ): Maybe<MaybeValue<S> | MaybeValue<N>> {
    if (this.isNone()) return this._compatible(onNone());
    return this._compatible(onSome(this.value!));
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
  map<U>(callbackfn: (value: T) => U): Maybe<U> {
    if (this.isNone()) return Maybe.none;
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
   * Map both sides of the value to a new Some
   *
   * @param onSome
   * @param onNone
   * @returns
   */
  tapBoth(onSome: (value: T) => unknown, onNone: () => unknown): this {
    if (this.isNone()) onNone();
    else onSome(this.value as T);
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
    if (this.isNone()) return Maybe.none;
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
   * @param callbackfn
   * @returns
   */
  flatMap<U extends MaybeLike<any>>(callbackfn: (value: T) => U):
    this extends SomeLike<T> ?
      U extends SomeLike<any> ? Some<MaybeValue<U>>
      : U extends None ? None
      : Maybe<MaybeValue<U>>
    : this extends NoneLike ? None
    : Maybe<MaybeValue<U>>
  {
    if (this.isNone()) return this as $ANY;
    return this._compatible(callbackfn(this.value!)) as $ANY;
  }

  /**
   * Map the none side of this option
   *
   * @param callbackfn
   * @returns
   */
  flatMapNone<U extends MaybeLike<any>>(callbackfn: () => Maybe<U>):
    this extends SomeLike<T>
      ? Some<T>
    : this extends NoneLike
      ? U extends SomeLike<any>
        ? Some<MaybeValue<U>>
        : U extends NoneLike
        ? None
        : Maybe<MaybeValue<U>>
    : Maybe<MaybeValue<U>>
  {
    if (this.isNone()) return Maybe.none as $ANY;
    return this._compatible(callbackfn()) as $ANY;
  }

  /**
   * Map the none side of this option
   *
   * @param mapFn
   * @returns
   */
  mapNone<U>(mapFn: () => U):
    this extends SomeLike<T> ? Some<T>
    : this extends NoneLike ? Some<U>
    : Maybe<T | U>
  {
    if (this.isNone()) return Maybe.some(mapFn()) as $ANY;
    return this as $ANY;
  }

  /**
   * Filter in items matching
   *
   * @param filterFn
   * @returns
   */
  filter(filterFn: (item: T) => boolean): Maybe<T> {
    if (this.isNone()) return Maybe.none;
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
    if (this.isNone()) return Maybe.none;
    return this.filter((i) => Number(i) > Number(gt));
  }

  /**
   * Filter in items greater than the given value
   *
   * @param gte
   * @returns
   */
  gte(gt: Date | number | BigInt): Maybe<T> {
    if (this.isNone()) return Maybe.none;
    return this.filter((i) => Number(i) >= Number(gt));
  }

  /**
   * Filter in items greater than the given value
   *
   * @param gt
   * @returns
   */
  lt(gt: Date | number | BigInt): Maybe<T> {
    if (this.isNone()) return Maybe.none;
    return this.filter((i) => Number(i) < Number(gt));
  }

  /**
   * Filter in items greater than the given value
   *
   * @param gte
   * @returns
   */
  lte(gt: Date | number | BigInt): Maybe<T> {
    if (this.isNone()) return Maybe.none;
    return this.filter((i) => Number(i) <= Number(gt));
  }


  /**
   * Convert to a number
   *
   * If NaN, return None
   */
  notNaN(): Maybe<number> {
    if (this.isNone()) return Maybe.none;
    const number = Number(this.value);
    if (Number.isNaN(number)) return Maybe.none;
    return Maybe.some(number);
  }

  /**
   * Convert to a number
   *
   * If not finite, return None
   *
   */
  finite(): Maybe<number> {
    if (this.isNone()) return Maybe.none;
    const number = Number(this.value);
    if (!Number.isFinite(number)) return Maybe.none;
    return Maybe.some(number);
  }

  /**
   * Exclude items that test positive
   *
   * @param regexp
   * @returns
   */
  notMatching(regexp: RegExp): Maybe<T> {
    if (this.isNone()) return Maybe.none;
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
  matching(regexp: RegExp | string): Maybe<T> {
    if (this.isNone()) return Maybe.none;
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
  match(regexp: RegExp | string): Maybe<RegExpMatchArray> {
    if (this.isNone()) return Maybe.none;
    const result = String(this.value).match(regexp);
    if (!result) return Maybe.none;
    return Maybe.some(result);
  }

  /**
   * Match All
   *
   * @param regexp
   * @returns
   */
  matchAll(regexp: RegExp | string): Maybe<RegExpMatchArray[]> {
    if (this.isNone()) return Maybe.none;
    const _regexp: RegExp = typeof regexp === 'string'
      ? new RegExp(regexp, 'g')
      : regexp;
    const result = String(this.value).matchAll(_regexp);
    return some(Array.from(result));
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
    if (this.isNone()) return none;
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
    if (this.isNone()) return none;
    throw this.value;
  }

  /**
   * Slice the contents
   *
   * @param start
   * @param end
   * @returns
   */
  slice(this: MaybeLike<IHasSlice>, start?: number, end?: number):
    this extends SomeLike<T> ? Some<T>
    : this extends NoneLike ? None
    : Maybe<T>
  {
    if (this.isNone()) return none as $ANY;
    const value = this.value;
    const sliced = value.slice(start, end);
    return Maybe.some(sliced as any as T) as $ANY;
  }

  /**
   * Repeat the string `count` times
   *
   * @param this
   * @param count
   * @returns
   */
  repeat(this: MaybeLike<string>, count: number):
    this extends SomeLike<string> ? Some<string>
    : this extends NoneLike ? None
    : Maybe<string>
  {
    if (this.isNone()) return none as $ANY;
    const value = this.value;
    const repeated = value.repeat(count);
    return Maybe.some(repeated) as $ANY;
  }

  /**
   * Replace the string using the expression
   *
   * @param this
   * @param searchValue
   * @param replaceValue
   */
  replace(this: MaybeLike<string>, searchValue: RegExp | string, replaceValue: string):
    this extends SomeLike<string> ? Some<string>
    : this extends NoneLike ? None
    : Maybe<string>
  {
    if (this.isNone()) return Maybe.none as $ANY;
    const replaced = this.value.replace(searchValue, replaceValue);
    return Maybe.some(replaced) as $ANY;
  }


  /**
   * Replace the string using the expression
   *
   * @param this
   * @param searchValue
   * @param replaceValue
   */
  replaceAll(this: MaybeLike<string>, searchValue: RegExp | string, replaceValue: string):
    this extends SomeLike<string> ? Some<string>
    : this extends NoneLike ? None
    : Maybe<string>
  {
    if (this.isNone()) return Maybe.none as $ANY;
    if (typeof searchValue === 'string') {
      const replaced = this
        .value
        .replace(
          new RegExp(searchValue, 'g'),
          replaceValue
        );
      return Maybe.some(replaced) as $ANY;
    }
    const replaced = this
      .value
      .replace(
        new RegExp(
          searchValue,
          searchValue.flags.includes('g')
            ? searchValue.flags
            : searchValue.flags + 'g'
        ),
        replaceValue,
      );
    return Maybe.some(replaced) as $ANY;
  }

  /**
   * Coerce the value to a string
   *
   * @returns
   */
  string(): Maybe<string> {
    try {
      return some(String(this.value));
    } catch (e) {
      return none;
    }
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


  /**
   * Attempt to parse the value as an integer
   */
  parseInt(radix?: number): Maybe<number> {
    if (this.isNone()) return Maybe.none;

    let parsed: number;
    if (typeof this.value === 'number')
      parsed = parseInt(String(this.value), radix);

    else if (typeof this.value === 'string')
      parsed = parseInt(this.value, radix);

    else {
      try { parsed = parseInt(String(this.value)); }
      catch (err) { return Maybe.none; }
    }

    if (Number.isNaN(parsed)) return Maybe.none;

    return Maybe.some(parsed);
  }


  /**
   * Attempt to parse the value as a float
   */
  parseFloat(): Maybe<number> {
    if (this.isNone()) return Maybe.none;

    let parsed: number;
    if (typeof this.value === 'number')
      parsed = parseFloat(String(this.value));

    else if (typeof this.value === 'string')
      parsed = parseFloat(this.value);

    else {
      try { parsed = parseFloat(String(this.value)); }
      catch (err) { return Maybe.none; }
    }

    if (Number.isNaN(parsed)) return Maybe.none;

    return Maybe.some(parsed);
  }


  all<U extends [...Maybeable[]]>(maybeables: Unary<this, [...U]>): Maybe<UnwrapMaybeables<U>> {
    if (this.isNone()) return Maybe.none;
    const results: unknown[] = [];
    const _maybeables: Maybeable[] = maybeables(this);
    const length = _maybeables.length;
    for (let i = 0; i < length; i += 1) {
      const next = unwrapMaybeable(_maybeables[i]!);
      if (next.isNone()) return Maybe.none;
      results.push(next.value);
    }
    return Maybe.some(results) as Maybe<UnwrapMaybeables<U>>;
  }

  /**
   * Split the Maybe into many different values and join in a tuple
   *
   * Similar to Promise.all
   *
   * @param maybeables
   */
  allObj<M extends Record<PropertyKey, Maybeable>>(maybeables: Unary<this, M>): Maybe<{ [K in keyof M]: UnwrapMaybeable<M[K]> }> {
    const _maybeables: M = maybeables(this);
    const results: Record<PropertyKey, unknown> = {};
    const keys = Object.keys(_maybeables);
    const keysLen = keys.length;
    for (let i = 0; i < keysLen; i += 1) {
      const key = keys[i]!;
      const next = unwrapMaybeable(_maybeables[key]!);
      if (next.isNone()) return Maybe.none;
      results[key] = next.value;
    }
    const symbols = Object.getOwnPropertySymbols(_maybeables);
    const symLen = symbols.length;
    for (let i = 0; i < symLen; i += 1) {
      const sym = symbols[i]!;
      const next = unwrapMaybeable(_maybeables[sym]!);
      if (next.isNone()) return Maybe.none;
      results[sym] = next.value;
    }
    return Maybe.some(results) as Maybe<{ [K in keyof M]: UnwrapMaybeable<M[K]> }>;
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

// unwrapping tuple types: https://instil.co/blog/crazy-powerful-typescript-tuple-types/

export type Maybeable =
  | unknown
  | MaybeLike<unknown>
  | (() => (unknown | Maybe<unknown>));

// unwrapping maybeables:
//  1. if the value is a fucntion:
//    1. if the funciton returns a maybe, return its inner value
//    2. if the function returns a non-maybe, return its value
//  2. if the value is a non-function:
//    1. if the value is a maybe, return its inner value
//    1. if the value is a non-maybe, return its value

export type UnwrapMaybeable<T> =
  T extends ((...args: any[]) => infer M)
    ? M extends MaybeLike<any>
      ? MaybeValue<M>
      : M
    : T extends MaybeLike<any>
      ? MaybeValue<T>
      : T;

export type UnwrapMaybeables<T extends readonly [...readonly unknown[]]> =
    T extends [infer Head, ...infer Tail]
        ? [UnwrapMaybeable<Head>, ...UnwrapMaybeables<Tail>]
        : [];

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
    if (!isMaybeLike(maybe)) return false;
    return maybe.isSome();
  },

  /**
   * Is the value a None?
   *
   * @param maybe
   * @returns
   */
  isNone<T>(maybe: Maybe<T>): maybe is None {
    if (!isMaybeLike(maybe)) return false;
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


/**
 * Unwrap a maybeable
 *
 * @param maybeable
 * @returns
 */
function unwrapMaybeable(maybeable: Maybeable): MaybeLike<unknown> {
  // will either be a maybe or a value
  const perhaps = typeof maybeable === 'function' ? maybeable() : maybeable;
  if (isMaybeLike(perhaps)) { return perhaps; }
  return Maybe.some(perhaps);
}

/**
 * Is the value MaybeLike?
 *
 * @param unk
 * @returns
 */
export function isMaybeLike<T = unknown>(unk: unknown): unk is MaybeLike<T> {
  if (!unk) return false;
  if (unk instanceof MaybeKind) return true;
  const tag = (unk as any).tag;
  if (tag !== SOME && tag !== NONE) return false;
  if (!(typeof (unk as any).isSome === 'function')) return false;
  if (!(typeof (unk as any).isNone === 'function')) return false;
  return true;
}
