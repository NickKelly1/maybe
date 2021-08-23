export enum MaybeTag {
  Some = 'Maybe:Some',
  None = 'Maybe:None',
}

export type Falsy = 0 | false | null | undefined;

/**
 * Base class for Some and None
 */
export abstract class MaybeBase<T> {
  public abstract readonly value: T | undefined = undefined;
  public abstract tag: MaybeTag;

  /**
   * Map the value
   *
   * @param mapFn
   * @returns
   */
  map<U>(mapFn: (item: T) => U): Maybe<U> {
    if (this.isNone()) return this;
    return new Some(mapFn(this.value!));
  }

  /**
   * Map the value
   *
   * @param tapFn
   * @returns
   */
  tap<U>(tapFn: (item: T) => U): this {
    if (this.isNone()) return this;
    tapFn(this.value!);
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
  flat(): T extends Maybe<Maybe<infer U>> ? Maybe<U> : Maybe<T>
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
    if (this.isNone()) return new Some(mapFn());
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
   *
   * @param filterFn
   * @returns
   */
  filter(filterFn: (item: T) => boolean): Maybe<T> {
    if (this.isNone()) return this;
    if (filterFn(this.value!)) return this as Maybe<T>;
    return new None();
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
  abstract isSome(): this is Some<T>;

  /**
   * Is this a none?
   *
   * @returns
   */
  abstract isNone(): this is None;
}

/**
 * A value that exists
 */
export class Some<T> extends MaybeBase<T> {
  public get tag(): MaybeTag.Some { return MaybeTag.Some; }
  public readonly value: T;
  isSome(): true { return true; }
  isNone(): false { return false; }

  constructor(value: T) {
    super();
    this.value = value;
  }
}

/**
 * A value that does not exist
 */
export class None extends MaybeBase<never> {
  public get tag(): MaybeTag.None { return MaybeTag.None; }
  public readonly value: undefined;
  isSome(): false { return false; }
  isNone(): true { return true; }

  constructor() {
    if (NoneSingleton) return NoneSingleton;
    super();
    this.value = undefined;
    NoneSingleton = this;
  }
}

let NoneSingleton: None | undefined = undefined;
export const none = new None();

export type Maybe<T> = None | Some<T>;
export const Maybe = {
  /**
   * Create a Some
   *
   * @param value
   * @returns
   */
  some<T>(value: T): Some<T> {
    return new Some(value);
  },

  /**
   * Get the None instance
   */
  get none(): None {
    return none;
  },

  /**
   * Get the Some class
   */
  get Some(): typeof Some {
    return Some;
  },

  /**
   * Get the None class
   */
  get None(): typeof None {
    return None;
  },

  /**
   * Create a new option from the value
   *
   * @param value
   * @returns
   */
  from<T>(value: T | undefined): Maybe<T> {
    if (value === undefined) return none;
    return new Some(value);
  },

  /**
   * Create a new option from the value
   *
   * @param value
   * @returns
   */
  fromNonNullable<T>(value: T | null | undefined): Maybe<T> {
    if (value == undefined) return none;
    return new Some(value);
  },

  /**
   * If the value is false, return some
   *
   * @param value
   * @returns
   */
  fromTruthy<T>(value: T | Falsy): Maybe<T> {
    if (!value) return none;
    return new Some(value);
  },

  /**
   * Create a new Some
   *
   * @param value
   * @returns
   */
  toSome<T>(value: T): Some<T> {
    return new Some(value);
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
