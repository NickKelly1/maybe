export enum MaybeTag {
  Some = 'some',
  None = 'none',
}

export type Falsy = 0 | false | null | undefined;

/**
 * Base class for Some and None
 */
export class MaybeKind<T> {
  constructor(
    public readonly tag: MaybeTag,
    public readonly value: T | undefined = undefined,
  ) {
    //
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
    if ((value as any).tag === MaybeTag.None) return value as unknown as any;

    // value is a Some<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((value as any).tag === MaybeTag.Some) return value as unknown as any;

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
  flatMap(mapFn: (item: T) => None): Maybe<T>;
  flatMap<U>(mapFn: (item: T) => Some<U>): Maybe<U>;
  flatMap<U>(mapFn: (item: T) => Maybe<U>): Maybe<U>;
  flatMap<U>(mapFn: (item: T) => Maybe<U>): Maybe<U> {
    if (this.isNone()) return this;
    return mapFn(this.value!);
  }

  /**
   * Map the none side of this option
   *
   * @param mapFn
   * @returns
   */
  mapNone<U>(mapFn: () => U): Maybe<T | U> {
    if (this.isNone()) return Maybe.some(mapFn());
    return this as Maybe<T | U>;
  }

  /**
   * Map the none side of this option
   *
   * @param mapFn
   * @returns
   */
  flatMapNone(mapFn: () => None): Maybe<T>;
  flatMapNone<U>(mapFn: () => Some<U>): Maybe<T | U>;
  flatMapNone<U>(mapFn: () => Maybe<U>): Maybe<T | U>;
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
  match(regexp: string | RegExp, group = 0): Maybe<string> {
    if (this.isNone()) return this;
    const result = String(this.value).match(regexp);
    if (!result) return Maybe.none;
    return Maybe.some(result[group]!);
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
    return this.tag === MaybeTag.Some;
  }

  /**
   * Is this a none?
   *
   * @returns
   */
  isNone(): this is None {
    return this.tag === MaybeTag.None;
  }
}

export interface Some<T> extends MaybeKind<T> {
  tag: MaybeTag.Some;
  value: T;
}

export interface None extends MaybeKind<never> {
  tag: MaybeTag.None;
  value: undefined;
}

export const none = new MaybeKind<never>(MaybeTag.None) as None;

export type Maybe<T> = None | Some<T>;
export const Maybe = {
  /**
   * Create a Some
   *
   * @param value
   * @returns
   */
  some<T>(value: T): Some<T> {
    return new MaybeKind(MaybeTag.Some, value) as Some<T>;
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
};
