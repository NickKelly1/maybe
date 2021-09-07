# Changelog

## 0.0.34 - 2021-09-06

### Added

- `replaceAll`

### Changed

- Updated readme.md

## 0.0.33 - 2021-09-06

### Added

- `bimap`
- `flatBimap`
- `matchAll`
- `repeat`
- `replace`
- `slice`
- `tapBoth`

### Changed

- Improved version compatibility
- Improved typings
- Fixed bugs with `flatMapNone` and `mapNone`

## 0.0.32 - 2021-09-06

### Added

- Added `allObj`
- Added tests

### Changed

- Significantly imporved `all` type signature using tuples and inference
- Fixed some TS bugs in tests

## 0.0.31 - 2021-09-06

### Changed

- Updated `all` signature
- Updated readme.md

## 0.0.30 - 2021-09-06

### Added

- `parseInt`
- `parseFloat`
- `notNaN`
- `finite`
- Tests

### Changed

- Updated readme.md

## 0.0.29 - 2021-09-06

### Changed

- Updated readme.md

## 0.0.28 - 2021-09-06

### Added

- Added `all`
- Added `compact`

### Changed

- Loosened typing on `flatMap` and `flatMapNone`
- Renamed changelog.md to CHANGELOG.md
- Fixed dependency issue

## 0.0.27 - 2021-09-05

### Added

- `MaybeBase.prototype.mapSelf`
- `MaybeBase.prototype.throw`
- `MaybeBase.prototype.throwW`
- `MaybeBase.prototype.throwError`
- `MaybeBase.prototype.throwErrorLike`
- Tests for new methods

### Changed

- Updated readme.md
- Updated dependencies

## 0.0.26 - 2021-09-01

### Changed

- Fixed type discrimination on `SomeLike` and `NoneLike`
- Fixed tag version compatibility

## 0.0.25 - 2021-09-01

### Added

- version type compatibility tests

## 0.0.24 - 2021-09-01

### Added

- Added type `MaybeLike`
- Added type `SomeLike`
- Added type `NoneLike`

## 0.0.23 - 2021-08-31

### Changed

- Updated readme.md

## 0.0.22 - 2021-08-31

### Added

- `MaybeBase.prototype.at`
- `MaybeBase.prototype.pluck`

### Updated

- `MaybeBase.prototype.match`

## 0.0.21 - 2021-08-29

### Changed

- Do not bundle source maps

## 0.0.20 - 2021-08-29

### Changed

- Updated badge
- Updated readme.md

## 0.0.19 - 2021-08-29

### Added

- `MaybeBase.prototype.match`
- `MaybeBase.prototype.matching`
- `MaybeBase.prototype.notMatching`
- `MaybeBase.prototype.notNull`
- `MaybeBase.prototype.notUndefined`
- `MaybeBase.prototype.notNullable`
- `MaybeBase.prototype.gt`
- `MaybeBase.prototype.gte`
- `MaybeBase.prototype.lt`
- `MaybeBase.prototype.lte`

### Changed

- Update Maybe tags
- Updated project configuration

## 0.0.18 - 2021-08-27

### Changed

- Update Maybe tags

## 0.0.17 - 2021-08-27

### Changed

- Updated release.yml

## 0.0.16 - 2021-08-27

- Updated release.yml

### Changed

- updated release.yml

## 0.0.15 - 2021-08-27

### Changed

- CI/CD: Changed `npm-publish` to `release`
- Let GitHub actions handling publishing

## 0.0.14 - 2021-08-23

### Added

- Added `None.prototype.toString`
- Added `Some.prototype.toString`

## 0.0.13 - 2021-08-23

### Added

- Added `MaybeBase.prototype.tapNone`
- Added `MaybeBase.prototype.tapSelf`

### Changed

- Updated readme.md

## 0.0.12 - 2021-08-23

### Changed

- Changed `MaybeBase.isSome`
- Changed `MaybeBase.isNone`

## 0.0.11 - 2021-08-22

### Changed

- Updated dependencies

## 0.0.10 - 2021-08-22

### Changed

- Updated readme.md

## 0.0.9 - 2021-08-22

### Changed

- Target `es6` instead of `es5`

## 0.0.8 - 2021-08-22

### Changed

- No longer minify exports

## 0.0.7 - 2021-08-22

### Added

- `MaybeBase.prototype.flat`

### Changed

- Changed `Maybe<T>` from a base class to a union type `Some<T> | None`
- Updated readme.md

## 0.0.6 - 2021-08-16

### Changed

- Changed the type of `None` from `Maybe<any>` to `Maybe<never>`

## 0.0.5 - 2021-08-15

### Changed

- Updated readme

## 0.0.4 - 2021-08-15

### Changed

- Fixed publish configuration

## 0.0.3 - 2021-08-15

### Changed

- Fixed publish configuration

## 0.0.2 - 2021-08-15

### Changed

- Updated readme

## 0.0.1 - 2021-08-15

### Added

- `Maybe
- `Some`
- `None`
