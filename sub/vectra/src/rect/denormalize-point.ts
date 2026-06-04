import type { RectLike, XYInput } from '../types';
import { denormalizePointInto } from './denormalize-point-into';

/**
 * rect-local coordinate를 world point로 변환해 새 `{ x, y }` object로 반환한다.
 *
 * 산식: `x = rect.x + localPoint.x * rect.width`, `y = rect.y + localPoint.y * rect.height`.
 * `normalizePoint`의 역변환이다.
 *
 * clamp하지 않는다. local coordinate가 `0..1` 밖이어도 extrapolation 결과를 반환한다.
 * empty rect와 negative dimension rect도 특별 분기 없이 raw 산식을 적용한다.
 * `NaN`/`Infinity` 입력은 검증 없이 산술 결과로 전파한다.
 *
 * @param rect 기준 rect
 * @param localPoint world coordinate로 변환할 rect-local point
 */
export function denormalizePoint(rect: RectLike, localPoint: XYInput): { x: number; y: number } {
  return denormalizePointInto({ x: 0, y: 0 }, rect, localPoint);
}
