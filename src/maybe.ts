export enum MaybeType {
  Some = 'Some',
  None = 'None',
}

export type Falsy = 0 | false | null | undefined;

export abstract class Maybe<T> {
  /**
   * Create a Some
   *
   * @param value
   * @returns
   */
  static some<T>(value: T): Some<T> {
    return new Some(value);
  }


  /**
   * Get the None instance
   */
  static get none(): None {
    return none;
  }

  /**
   * Create a new option from the value
   *
   * @param value
   * @returns
   */
  static from<T>(value: T | undefined): Maybe<T> {
    if (value === undefined) return none;
    return new Some(value);
  }

  /**
   * Create a new option from the value
   *
   * @param value
   * @returns
   */
  static fromNonNullable<T>(value: T | null | undefined): Maybe<T> {
    if (value == undefined) return none;
    return new Some(value);
  }

  /**
   * If the value is false, return some
   *
   * @param value
   * @returns
   */
  static fromTruthy<T>(value: T | Falsy): Maybe<T> {
    if (!value) return none;
    return new Some(value);
  }

  /**
   * Create a new Some
   *
   * @param value
   * @returns
   */
  static toSome<T>(value: T): Some<T> {
    return new Some(value);
  }

  /**
   * Is the value a Some?
   *
   * @param maybe
   * @returns
   */
  static isSome<T>(maybe: Maybe<T>): maybe is Some<T> {
    return maybe.isSome();
  }

  /**
   * Is the value a None?
   *
   * @param maybe
   * @returns
   */
  static isNone<T>(maybe: Maybe<T>): maybe is Some<T> {
    return maybe.isNone();
  }

  public abstract readonly value: T | undefined = undefined;
  public abstract type: MaybeType;

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
    return this;
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
    return this;
  }

  /**
   *
   * @param filterFn
   * @returns
   */
  filter(filterFn: (item: T) => boolean): Maybe<T> {
    if (this.isNone()) return this;
    if (filterFn(this.value!)) return this;
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

export class Some<T> extends Maybe<T> {
  public get type(): MaybeType.Some { return MaybeType.Some; }
  public readonly value: T;
  isSome(): true { return true; }
  isNone(): false { return false; }

  constructor(value: T) {
    super();
    this.value = value;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class None extends Maybe<any> {
  public get type(): MaybeType.None { return MaybeType.None; }
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
