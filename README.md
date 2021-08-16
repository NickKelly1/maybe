# @nkp/maybe

![npm version](https://badge.fury.io/js/%40nkp%2Fmaybe.svg)
[![Node.js Package](https://github.com/NickKelly1/maybe/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/NickKelly1/maybe/actions/workflows/npm-publish.yml)
![Known Vulnerabilities](https://snyk.io/test/github/NickKelly1/maybe/badge.svg)

A `Maybe<T>` is a value that may either be `T` or not exist. Also known as an "Option.".

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

### map

Maps the `Some` side of the maybe.

```ts
import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.map(number => number + 1); // does get called

const maybe = Maybe.none;
maybe.map(any => any + 1); // doesn't get called
```

### mapNone

Maps the `None` side of the maybe.

```ts
import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
some.mapNone(() => number + 1); // doesn't get called

const none = Maybe.none;
none.mapNone(() => 5); // does get called
```

### flatMap

Maps into another Maybe and flattens them together

```ts
import { Maybe } from '@nkp/maybe';

const some = Maybe.from(5);
const nested: Maybe<Maybe<number>> = some.map(number => Maybe.some(number + 1));
const flat: Maybe<number> = some.flatMap(number => Maybe.some(number + 1));
```

### tap

Call a synchronous side effect

```ts
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
