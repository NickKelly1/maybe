# @nkp/maybe

[![npm version](https://badge.fury.io/js/%40nkp%2Fmaybe.svg)](https://www.npmjs.com/package/@nkp/maybe)
[![Node.js Package](https://github.com/NickKelly1/maybe/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/NickKelly1/maybe/actions/workflows/npm-publish.yml)
![Known Vulnerabilities](https://snyk.io/test/github/NickKelly1/maybe/badge.svg)

Utility class and metods for workin with values that may or may not be exist.

A `Maybe<T>` is a value that may either be `T` or not exist. Also known as an "Option.".

The type signature of `Maybe` is `Maybe<T> = Some<T> | None`.

`Some<T>` represents a value that definitely exists.

`None` represents a value that does not exist.

## Table of contents

- [Installation](#installation)
  - [npm](#npm)
  - [yarn](#yarn)
  - [Exports](#exports)
- [Usage](#usage)
  - [Creating a Maybe](#creating-a-maybe)
  - [Methods](#methods)
    - [exclude](#exclude)
    - [filter](#filter)
    - [flat](#flat)
    - [flatMap](#flatmap)
    - [flatMapNone](#flatmapnone)
    - [isNone](#isnone)
    - [isSome](#issome)
    - [map](#map)
    - [mapNone](#mapnone)
    - [tap](#tap)

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

// from
let maybeSome: Maybe<number> = Maybe.from(5); // Some<number>
maybeSome.value; // 5 (ts: number | undefined)

let maybeNone: Maybe<number> = Maybe.from<number>(undefined); // None
maybeNone.value; // undefined

// some
let some: Some<number> = Maybe.some(5);

// none
let none: None = Maybe.none;

// fromNonNullable
maybeSome = Maybe.fromNonNullable(undefined); // None
maybeSome = Maybe.fromNonNullable(null); // None
maybeSome = Maybe.fromNonNullable(0); // Some

// fromTruthy
maybeSome = Maybe.fromTruthy(undefined); // None
maybeSome = Maybe.fromTruthy(null); // None
maybeSome = Maybe.fromTruthy(0); // None
maybeSome = Maybe.fromTruthy(1); // Some
```

### Methods

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

### tap

Call a synchronous side effect

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

## Releasing a new version

To a release a new version:

1. Update the version number in package.json
2. Push the new version to the `master` branch on GitHub
3. Create a `new release` on GitHub for the latest version

This will trigger a GitHub action that tests and publishes the npm package.
