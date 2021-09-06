import { Maybe, some } from '../src';

const HEX4 = /^#?[0-9a-f]{3}[0-9a-f]?$/i;
const HEX6 = /^#?[0-9a-f]{6}([0-9a-f][0-9a-f])?$/i;

describe('e2e', () => {
  it('1', () => {
    const hex = '#ff1188';
    const rgba = toRGBA(hex);
    expect(rgba.isSome()).toEqual(true);
    expect(rgba.value).toEqual(new RGBA(255, 17, 136, null));
  });

  it('2', () => {
    const hex = 'ff1188';
    const rgba = toRGBA(hex);
    expect(rgba.isSome()).toEqual(true);
    expect(rgba.value).toEqual(new RGBA(255, 17, 136, null));
  });

  it('3', () => {
    const hex = '#f18';
    const rgba = toRGBA(hex);
    expect(rgba.isSome()).toEqual(true);
    expect(rgba.value).toEqual(new RGBA(255, 17, 136, null));
  });

  it('4', () => {
    const text = Maybe.from(`multi
    line string with #ffaa11
    some hex colours
    hidden #aabbcc within
    `);

    const matched = text.matchAll(/#[0-9a-f]{6}[0-9a-f]{0,2}/mig);

    expect(matched.isSome()).toEqual(true);
    expect(matched.value!.length).toEqual(2);
    expect(matched.value![0]![0]).toEqual('#ffaa11');
    expect(matched.value![1]![0]).toEqual('#aabbcc');
    /**
     * Some [[
     *  RegExpMatchArray [#ffaa11]
     *  RegExpMatchArray [#aabbcc]
     * ]]
     */
  });
});

class RGBA {
  constructor(
    public readonly red: number,
    public readonly green: number,
    public readonly blue: number,
    public readonly alpha: null | number,
  ) {}
}

function toRGBA(hex: string): Maybe<RGBA> {
  const _hex = hex.trim();
  const rgba: Maybe<RGBA> = some(_hex)
    // try HEX4
    .match(HEX4)
    .map<Maybe<RGBA>>((match): Maybe<RGBA> => some(match)
      .at(0)
      .replace(/^#/, '')
      .all((self) => ([
        self.at(0).repeat(2).parseInt(16),
        self.at(1).repeat(2).parseInt(16),
        self.at(2).repeat(2).parseInt(16),
        self.at(3).repeat(2).compact().flatBimap(
          (alpha) => some(alpha).parseInt(16),
          () => some(null),
        ),
      ]))
      .map(([ red, green, blue, alpha, ]) => {
        return new RGBA(red, green, blue, alpha);
      })
    )

    // failed to parse as HEX4
    // try HEX6
    .mapNone((): Maybe<RGBA> => some(_hex)
      .match(HEX6)
      .at(0)
      .replace(/^#/, '')
      .all((self) => ([
        self.slice(0, 2).parseInt(16),
        self.slice(2, 4).parseInt(16),
        self.slice(4, 6).parseInt(16),
        self.slice(6, 8).compact().flatBimap(
          (alpha) => some(alpha).parseInt(16),
          () => some(null),
        ),
      ]))
      .map(([ red, green, blue, alpha, ]) => {
        return new RGBA(red, green, blue, alpha);
      })
    )

    .flat();

  return rgba;
}
