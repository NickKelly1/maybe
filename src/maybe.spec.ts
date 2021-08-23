import { Maybe, Some } from './maybe';

describe('Maybe', () => {
  describe('.some(...)', () => {
    it('1 -> Some', () => {
      const maybe = Maybe.some(1);
      expect(maybe.isSome()).toBe(true);
    });

    it('undefined) -> Some', () => {
      const maybe = Maybe.some(undefined);
      expect(maybe.isSome()).toBe(true);
    });
  });

  describe('.none(...)', () => {
    it('1 -> None', () => {
      const maybe = Maybe.none;
      expect(maybe.isNone()).toBe(true);
    });

    it('true -> None', () => {
      const maybe = Maybe.none;
      expect(maybe.isNone()).toBe(true);
    });
  });

  describe('.from(...)', () => {
    it('false -> Some', () => {
      const maybe = Maybe.from(false);
      expect(maybe.isSome()).toBe(true);
    });

    it('undefined -> None', () => {
      const maybe = Maybe.from(undefined);
      expect(maybe.isNone()).toBe(true);
    });
  });

  describe('.fromNonNullable(...)', () => {
    it('false -> Some', () => {
      const maybe = Maybe.fromNonNullable(false);
      expect(maybe.isSome()).toBe(true);
    });

    it('undefined -> None', () => {
      const maybe = Maybe.fromNonNullable(undefined);
      expect(maybe.isNone()).toBe(true);
    });

    it('null -> None', () => {
      const maybe = Maybe.fromNonNullable(null);
      expect(maybe.isNone()).toBe(true);
    });
  });

  describe('.fromTruthy(...)', () => {
    it('true -> Some', () => {
      const maybe = Maybe.fromTruthy(true);
      expect(maybe.isSome()).toBe(true);
    });

    it('1 -> Some', () => {
      const maybe = Maybe.fromTruthy(1);
      expect(maybe.isSome()).toBe(true);
    });

    it('false -> None', () => {
      const maybe = Maybe.fromTruthy(false);
      expect(maybe.isNone()).toBe(true);
    });

    it('undefined -> None', () => {
      const maybe = Maybe.fromTruthy(undefined);
      expect(maybe.isNone()).toBe(true);
    });

    it('null -> None', () => {
      const maybe = Maybe.fromTruthy(null);
      expect(maybe.isNone()).toBe(true);
    });

    it('\'\' -> None', () => {
      const maybe = Maybe.fromTruthy('');
      expect(maybe.isNone()).toBe(true);
    });
  });

  describe('instance', () => {
    describe('.map(...)', () => {
      it('Some -> Some', () => {
        const maybe = Maybe.some(5).map((v) => v + 1);
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(6);
      });
    });

    describe('.filter(...)', () => {
      it('Some -> Some', () => {
        const maybe = Maybe.some(5).filter(() => true);
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
      });

      it('Some -> None', () => {
        const maybe = Maybe.some(5).filter(() => false);
        expect(maybe.isNone()).toBe(true);
        expect(maybe.value).toBe(undefined);
      });
    });

    describe('.exclude(...)', () => {
      it('Some -> Some', () => {
        const maybe = Maybe.some(5).exclude(6);
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
      });

      it('Some -> None', () => {
        const maybe = Maybe.some(5).exclude(5);
        expect(maybe.isNone()).toBe(true);
        expect(maybe.value).toBe(undefined);
      });
    });

    describe('.tap(...)', () => {
      it('Some -> Some', () => {
        let effect = 0;
        const maybe = Maybe.some(5).tap((v) => { effect = v; });
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
        expect(effect).toBe(5);
      });

      it('None -> None', () => {
        let effect = 0;
        const maybe = Maybe.none.tap((v) => { effect = v; });
        expect(maybe.isNone()).toBe(true);
        expect(maybe.value).toBe(undefined);
        expect(effect).toBe(0);
      });
    });

    describe('.flatMap(...)', () => {
      it('Some -> Some', () => {
        const maybe = Maybe.some(5).flatMap(() => Maybe.from('hi'));
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe('hi');
      });

      it('Some -> None', () => {
        const maybe = Maybe.some(5).flatMap(() => Maybe.none);
        expect(maybe.isNone()).toBe(true);
        expect(maybe.value).toBe(undefined);
      });

      it('Some -> Maybe', () => {
        function maybeSome<T>(val: T): Maybe<T> {
          return Maybe.some(val);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function maybeNone<T>(val: T): Maybe<T> {
          return Maybe.none;
        }
        const root = Maybe.some(5);
        const som = root.flatMap(maybeSome);
        const non = root.flatMap(maybeNone);
        expect(som.isSome()).toBe(true);
        expect(non.isNone()).toBe(true);
      });
    });

    describe('.flat(...)', () => {
      it('Some -> Some', () => {
        const maybe: Some<number> = Maybe.some(Maybe.some(5)).flat();
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
      });

      it('Some -> Maybe', () => {
        const maybe: Maybe<number> = Maybe.some(Maybe.from(5)).flat();
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
      });

      it('Maybe -> Some', () => {
        const maybe: Maybe<number> = Maybe.from(Maybe.some(5)).flat();
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
      });

      it('Some -> None', () => {
        const maybe: Maybe<number> = Maybe.from(Maybe.none as Maybe<number>).flat();
        expect(maybe.isNone()).toBe(true);
        expect(maybe.value).toBe(undefined);
      });
    });

    describe('.unwrap(...)', () => {
      it('Some -> success', () => {
        const maybe = Maybe.some(5);
        expect(maybe.unwrap()).toBe(5);
      });

      it('none -> throw', () => {
        const maybe = Maybe.none;
        expect(() => maybe.unwrap()).toThrow();
      });
    });
  });
});
