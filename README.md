# @nkp/maybe

[![npm version](https://badge.fury.io/js/%40nkp%2Fmaybe.svg)](https://www.npmjs.com/package/@nkp/maybe)
[![Node.js Package](https://github.com/NickKelly1/maybe/actions/workflows/release.yml/badge.svg)](https://github.com/NickKelly1/maybe/actions/workflows/release.yml)
![Known Vulnerabilities](https://snyk.io/test/github/NickKelly1/maybe/badge.svg)

NPM package with utilities for working with values that may not exist.

`Maybe<T>` wraps a value that is either `T` or does not exist. `Maybe's` type signature is `Maybe<T> = Some<T> | None`.

`Some<T>` wraps a value that definitely exists.

`None` represents a value that does not exist.

`@nkp/maybe` provides a `Maybe` type, `Some`, `None` and `MaybeBase` classes that provide a fluent API for working with `Maybe` types.

## Table of contents

- [Installation](#installation)
  - [npm](#npm)
  - [yarn](#yarn)
  - [Exports](#exports)
- [Usage](#usage)
  - [Creating a Maybe](#creating-a-maybe)
  - [Methods](#methods)
    - [all](#all)
    - [allObj](#allobj)
    - [at](#at)
    - [bimap](#bimap)
    - [compact](#compact)
    - [exclude](#exclude)
    - [filter](#filter)
    - [finite](#finite)
    - [flat](#flat)
    - [flatBimap](#flatbimap)
    - [flatMap](#flatmap)
    - [flatMapNone](#flatmapnone)
    - [gt](#gt)
    - [gte](#gte)
    - [isNone](#isnone)
    - [isSome](#issome)
    - [lt](#lt)
    - [lte](#lte)
    - [map](#map)
    - [mapNone](#mapnone)
    - [mapSelf]($mapself)
    - [match](#match)
    - [matchAll](#matchall)
    - [matching](#matching)
    - [notMatching](#notmatching)
    - [notNaN](#notnan)
    - [notNull](#notnull)
    - [notNullable](#notnullable)
    - [notUndefined](#notundefined)
    - [parseFloat](#parsefloat)
    - [parseInt](#parseint)
    - [pluck](#pluck)
    - [repeat](#repeat)
    - [replace](#replace)
    - [replaceAll](#replaceall)
    - [slice](#slice)
    - [string](#string)
    - [tap](#tap)
    - [tapBoth](#tapboth)
    - [tapNone](#tapnone)
    - [tapSelf](#tapself)
    - [throw]($throw)
    - [throwError]($throwerror)
    - [throwErrorLike]($throwerrorlike)
    - [throwW]($throww)

## Installation

### NPM

```sh
npm install @nkp/maybe
```

### Yarn

```sh
yarn add @nkp/maybe
```

### Exports

`@nkp/maybe` targets CommonJS and ES modules. To utilise ES modules consider using a bundler like `webpack` or `rollup`.

## Usage

### Creating a Maybe

```ts
import { Maybe, Some, None } from '@nkp/maybe';

// some
let some: Some<number> = Maybe.from(5);

// none
let none: None = Maybe.none;

// from
let maybe: Maybe<number> = Maybe.from(5);
```

### Methods

#### all

Split and transform the `Maybe<T>` then join the results into a tuple (array).

- If all values return `Some`, `.all` returns `Some`
- If any value returns `None`, `.all` returns `None`

Similar to [allObj](#allobj) and  `Promise.all`.

```ts
// signature

import { Unary, MaybeLike, Maybeable, UnwrapMaybeable } from '@nkp/maybe';

interface Maybe<T> {
  all<U extends [...Maybeable[]]>(
    maybeables: Unary<this, [...U]>
  ): Maybe<UnwrapMaybeables<U>>;
}

```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

const number: Maybe<number> = some(5) as Maybe<number>;

const numbers: Maybe<[
  original: number,
  counting: number[],
  plus1: number,
  string: string,
  literal: string,
  greetings: string,
  div2: number,
]> = number.all((self) => [
  () => self,
  () => [1, 2, 3,],
  () => self.map(n => n + 1),
  () => self.map(String),
  'literal string value',
  Maybe.from('merry christmas'),
  self.map(n => n / 2),
]);
```

#### allObj

Split and transform the `Maybe<T>` then join the results into an object.

- If all values return `Some`, `.all` returns `Some`
- If any value returns `None`, `.all` returns `None`

Similar to [all](#all).

```ts
// signature

import { Unary, MaybeLike, Maybeable, UnwrapMaybeable } from '@nkp/maybe';

interface Maybe<T> {
  allObj<M extends Record<PropertyKey, Maybeable>>(
    maybeables: Unary<this, M>
  ): Maybe<{ [K in keyof M]: UnwrapMaybeable<M[K]> }>;
}


```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

const number: Maybe<number> = some(5) as Maybe<number>;

const numbers: Maybe<{
  original: number,
  counting: number[],
  plus1: number,
  string: string,
  literal: string,
  greetings: string,
  div2: number,
}> = number.allObj((self) => ({
  original: () => self,
  counting: () => [1, 2, 3,],
  plus1: () => self.map(n => n + 1),
  string: () => self.map(String),
  literal: 'string literal',
  greetings: Maybe.from('merry christmas'),
  div2: self.map(n => n / 2),
}));
```

#### at

If the value is iterable, retrieve it's `i'th` element's value.

Allows for reverse indexing.

Internally caches the iterable asn an array.

If the value is not iterable, returns the `Some [value]` from 0 and -1 indexes and `None` for any other provided index.

```ts
// signature

interface Maybe<T> {
  // tuples
  at<U extends any[], I extends keyof U>(this: MaybeKind<U>, index: I): Maybe<U[I]>
  // arrays
  at<U>(this: MaybeKind<U[]>, index: number): Maybe<U>
  // any iterable type
  at<U>(this: MaybeKind<Iterable<U>>, index: number): Maybe<U>
  // non-iterable
  at(index: number): None
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

// arrays are the familiar iterable type
const maybe = Maybe.some([1, 2, 3])

// forward indexing
maybe.at(0); // Some [1]
maybe.at(1); // Some [2]
maybe.at(2); // Some [3]
maybe.at(3); // None      - out of bounds

// reverse indexing
maybe.at(-1); // Some [3]
maybe.at(-2); // Some [2]
maybe.at(-3); // Some [1]
maybe.at(-4); // None      - out of bounds


// other iterable types

// strings are iterable
const string = Maybe.some('strings are iterable')

string.at(0); // Some ['s']
string.at(1); // Some ['t']
string.at(2); // Some ['r']
// ...

// sets are iterable
const set = Maybe.some(new Set(1, 2, 3))

string.at(0); // Some [1]
string.at(1); // Some [2]
string.at(2); // Some [3]
string.at(3); // None
// ...

```

### bimap

Map both sides of the `Maybe` into a `Some`

```ts
// signature

interface Maybe<T> {
  bimap<S, N>(
    onSome: (value: T) => S,
    onNone: () => N
  ): Maybe<S | N>
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const score: Maybe<number> = Maybe.from(80);
const report: Some<number> = maybe.bimap(
  (score) => `scored: ${score}`,
  () => 'no score',
);
```

#### compact

Remove falsy values from the Maybe.

```ts
// signature

interface Maybe<T> {
  compact(): Maybe<NonNullable<T>>;
}
```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

const falseable: Maybe<string | number | null | undefined> = some(0);

const trueable: Maybe<string | number> = falseable.compact();
```

#### exclude

Applies a filter to the `Maybe<T>`, turning the `Maybe<T>` into a `None` if it's `Some<T>` value equals one of the excluded values.

```ts
// signature

interface Maybe<T> {
  exclude(...values: T[]): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe
  .from(5)            // Some [5]
  .exclude(2, 3, 4)   // Some [5]
  .exclude(5);        // None
```

#### filter

Applies a filter to the `Maybe<T>`, turning the `Maybe<T>` into a `None` if `callbackfn` returns false.

```ts
// signature

interface Maybe<T> {
  filter(callbackfn: (item: T) => boolean): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const = lt(ltNum: number) => (value: number) => value < ltNum;

const some = Maybe
  .from(5)        // Some [5]
  .filter(lt(6))  // Some [5]
  .filter(lt(4)); // None
```

#### finite

Conver the value to a number.

- if the number is finite returns `Some<number>`
- if the number is not finite, including `Number.NaN`, returns `None`

```ts
// signature

interface Maybe<T> {
  finite(): Maybe<number>;
}
```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

some(5).finite();                          // Some [5]
some('5').finite();                        // Some [5]
some('5.9999').finite();                   // Some [5.9999]
some('not a number').finite();             // None
some(Number.POSITIVE_INFINITY).finite();   // None
some(Number.NEGATIVE_INFINITY).finite();   // None
```

#### flat

Flattens a `Maybe<Maybe<T>>` into a `Maybe<T>`.

```ts
// signature

interface Maybe<T> {
  flat(): T extends <Maybe<Maybe<infer U>>> ? Maybe<U> : Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const nested: Maybe<Maybe<number>> = Maybe.from(Maybe.from(5));

const flattened: Maybe<number> = nested.flat();
```

### flatBimap

Map both sides of the `Maybe` into another `Maybe` and flatten.

```ts
// signature

import { MaybeValue, MaybeLike } from '@nkp/maybe';

interface Maybe<T> {
  flatBimap<S extends MaybeLike<any>, N extends MaybeLike<any>>(
    onSome: (value: T) => S,
    onNone: () => N
  ): Maybe<MaybeValue<S> | MaybeValue<N>> {
}
```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

const hex: Maybe<string> = Maybe.from('#ffaa33');
const parsed: Maybe<number | null> = maybe.flatBimap(
  // value was provided but may be invalid
  // if invalid, turn into None
  (string) => some(string).replace(/^#/, '').parseInt(16),
  // no value provided, set a default
  () => some('aabbcc').parseInt(16),
);
```

#### flatMap

Maps the `Some<T>` side of a `Maybe<T>` into a `Maybe<U>` and flattens into a `Maybe<U>`.

```ts
// signature

interface Maybe<T> {
  flatMap<U>(callbackfn: (item: T) => Maybe<U>): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some: Maybe<number> = Maybe.from(5);

// without flattening:
// mapping into a Maybe create a nested Maybe
const nested: Maybe<Maybe<string>> = some
  .map(number => Maybe.some(`${number + 1}`));

// with flattening:
// we are left with an un-nested Maybe
const flat: Maybe<string> = some
  .flatMap(number => Maybe.some(`${number + 1}`));
```

#### flatMapNone

Maps the `None` side of the `Maybe<T>` into a `Maybe<U>` and flattens into a `Maybe<T | U>`

```ts
// signature

interface Maybe<T> {
  flatMapNone<U>(callbackfn: () => Maybe<U>): Maybe<T | U>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const none: Maybe<number> = Maybe.none;

// if the Maybe<T> is a Some<T>, it is kept
// if the Maybe<T> is a  None, it becomes a Some<U>
const mapped: Maybe<number | string> = none
  .flatMapNone(() => Maybe.some('hello :)'));
```

### gt

Keep only values greater-than the given value.

```ts
// signature

interface Maybe<T> {
  gt(callbackfn: (self: this) => unknown): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.gt(6); // None
some.gt(5); // None
some.gt(4); // Some [5]
```

### gte

Keep only values greater-than or equal-to the given value.

```ts
// signature

interface Maybe<T> {
  gt(callbackfn: (self: this) => unknown): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.gt(6); // None
some.gt(5); // Some [5]
some.gt(4); // Some [5]
```

#### isNone

Is the `Maybe<T>` a `None`?

```ts
// signature

interface Maybe<T> {
  isNone(this: Maybe<T>): this is None;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const maybe: Maybe<number> = Maybe.none;

if (maybe.isNone()) {
  // IDE knows that `maybe` is a `None`
} else {
  // IDE knows that `maybe` is a `Some<number>`
}
```

#### isSome

Is the `Maybe<T>` a `Some<T>`?

```ts
// signature

interface Maybe<T> {
  isSome(this: Maybe<T>): this is Some<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const maybe: Maybe<number> = Maybe.from(5);

if (maybe.isSome()) {
  // IDE knows that `maybe` is a `Some<number>`
} else {
  // IDE knows that `maybe` is a `None`
}
```

### lt

Keep only values less-than the given value.

```ts
// signature

interface Maybe<T> {
  lt(callbackfn: (self: this) => unknown): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.lt(6); // Some [5]
some.lt(5); // None
some.lt(4); // None
```

### lte

Keep only values less-than or equal-to the given value.

```ts
// signature

interface Maybe<T> {
  lte(callbackfn: (self: this) => unknown): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.lte(6); // Some [5]
some.lte(5); // Some [5]
some.lte(4); // None
```

#### map

Maps the `Some` side of the maybe.

```ts
// signature

interface Maybe<T> {
  map<U>(callbackfn: (item: T) => U): Maybe<U>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.map(number => number + 1); // does get called

const maybe = Maybe.none;
maybe.map(any => any + 1); // doesn't get called
```

#### mapNone

Maps the `None` side of the maybe.

```ts
// signature

interface Maybe<T> {
  mapNone<U>(callbackfn: () => U): Maybe<T | U>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.mapNone(() => number + 1); // doesn't get called

const none = Maybe.none;
none.mapNone(() => 5); // does get called
```

#### mapSelf

Maps the Maybe instance to another value.

```ts
// signature

interface Maybe<T> {
  mapSelf<R>(callbackfn: (self: this) => R): R;
}
```

```ts
// usage

import { Maybe, None, Some } from '@nkp/maybe';

const some = Maybe.from(5);
some.mapSelf((self: Some<number>) => self.value + 1); // 6 

const none = Maybe.none;
none.mapSelf((self: None) => 5); // 5
```

### match

Match the value against a RegExp.

- If matched returns `Some`
- If failed returns `None`

```ts
// signature

interface Maybe<T> {
  match(regexp: RegExp | string): Maybe<RegExpMatchArray>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from('style.css');

// extract the basename if the extension is css
some.match(/(.*)\.css$/); // Some [[style.css, 'style', ...]]
some.match(/(.*)\.js$/); // None

// extract the extension
some.match(/(.*)\.([^.]*)$/); // Some [['style.css', 'css', ...]]
```

### matchAll

Match All using the RegExp.

Similar to `String.prototype.matchAll`.

Don't forget the `g` RegExp flat required for `String.prototype.matchAll`!

```ts
// signature

interface Maybe<T> {
  matchAll(regexp: RegExp | string): Maybe<RegExpMatchArray[]>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const text = Maybe.from(`multi
line string with #ffaa11
some hex colours
hidden #aabbcc within
`);

text.matchAll(/#[0-9a-f]{6}[0-9a-f]{0,2}/mig);
/**
 * Some [[
 *  RegExpMatchArray [#ffaa11]
 *  RegExpMatchArray [#aabbcc]
 * ]]
 */
```

### matching

Filter in values matching the given regex.

```ts
// signature

interface Maybe<T> {
  matching(regexp: RegExp | string): Maybe<string>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from('style.css');

// keep only .css
some.matching(/\.css$/); // Some ['style.css']

// keep only .js
some.match(/\.js$/); // None
```

### notMatching

Filter out values matching the given regex.

```ts
// signature

interface Maybe<T> {
  notMatching(regexp: RegExp | string): Maybe<string>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from('style.css');

// removw .css
some.notMatching(/\.css$/); // None

// remove .js
some.notMatch(/\.js$/); // Some ['style.css']
```

#### notNaN

Conver the value to a number.

- if the number is `Number.NaN` returns `None`
- if the number is not `Number.NaN`, including `Number.POSITIVE_INFINITY` and `Number.NEGATIVE_INFINITY`, returns `Some<number>`

```ts
// signature

interface Maybe<T> {
  notNaN(): Maybe<number>;
}
```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

some(5).notNaN();                          // Some [5]
some('5').notNaN();                        // Some [5]
some('5.9999').notNaN();                   // Some [5.9999]
some('not a number').notNaN();             // None
some(Number.POSITIVE_INFINITY).notNaN();   // Some [Number.POSITIVE_INFINITY]
some(Number.NEGATIVE_INFINITY).notNaN();   // Some [Number.NEGATIVE_INFINITY]
```

### notNull

Filter out null values.

```ts
// signature

interface Maybe<T> {
  notNull(): Maybe<T extends null ? never : string>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const maybe = Maybe.from<string | null>('style.css');

const defined: Maybe<string> = maybe.notNull();
```

### notNullable

Filter null and undefined values.

```ts
// signature

interface Maybe<T> {
  notNullable(): Maybe<NonNullable<T>>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const maybe = Maybe.from<string | null | undefined>('style.css');

const defined: Maybe<string> = maybe.notNullable();
```

### notUndefined

Filter out undefined values.

```ts
// signature

interface Maybe<T> {
  notUndefined(): Maybe<T extends undefined ? never : string>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const maybe = Maybe.from<string | undefined>('style.css');

const defined: Maybe<string> = maybe.notUndefined();
```

### parseFloat

Attempt to parse a string as a floating-point number. Uses the native `parseFloat` function internally.

If the value is not a string then `parseFloat` will convert it to string.

```ts
// signature

interface Maybe<T> {
  parseFloat(): Maybe<number>;
}

```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

const string: Some<string> = some('10.5');
const number: Maybe<number> = string.parseFloat();
// Some [10.5]
```

### parseInt

Attempt to parse a string as am integer. Uses the native `parseInt` function internally.

If the value is not a string then `parseInt` will convert it to string.

```ts
// signature

interface Maybe<T> {
  parseInt(radix?: number): Maybe<number>;
}

```

```ts
// usage

import { Maybe, some } from '@nkp/maybe';

const string: Some<string> = some('11');
const number: Maybe<number> = string.parseInt(8);
// Some [9]
```

### pluck

Extract a key from the value.

```ts
// signature

interface Maybe<T> {
  pluck<K extends keyof T>(key: K): Maybe<T[K]>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

interface Cat { name: string, }

const cat: Some<Cat> = Maybe.some<Cat>({ name: 'Furball', });

const name: Maybe<string> = cat.pluck('name'); // Some ['Furball']
```

### repeat

Repeat a string `count` times.

Similar to `String.prototype.repeat`.

```ts
// signature

import { MaybeLike } from '@nkp/maybe';

interface Maybe<T> {
  repeat(
    this: MaybeLike<string>,
    count: number,
  ): Maybe<string>
}
```

```ts
// usage

import { some } from '@nkp/maybe';

some(':(').repeat(0); // Some ['']
some('merry christmas').repeat(1); // Some ['merry christmas']
some(':)').repeat(5); // Some [':):):):):)']
```

### replace

Replace part of a string.

Similar to `String.prototype.replace`.

```ts
// signature

interface Maybe<T> {
  replace(
    this: MaybeLike<string>,
    searchValue: RegExp | string,
    replaceValue: string
  ): Maybe<string>
}
```

```ts
// usage

import { some } from '@nkp/maybe';

some("Let's eat, Grandma!").replace(/,/, '')
// Some ['Let's eat Grandma!']
```

### replaceAll

Replace matched parts of a string.

Similar to `String.prototype.replaceAll`.

```ts
// signature

interface Maybe<T> {
  replaceAll(
    this: MaybeLike<string>,
    searchValue: RegExp | string,
    replaceValue: string
  ): Maybe<string>
}
```

```ts
// usage

import { some } from '@nkp/maybe';

some("I love cooking, my family, and my dog").replaceAll(/,/, '')
// Some ['I love cooking my family and my dog']
```

### slice

Extract a subsection of the array or string.

Similar to `String.prototype.slice` and `Array.prototype.slice`

```ts
// signature

import { IHasSlice } from '@nkp/iterable';

interface Maybe<T> {
  slice(
    this: MaybeLike<IHasSlice>,
    start?: number,
    end?: number
  ): Maybe<T>;
}
```

### string

Coerce the `Some` value into a string.

If coersion throws, maps into a `None`.

```ts
// signature

import { IHasSlice } from '@nkp/iterable';

interface Maybe<T> {
  slice(
    this: MaybeLike<IHasSlice>,
    start?: number,
    end?: number
  ): Maybe<T>;
}
```

```ts
// usage

import { some } from '@nkp/maybe';

some('collapsible umbrella lady').slice(21);
// Some ['collapsible unmbrella']

some('collapsible umbrella lady').slice(12, 21);
// Some ['collapsible lady']

some(['collapsible', 'umbrella', 'lady']).slice(0, 1);
// Some [['umbrella', 'lady']]
```

### tap

Fire a callback on the `Some` side.

Does not affect the `Maybe`.

```ts
// signature

interface Maybe<T> {
  tap(callbackfn: (item: T) => unknown): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some
  .tap(value => console.log(`the value is: ${value}`))
  .map(function doWork() { /* ... */ });
```

### tapBoth

Fire a callback on both the `Some` and `None` sides.

Does not affect the `Maybe`.

```ts
// signature

interface Maybe<T> {
  tapBoth(
    onSome: (value: T) => unknown,
    onNone: () => unknown
  ): this 
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some
  .tapBoth(
    value => console.log(`the value is: ${value}`),
    () => console.log('the value doesn\'t exist'),
  )
```

### tapNone

Fire a callback on `None` side.

Does not affect the `Maybe`.

```ts
// signature

interface Maybe<T> {
  tapNone(callbackfn: () => unknown): Maybe<T>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some
  .tapNone(() => console.log(`it's none`))
  .map(function doWork() { /* ... */ });
```

### tapSelf

Call a synchronous side effect with a reference to the `Maybe`.

```ts
// signature

interface Maybe<T> {
  tapSelf(callbackfn: (self: this) => unknown): this;
}
```

### throw

Throw the current value.

Only allowed to run when the value is of type Error.

For throwing on any value, use [throwW](#throww);

```ts
// signature

interface Maybe<T> {
  throw(this: Maybe<Error>): None;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.some(new Error('something went wrong'));
some.throw()
```

### throwError

Throw the current value if it's an instance of the Error class.

```ts
// signature

interface Maybe<T> {
  throwError(): Maybe<Exclude<T, Error>>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some: Maybe<Error | number> =
  Maybe.some<Error | number>(new Error('something went wrong'));

const next: Maybe<number> = some.throwError();
```

### throwErrorLike

Throw the current value if it's an Error-Like object.

```ts
// signature

import { ErrorLike } from '@nkp/maybe';

interface Maybe<T> {
  throwErrorLike(): Maybe<Exclude<T, ErrorLike>>;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some: Maybe<ErrorLike | number> =
  Maybe.some<ErrorLike | number>({
    message: 'something went wrong',
  });

const next: Maybe<number> = some.throwErrorLike();
```

### throwW

Throw the current value.

For stricter type checking to only allow throwing on errors, use [throw](#throw);

```ts
// signature

interface Maybe<T> {
  throwW(): None;
}
```

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.some(5);

const next: None = some.throwW();
```

## Publishing a new version

To a release a new version:

1. Update the version number in package.json
2. Push the new version to the `master` branch on GitHub
3. Create a `new release` on GitHub for the latest version

This will trigger a GitHub action that tests and publishes the npm package.
