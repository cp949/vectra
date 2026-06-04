import type { RectLike, XYInput } from '../types';
import { normalizePointInto } from './normalize-point-into';

/**
 * world point를 rect-local coordinate로 변환해 새 `{ x, y }` object로 반환한다.
 *
 * 산식: `u = (point.x - rect.x) / rect.width`, `v = (point.y - rect.y) / rect.height`.
 * rect top-left가 `(0, 0)`, bottom-right가 `(1, 1)`인 unit square 좌표계로 매핑한다.
 *
 * clamp하지 않는다. rect 밖 point는 `<0` 또는 `>1` local coordinate가 된다.
 * empty rect와 negative dimension rect도 특별 분기 없이 raw 산식을 적용한다. negative
 * dimension rect는 corner normalization 없이 축이 뒤집힌 local coordinate가 된다.
 * `rect.width === 0` 또는 `rect.height === 0`이면 JS division 결과(`NaN`, `Infinity`,
 * `-Infinity`)를 그대로 반환한다.
 * `NaN`/`Infinity` 입력은 검증 없이 산술 결과로 전파한다.
 *
 * @param rect 기준 rect
 * @param point local coordinate로 변환할 world point
 */
export function normalizePoint(rect: RectLike, point: XYInput): { x: number; y: number } {
  return normalizePointInto({ x: 0, y: 0 }, rect, point);
}
