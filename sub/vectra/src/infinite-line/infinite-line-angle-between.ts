import { readInfiniteLineDirection } from '../internal/infinite-line';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike } from '../types';

/**
 * 두 infinite-line의 direction 사이 최소 각을 `[0, π/2]` 범위로 반환한다.
 *
 * line은 방향 부호가 없으므로 같은 방향과 반대 방향은 모두 `0`이다. 공식:
 * `acos(clamp(|dot| / (|da| |db|), 0, 1))`. normalized dot의 절대값을 쓰므로 결과는 항상
 * `[0, π/2]`이다. clamp는 float 반올림으로 `|dot| / (|da| |db|)`가 `1`을 살짝 넘는 경우를 막는다.
 *
 * 한쪽이라도 zero direction이면 각도가 정의되지 않으므로 `NaN`을 반환한다. non-finite
 * coordinate/direction은 caller 책임이며 산술 결과를 그대로 pass-through해 `NaN`이 될 수 있다.
 *
 * @param a 첫 infinite-line
 * @param b 둘째 infinite-line
 */
export function infiniteLineAngleBetween(a: InfiniteLineLike, b: InfiniteLineLike): number {
  const dax = readX(readInfiniteLineDirection(a));
  const day = readY(readInfiniteLineDirection(a));
  const dbx = readX(readInfiniteLineDirection(b));
  const dby = readY(readInfiniteLineDirection(b));

  const dot = dax * dbx + day * dby;
  const denom = Math.hypot(dax, day) * Math.hypot(dbx, dby);
  // zero direction → denom 0 → NaN (0/0 또는 v/0)
  const cos = Math.abs(dot) / denom;
  const clamped = cos > 1 ? 1 : cos < 0 ? 0 : cos;
  return Math.acos(clamped);
}
