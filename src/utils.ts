/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybeLike, MaybeKind, SOME, NONE } from './maybe';

/**
 * Is the value MaybeLike?
 *
 * @param unk
 * @returns
 */
export function isMaybeLike<T = unknown>(unk: unknown): unk is MaybeLike<T> {
  if (!unk) return false;
  if (unk instanceof MaybeKind) return true;
  const tag = (unk as any).tag;
  if (tag !== SOME && tag !== NONE) return false;
  if (!(typeof (unk as any).isSome === 'function')) return false;
  if (!(typeof (unk as any).isNone === 'function')) return false;
  return true;
}
