import type { InfiniteLine, InfiniteLineWritable } from '../types/flat-shapes.internal';

/**
 * `line`을 `mirror` line을 기준 축으로 반사한 결과를 `out`에 기록하고 `out`을 반환한다.
 *
 * `line`의 기준점은 `mirror` line에 대한 점 반사(수선의 발 `F`에 대해 `2F - P`)로 `out`의 기준점에
 * 기록한다. `line`의 방향 벡터은 `mirror`의 방향 벡터 축에 대한 vector 반사(`2 proj_d(v) - v`)로
 * `out`의 방향 벡터에 기록한다. `mirror`의 방향 벡터은 normalize하지 않으며 unit vector 없이 계산한다.
 *
 * degenerate 처리:
 *   - `mirror.dx === 0 && mirror.dy === 0`이면 축이 없으므로 `mirror`의 기준점 기준 점 반사(`2M - P`)로 origin을,
 *     `-direction`으로 direction을 기록한다. zero direction은 그대로 zero다.
 *   - `line.dx === 0 && line.dy === 0`이면 output direction도 `(0, 0)`이다.
 *
 * `out === line` 또는 `out === mirror` aliasing은 안전하다. 입력 좌표를 모두 local 변수로 먼저
 * 읽은 뒤 기록한다.
 *
 * non-finite coordinate/direction은 caller 책임이며 산술 결과를 그대로 pass-through한다. non-finite
 * origin/direction은 output 좌표에 `NaN` 또는 `Infinity`를 기록할 수 있다.
 *
 * @param out 반사 결과를 기록할 무한 직선 객체
 * @param line 반사할 infinite-line
 * @param mirror 반사 축으로 쓸 infinite-line
 */
export function infiniteLineMirrorLineInto<Out extends InfiniteLineWritable>(
  out: Out,
  line: InfiniteLine,
  mirror: InfiniteLine
): Out {
  // alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const lox = line.ox;
  const loy = line.oy;
  const ldx = line.dx;
  const ldy = line.dy;
  const mox = mirror.ox;
  const moy = mirror.oy;
  const mdx = mirror.dx;
  const mdy = mirror.dy;

  const mLenSq = mdx * mdx + mdy * mdy;

  if (mLenSq === 0) {
    // degenerate mirror: origin은 점 반사, direction은 부호 반전
    out.ox = 2 * mox - lox;
    out.oy = 2 * moy - loy;
    out.dx = -ldx;
    out.dy = -ldy;
    return out;
  }

  // origin: mirror line 위 수선의 발 F에 대해 2F - P
  const t = ((lox - mox) * mdx + (loy - moy) * mdy) / mLenSq;
  const fx = mox + t * mdx;
  const fy = moy + t * mdy;
  out.ox = 2 * fx - lox;
  out.oy = 2 * fy - loy;

  // direction: mirror의 방향 벡터 축에 대한 vector 반사 2 proj_d(v) - v
  const k = (ldx * mdx + ldy * mdy) / mLenSq;
  out.dx = 2 * k * mdx - ldx;
  out.dy = 2 * k * mdy - ldy;
  return out;
}
