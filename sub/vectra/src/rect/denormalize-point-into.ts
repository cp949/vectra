import type { Rect, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * rect-local coordinate를 world point로 변환해 `out`에 기록하고 반환한다.
 *
 * 산식: `x = rect.x + localPoint.x * rect.width`, `y = rect.y + localPoint.y * rect.height`.
 * `normalizePointInto`의 역변환이다.
 *
 * clamp하지 않는다. local coordinate가 `0..1` 밖이어도 extrapolation 결과를 기록한다.
 * empty rect와 negative dimension rect도 특별 분기 없이 raw 산식을 적용한다.
 * `NaN`/`Infinity` 입력은 검증 없이 산술 결과로 전파한다.
 * `out`과 `localPoint`가 같은 object여도 안전하다. local 좌표를 먼저 읽은 뒤 기록한다.
 *
 * @param out world point를 기록할 점 객체
 * @param rect 기준 rect
 * @param localPoint world coordinate로 변환할 rect-local point
 */
export function denormalizePointInto<Out extends PointWritable>(out: Out, rect: Rect, localPoint: Point): Out {
  const lx = localPoint.x;
  const ly = localPoint.y;
  const x = rect.x;
  const y = rect.y;
  const w = rect.width;
  const h = rect.height;

  out.x = x + lx * w;
  out.y = y + ly * h;
  return out;
}
