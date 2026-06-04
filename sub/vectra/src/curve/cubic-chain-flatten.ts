import type { FlattenOptions, XYInput, XYObjectWritable } from '../types';
import { cubicChainFlattenInto } from './cubic-chain-flatten-into';

/**
 * 연결된 cubic Bezier control point chain을 polyline에 근사한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * `points`는 `[p0, c1, c2, p1, c1, c2, p2, ...]` 형식이다. 첫 4개가 첫 segment를 이루고,
 * 이후 3개마다 직전 segment 끝점을 시작점으로 공유하는 segment가 이어진다.
 * 유효 length는 `4 + 3n` (n >= 0)이다.
 *
 * 각 segment를 `cubicFlattenInto`와 같은 adaptive subdivision으로 flatten한다. 첫 segment는 모든 점을,
 * 두 번째 segment부터는 시작점(연결점)을 생략해 연결점이 한 번만 나오게 한다.
 * result point는 입력 point를 재사용하지 않는 새 plain object다.
 *
 * `points.length < 4`이면 빈 배열을 반환한다.
 * `points.length >= 4`이면서 `(points.length - 4) % 3 !== 0`이면 `RangeError`로 실패한다.
 * 좌표 값은 검증 없이 사용하므로 NaN/Infinity는 결과 좌표로 그대로 전파된다.
 * 성능 최적화가 필요하면 `cubicChainFlattenInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `cubicChainFlattenInto`와 동일하다.
 * @param points cubic control point chain
 * @param options flatten 옵션 (flatness 기본값 0.5, maxRecursion 기본값 32)
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function cubicChainFlatten(points: readonly XYInput[], options?: FlattenOptions): XYObjectWritable[] {
  return cubicChainFlattenInto([], points, options);
}
