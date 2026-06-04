import type { InfiniteLineLike, InfiniteLineWritable } from '../types';
import { createInfiniteLine } from './create-infinite-line';
import { infiniteLineMirrorLineInto } from './infinite-line-mirror-line-into';

/**
 * `line`을 `mirror` line을 기준 축으로 반사한 결과를 새 plain object로 반환한다.
 *
 * `line.origin`은 `mirror` line에 대한 점 반사로, `line.direction`은 `mirror.direction` 축에 대한
 * vector 반사로 계산한다. `mirror.direction`은 normalize하지 않는다.
 *
 * degenerate 처리:
 *   - `mirror.direction = (0, 0)`이면 `mirror.origin` 기준 점 반사로 origin을, `-direction`으로
 *     direction을 계산한다. zero direction은 그대로 zero다.
 *   - `line.direction = (0, 0)`이면 결과 direction도 `(0, 0)`이다.
 *
 * source `line`과 `mirror`를 mutate하지 않는다. non-finite coordinate/direction은 caller 책임이며
 * 산술 결과를 그대로 pass-through해 결과 좌표에 `NaN` 또는 `Infinity`를 담을 수 있다.
 *
 * @param line 반사할 infinite-line
 * @param mirror 반사 축으로 쓸 infinite-line
 */
export function infiniteLineMirrorLine(line: InfiniteLineLike, mirror: InfiniteLineLike): InfiniteLineWritable {
  return infiniteLineMirrorLineInto(createInfiniteLine(), line, mirror);
}
