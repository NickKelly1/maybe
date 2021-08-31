# @nkp/maybe

[![npm version](https://badge.fury.io/js/%40nkp%2Fmaybe.svg)](https://www.npmjs.com/package/@nkp/maybe)
[![Node.js Package](https://github.com/NickKelly1/maybe/actions/workflows/release.yml/badge.svg)](https://github.com/NickKelly1/maybe/actions/workflows/release.yml)
![Known Vulnerabilities](https://snyk.io/test/github/NickKelly1/maybe/badge.svg)

JavaScript utilities for working with values that may not exist.

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
    - [at](#at)
    - [exclude](#exclude)
    - [filter](#filter)
    - [flat](#flat)
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
    - [match](#match)
    - [matching](#matching)
    - [notMatching](#notMatching)
    - [notNull](#notNull)
    - [notNullable](#notNullable)
    - [notUndefined](#notUndefined)
    - [pluck](#pluck)
    - [tap](#tap)
    - [tapNone](#tap-none)
    - [tapSelf](#tap-self)

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

### match

Match the value with a RegExp expression and extract the requested group.

```ts
// signature

interface Maybe<T> {
  match(regexp: string | RegExp): Maybe<RegExpMatchArray>;
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

### matching

Filter in values matching the given regex.

```ts
// signature

interface Maybe<T> {
  matching(regexp: string | RegExp): Maybe<string>;
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
  notMatching(regexp: string | RegExp): Maybe<string>;
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

### tap

Call a synchronous side effect on each some.

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

### tapNone

Call a synchronous side effect if the type is `None`.

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

```ts
// usage

import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some
  .tapSelf((self) => console.log(`value was: ${self.value}`))
  .map(function doWork() { /* ... */ });
```

## Publishing a new version

To a release a new version:

1. Update the version number in package.json
2. Push the new version to the `master` branch on GitHub
3. Create a `new release` on GitHub for the latest version

This will trigger a GitHub action that tests and publishes the npm package.
