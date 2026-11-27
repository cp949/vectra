import type { InfiniteLine, InfiniteLineWritable } from '../types/flat-shapes.internal';
import { infiniteLineMirrorLineInto } from './infinite-line-mirror-line-into';

/**
 * `line`을 `mirror` line을 기준 축으로 반사한 결과를 새 plain object로 반환한다.
 *
 * `line`의 기준점은 `mirror` line에 대한 점 반사로, `line`의 방향 벡터는 `mirror`의 방향 벡터 축에 대한
 * vector 반사로 계산한다. `mirror`의 방향 벡터는 normalize하지 않는다.
 *
 * degenerate 처리:
 *   - `mirror.dx === 0 && mirror.dy === 0`이면 `(mirror.ox, mirror.oy)`에 대한 점 반사로 `(ox, oy)`를,
 *     부호 반전으로 `(dx, dy)`를 계산한다. zero direction은 그대로 zero다.
 *   - `line.dx === 0 && line.dy === 0`이면 결과의 `dx`, `dy`도 0이다.
 *
 * source `line`과 `mirror`를 mutate하지 않는다. non-finite coordinate/direction은 caller 책임이며
 * 산술 결과를 그대로 pass-through해 결과 좌표에 `NaN` 또는 `Infinity`를 담을 수 있다.
 *
 * @param line 반사할 infinite-line
 * @param mirror 반사 축으로 쓸 infinite-line
 */
export function infiniteLineMirrorLine(line: InfiniteLine, mirror: InfiniteLine): InfiniteLineWritable {
  return infiniteLineMirrorLineInto({ ox: 0, oy: 0, dx: 0, dy: 0 }, line, mirror);
}
