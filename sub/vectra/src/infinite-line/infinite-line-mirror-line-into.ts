import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, InfiniteLineWritable, XYWritable } from '../types';

/**
 * `line`을 `mirror` line을 기준 축으로 반사한 결과를 `out`에 기록하고 `out`을 반환한다.
 *
 * `line.origin`은 `mirror` line에 대한 점 반사(수선의 발 `F`에 대해 `2F - P`)로 `out.origin`에
 * 기록한다. `line.direction`은 `mirror.direction` 축에 대한 vector 반사(`2 proj_d(v) - v`)로
 * `out.direction`에 기록한다. `mirror.direction`은 normalize하지 않으며 unit vector 없이 계산한다.
 *
 * degenerate 처리:
 *   - `mirror.direction = (0, 0)`이면 축이 없으므로 `mirror.origin` 기준 점 반사(`2M - P`)로 origin을,
 *     `-direction`으로 direction을 기록한다. zero direction은 그대로 zero다.
 *   - `line.direction = (0, 0)`이면 output direction도 `(0, 0)`이다.
 *
 * `out === line` 또는 `out === mirror` aliasing은 안전하다. 입력 좌표를 모두 local 변수로 먼저
 * 읽은 뒤 기록한다.
 *
 * non-finite coordinate/direction은 caller 책임이며 산술 결과를 그대로 pass-through한다. non-finite
 * origin/direction은 output 좌표에 `NaN` 또는 `Infinity`를 기록할 수 있다.
 *
 * @param out 반사 결과를 기록할 writable infinite-line
 * @param line 반사할 infinite-line
 * @param mirror 반사 축으로 쓸 infinite-line
 */
export function infiniteLineMirrorLineInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  line: InfiniteLineLike,
  mirror: InfiniteLineLike
): Out {
  // alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const lox = readX(readInfiniteLineOrigin(line));
  const loy = readY(readInfiniteLineOrigin(line));
  const ldx = readX(readInfiniteLineDirection(line));
  const ldy = readY(readInfiniteLineDirection(line));
  const mox = readX(readInfiniteLineOrigin(mirror));
  const moy = readY(readInfiniteLineOrigin(mirror));
  const mdx = readX(readInfiniteLineDirection(mirror));
  const mdy = readY(readInfiniteLineDirection(mirror));

  const mLenSq = mdx * mdx + mdy * mdy;

  if (mLenSq === 0) {
    // degenerate mirror: origin은 점 반사, direction은 부호 반전
    writeXY(out.origin, 2 * mox - lox, 2 * moy - loy);
    writeXY(out.direction, -ldx, -ldy);
    return out;
  }

  // origin: mirror line 위 수선의 발 F에 대해 2F - P
  const t = ((lox - mox) * mdx + (loy - moy) * mdy) / mLenSq;
  const fx = mox + t * mdx;
  const fy = moy + t * mdy;
  writeXY(out.origin, 2 * fx - lox, 2 * fy - loy);

  // direction: mirror.direction 축에 대한 vector 반사 2 proj_d(v) - v
  const k = (ldx * mdx + ldy * mdy) / mLenSq;
  writeXY(out.direction, 2 * k * mdx - ldx, 2 * k * mdy - ldy);
  return out;
}
