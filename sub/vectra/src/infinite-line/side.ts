import { readInfiniteLineDirection } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, XYInput } from '../types';
import { signedDistanceToPoint } from './signed-distance-to-point';

/**
 * `point`가 infinite-line의 어느 쪽에 있는지를 반환한다.
 *
 * 반환값:
 * - `1`  : 좌측 (y-up 수학 관례). 부호 판정은 `signedDistanceToPoint` 참고
 * - `-1` : 우측
 * - `0`  : line 위 (`signedDist`가 `±epsilon` 범위 안) 또는 degenerate / NaN
 *
 * 판정 로직: `signedDist > epsilon` → `1`, `signedDist < -epsilon` → `-1`, 그 외 `0`.
 * epsilon은 `signedDistanceToPoint`를 `±epsilon` 임계로 비교하는 값이며 direction scale에
 * 의존한다 (direction이 normalized되지 않으면 같은 epsilon이라도 실제 임계 거리가
 * 달라진다). 음수 epsilon을 넘기면 `signedDist = 0`(line 위)인 점도 부호에 따라 `1`/`-1`로
 * 분류된다 (caller 책임). `epsilon = NaN`이면 `>`/`<` 비교가 모두 false가 되어 항상 `0`을
 * 반환한다.
 *
 * NaN 입력 시 `0`을 반환한다 (다른 함수의 NaN pass-through 관례와 다름. literal union
 * 반환에 NaN을 포함할 수 없다). 비유한 입력은 위치에 따라 동작이 갈린다:
 * - `point`에 ±Infinity가 있고 `signedDistanceToPoint`가 ±Infinity를 반환하면 그 부호로
 *   `1` / `-1`을 반환한다.
 * - `line.direction` / `line.origin`에 NaN 또는 Infinity가 포함되면
 *   `signedDistanceToPoint` 결과가 NaN이 되어 `0`을 반환한다.
 *
 * degenerate 판정은 `direction = (0, 0)` 정확 비교이며 epsilon 기반 `isDegenerate`와
 * 다르다. float64 underflow로 `dx*dx + dy*dy === 0`이 되는 극단 케이스도 degenerate로
 * 처리한다. degenerate line에서는 부호 정보가 없으므로 항상 `0`을 반환한다.
 *
 * @param line 기준 infinite-line
 * @param point 판정할 point
 * @param epsilon 허용 거리 임계값 (기본값 `1e-9`)
 */
export function side(line: InfiniteLineLike, point: XYInput, epsilon: number = DEFAULT_EPSILON): -1 | 0 | 1 {
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  // degenerate: direction = (0,0) → signedDistanceToPoint가 unsigned 거리를 반환하므로
  // 판정 로직을 통과시키면 항상 1이 나올 수 있다. early-return으로 처리한다.
  if (dx * dx + dy * dy === 0) return 0;
  const signedDist = signedDistanceToPoint(line, point);
  if (Number.isNaN(signedDist)) return 0; // NaN guard
  if (signedDist > epsilon) return 1;
  if (signedDist < -epsilon) return -1;
  return 0;
}
