import type { PolylineLike } from '../types';
import type { RandomSource } from './random';
import { weightedPointOnPolylineInto } from './weighted-point-on-polyline-into';

/**
 * polyline 위의 무작위 점을 segment별 가중치 분포로 새 object로 반환한다.
 *
 * 각 source segment의 선택 확률은 `effective[i] = segmentLength[i] * weights[i]`에 비례한다.
 * weight는 기존 length-uniform weight 위에 곱해진다. 선택된 segment 안의 local point는 추가 RNG
 * 소비 없이 length-uniform으로 배치된다. `weightedPointOnPolylineInto`에 위임하며 RNG는 segment
 * 선택 threshold 계산에 1회만 소비한다. open segment model을 따르며 closed polyline의 closing
 * edge는 포함하지 않는다.
 *
 * weight mapping: `weights.length`는 source segment count(`points.length - 1`)와 같아야 한다.
 * zero-length segment는 weight가 양수여도 effective weight `0`으로 선택 대상이 아니다.
 *
 * 평가 순서(앞 단계에서 결정되면 이후는 평가하지 않는다):
 * 1. `weights.length` mismatch 또는 weight가 non-negative finite가 아니면 `RangeError`. RNG 미소비.
 * 2. `totalLength <= 0` 또는 non-finite이면 `undefined` + RNG 미소비.
 *    — empty / single-point / repeated-point polyline, NaN/Infinity vertex가 모두 이 분기다.
 * 3. effective weight 합계가 `0`이거나 non-finite이면 `RangeError`. RNG 미소비.
 * 4. 위 분기를 모두 통과하면 RNG 1회 소비 후 새 `{ x, y }` object를 반환.
 *
 * caller 책임: polyline vertex에 NaN/Infinity가 있으면 `undefined`를 반환한다. RNG가 `[0, 1)`
 * 범위를 벗어나는 값을 반환하면 결과는 정의되지 않는다.
 *
 * @param polyline 대상 polyline. source segment count는 `points.length - 1`
 * @param weights segment별 가중치 배열. 길이는 `points.length - 1`, 각 값은 finite `>= 0`
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function weightedPointOnPolyline(
  polyline: PolylineLike,
  weights: readonly number[],
  rng?: RandomSource
): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return weightedPointOnPolylineInto(out, polyline, weights, rng) ? out : undefined;
}
