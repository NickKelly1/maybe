export enum MaybeTag {
  Some = 'some',
  None = 'none',
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
   * @param callbackfn
   * @returns
   */
  map<U>(callbackfn: (item: T) => U): Maybe<U> {
    if (this.isNone()) return this;
    return new Some(callbackfn(this.value!));
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
  isSome(): this is Some<T> { return false; }

  /**
   * Is this a none?
   *
   * @returns
   */
  isNone(): this is None { return false; }

  /**
   * Get string representation of the object
   *
   * @returns
   */
  public abstract toString(): string;
}

/**
 * A value that exists
 */
export class Some<T> extends MaybeBase<T> {
  public get tag(): MaybeTag.Some { return MaybeTag.Some; }
  public readonly value: T;
  override isSome(): this is Some<T> { return true; }

  constructor(value: T) {
    super();
    this.value = value;
  }

  /**
   * @inheritdoc
   */
  override toString(): string {
    let itemStr: string;
    try {
      itemStr = String(this.value);
    } catch (err) {
      itemStr = '?';
    }
    return `[object ${this.constructor.name} {${itemStr}}]`;
  }
}

/**
 * A value that does not exist
 */
export class None extends MaybeBase<never> {
  public get tag(): MaybeTag.None { return MaybeTag.None; }
  public readonly value: undefined;
  override isNone(): this is None { return true; }

  constructor() {
    if (NoneSingleton) return NoneSingleton;
    super();
    this.value = undefined;
    NoneSingleton = this;
  }

  /**
   * @inheritdoc
   */
  override toString(): string {
    return `[object ${this.constructor.name} {}]`;
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
   * Create a Maybe from the value
   * Some if not undefined
   * None if undefined
   *
   * @param value
   * @returns
   */
  from<T>(value: T | undefined): Maybe<T> {
    if (value === undefined) return none;
    return new Some(value);
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
    if (value == undefined) return none;
    return new Some(value);
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
    return new Some(value);
  },

  /**
   * Create a Some from the value
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
