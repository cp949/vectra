import type { PolylineLike } from '../types';
import { pointOnPolylineInto } from './point-on-polyline-into';
import type { RandomSource } from './random';

/**
 * polyline 위의 무작위 점을 길이 균등 분포(length-uniform)로 새 object로 반환한다.
 *
 * open segment model을 따르며 closed polyline의 closing edge는 포함하지 않는다.
 * `pointOnPolylineInto`에 위임하며, 내부적으로 `pointAtLengthInto`에 위임하여 결과를 계산한다.
 * RNG는 distance 계산에 1회 소비한다.
 *
 * degenerate 처리: `totalLength <= 0` 또는 `!Number.isFinite(totalLength)`이면
 * undefined를 반환한다.
 * — pts.length < 2는 totalLength=0으로 환원되어 같은 분기에서 처리된다.
 * — NaN vertex는 `length`에서 Math.hypot를 통해 NaN이 전파되어 undefined를 반환한다.
 * — Infinity vertex는 totalLength가 Infinity가 되어 undefined를 반환한다.
 *
 * caller 책임: polyline vertex에 NaN/Infinity가 있으면 undefined를 반환한다.
 * RNG가 [0, 1) 범위를 벗어나는 값을 반환하면 결과는 정의되지 않는다.
 *
 * @param polyline 대상 polyline. pts.length < 2이면 undefined
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointOnPolyline(polyline: PolylineLike, rng?: RandomSource): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointOnPolylineInto(out, polyline, rng) ? out : undefined;
}
