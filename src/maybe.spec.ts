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

    describe('.tapNone(...)', () => {
      it('Some -> Some', () => {
        let effect = 0;
        const maybe = Maybe.some(5).tapNone(() => { effect = 5; });
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
        expect(effect).toBe(0);
      });

      it('None -> None', () => {
        let effect = 0;
        const maybe = Maybe.none.tapNone(() => { effect = 5; });
        expect(maybe.isNone()).toBe(true);
        expect(maybe.value).toBe(undefined);
        expect(effect).toBe(5);
      });
    });

    describe('.tapSelf(...)', () => {
      it('Some -> Some', () => {
        let effect: undefined | Maybe<number> = undefined;
        const maybe = Maybe.some(5).tapSelf((self) => { effect = self; });
        expect(maybe.isSome()).toBe(true);
        expect(maybe.value).toBe(5);
        expect(effect === maybe).toBe(true);
      });

      it('None -> None', () => {
        let effect: undefined | Maybe<number> = undefined;
        const maybe = Maybe.none.tapSelf((self) => { effect = self; });
        expect(maybe.isNone()).toBe(true);
        expect(effect === maybe).toBe(true);
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

    describe('.notMatchin(...)', () => {
      it('Some -> Some', () => {
        const m1: Maybe<string> = Maybe.some('hi there');
        const m2: Maybe<string> = m1.notMatching(/i th/);
        expect(m2.isSome()).toBe(false);
      });

      it('Some -> None', () => {
        const m1: Maybe<string> = Maybe.some('hi there');
        const m2: Maybe<string> = m1.notMatching(/i thh/);
        expect(m2.isSome()).toBe(true);
        expect(m2.unwrap()).toBe('hi there');
      });

      it('None -> None', () => {
        const m1: Maybe<string> = Maybe.none;
        const m2: Maybe<string> = m1.notMatching(/i thh/);
        expect(m2.isSome()).toBe(false);
      });
    });

    describe('.matching(...)', () => {
      it('Some -> Some', () => {
        const m1: Maybe<string> = Maybe.some('hi there');
        const m2: Maybe<string> = m1.matching(/i th/);
        expect(m2.isSome()).toBe(true);
        expect(m2.unwrap()).toBe('hi there');
      });

      it('Some -> None', () => {
        const m1: Maybe<string> = Maybe.some('hi there');
        const m2: Maybe<string> = m1.matching(/i thh/);
        expect(m2.isSome()).toBe(false);
      });

      it('None -> None', () => {
        const m1: Maybe<string> = Maybe.none;
        const m2: Maybe<string> = m1.matching(/i thh/);
        expect(m2.isSome()).toBe(false);
      });
    });

    describe('.notUndefined(...)', () => {
      it('Some -> Some', () => {
        const m1: Maybe<string | undefined> = Maybe.some('hi there');
        const m2: Maybe<string> = m1.notUndefined();
        expect(m2.isSome()).toBe(true);
        expect(m2.unwrap()).toBe('hi there');
      });

      it('Some -> None', () => {
        const m1: Maybe<string | undefined> = Maybe.some(undefined);
        const m2: Maybe<string> = m1.notUndefined();
        expect(m2.isSome()).toBe(false);
      });

      it('None -> None', () => {
        const m1: Maybe<string | undefined> = Maybe.none;
        const m2: Maybe<string> = m1.notUndefined();
        expect(m2.isSome()).toBe(false);
      });
    });

    describe('.notUndefined(...)', () => {
      it('Some -> Some', () => {
        const m1: Maybe<string | null> = Maybe.some('hi there');
        const m2: Maybe<string> = m1.notNull();
        expect(m2.isSome()).toBe(true);
        expect(m2.unwrap()).toBe('hi there');
      });

      it('Some -> None', () => {
        const m1: Maybe<string | null> = Maybe.some(null);
        const m2: Maybe<string> = m1.notNull();
        expect(m2.isSome()).toBe(false);
      });

      it('None -> None', () => {
        const m1: Maybe<string | null> = Maybe.none;
        const m2: Maybe<string> = m1.notNull();
        expect(m2.isSome()).toBe(false);
      });
    });

    describe('.notNullable(...)', () => {
      it('Some -> Some', () => {
        const m1: Maybe<string | null | undefined> = Maybe.some('hi there');
        const m2: Maybe<string> = m1.notNullable();
        expect(m2.isSome()).toBe(true);
        expect(m2.unwrap()).toBe('hi there');
      });

      it('Some -> None (1)', () => {
        const m1: Maybe<string | null | undefined> = Maybe.some(null);
        const m2: Maybe<string> = m1.notNullable();
        expect(m2.isSome()).toBe(false);
      });

      it('Some -> None (2)', () => {
        const m1: Maybe<string | null | undefined> = Maybe.some(undefined);
        const m2: Maybe<string> = m1.notNullable();
        expect(m2.isSome()).toBe(false);
      });

      it('None -> None', () => {
        const m1: Maybe<string | null | undefined> = Maybe.none;
        const m2: Maybe<string> = m1.notNullable();
        expect(m2.isSome()).toBe(false);
      });
    });

    describe('.gt(...)', () => {
      describe('Some -> Some', () => {
        it('number', () => {
          const maybe = Maybe.some(5).gt(4);
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(5);
        });
        it('Date', () => {
          const maybe = Maybe.some(new Date()).gt(new Date(Date.now() - 20_000));
          expect(maybe.isSome()).toEqual(true);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).gt(BigInt(499));
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(BigInt(500));
        });
      });

      describe('Some -> None', () => {
        it('number', () => {
          const maybe = Maybe.some(5).gt(5);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const now = new Date();
          const maybe = Maybe.some(now).gt(now);
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).gt(BigInt(500));
          expect(maybe.isSome()).toEqual(false);
        });
      });

      describe('None -> None', () => {
        it('number', () => {
          const maybe = Maybe.none.gt(5);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const maybe = Maybe.none.gt(new Date());
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.none.gt(BigInt(500));
          expect(maybe.isSome()).toEqual(false);
        });
      });
    });

    describe('.gte(...)', () => {
      describe('Some -> Some', () => {
        it('number', () => {
          const maybe = Maybe.some(5).gte(5);
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(5);
        });
        it('Date', () => {
          const now = new Date();
          const maybe = Maybe.some(now).gte(now);
          expect(maybe.isSome()).toEqual(true);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).gte(BigInt(500));
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(BigInt(500));
        });
      });

      describe('Some -> None', () => {
        it('number', () => {
          const maybe = Maybe.some(5).gte(6);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const now = new Date();
          const maybe = Maybe.some(now).gte(new Date(Date.now() + 20_000));
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).gte(BigInt(501));
          expect(maybe.isSome()).toEqual(false);
        });
      });

      describe('None -> None', () => {
        it('number', () => {
          const maybe = Maybe.none.gte(5);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const maybe = Maybe.none.gte(new Date());
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.none.gte(BigInt(500));
          expect(maybe.isSome()).toEqual(false);
        });
      });
    });

    describe('.lt(...)', () => {
      describe('Some -> Some', () => {
        it('number', () => {
          const maybe = Maybe.some(5).lt(6);
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(5);
        });
        it('Date', () => {
          const maybe = Maybe.some(new Date()).lt(new Date(Date.now() + 20_000));
          expect(maybe.isSome()).toEqual(true);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).lt(BigInt(501));
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(BigInt(500));
        });
      });

      describe('Some -> None', () => {
        it('number', () => {
          const maybe = Maybe.some(5).lt(5);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const now = new Date();
          const maybe = Maybe.some(now).lt(now);
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).lt(BigInt(500));
          expect(maybe.isSome()).toEqual(false);
        });
      });

      describe('None -> None', () => {
        it('number', () => {
          const maybe = Maybe.none.lt(5);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const maybe = Maybe.none.lt(new Date());
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.none.lt(BigInt(500));
          expect(maybe.isSome()).toEqual(false);
        });
      });
    });

    describe('.lte(...)', () => {
      describe('Some -> Some', () => {
        it('number', () => {
          const maybe = Maybe.some(5).lte(5);
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(5);
        });
        it('Date', () => {
          const now = new Date();
          const maybe = Maybe.some(now).lte(now);
          expect(maybe.isSome()).toEqual(true);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).lte(BigInt(500));
          expect(maybe.isSome()).toEqual(true);
          expect(maybe.value).toEqual(BigInt(500));
        });
      });

      describe('Some -> None', () => {
        it('number', () => {
          const maybe = Maybe.some(5).lte(4);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const now = new Date();
          const maybe = Maybe.some(now).lte(new Date(Date.now() - 20_000));
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.some(BigInt(500)).lte(BigInt(499));
          expect(maybe.isSome()).toEqual(false);
        });
      });

      describe('None -> None', () => {
        it('number', () => {
          const maybe = Maybe.none.lte(5);
          expect(maybe.isSome()).toEqual(false);
        });
        it('Date', () => {
          const maybe = Maybe.none.lte(new Date());
          expect(maybe.isSome()).toEqual(false);
        });
        it('BigInt', () => {
          const maybe = Maybe.none.lte(BigInt(500));
          expect(maybe.isSome()).toEqual(false);
        });
      });
    });
  });
});
