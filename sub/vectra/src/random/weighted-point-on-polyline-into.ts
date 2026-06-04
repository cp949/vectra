import { pointDist, readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import { pointAtLengthInto } from '../polyline/point-at-length-into';
import type { PolylineLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { validateGeometryWeights, weightedSegmentOffset } from './weighted-geometry.internal';

/**
 * polyline 위의 무작위 점을 segment별 가중치 분포로 기록한다.
 *
 * 각 source segment의 선택 확률은 `effective[i] = segmentLength[i] * weights[i]`에 비례한다.
 * weight는 기존 length-uniform weight 위에 곱해진다. 선택된 segment 안의 local point는 추가 RNG
 * 소비 없이 length-uniform으로 배치되며 `pointAtLengthInto`에 위임해 기록한다. RNG는 segment
 * 선택 threshold 계산에 1회만 소비한다. open segment model을 따르며 closed polyline의 closing
 * edge는 포함하지 않는다.
 *
 * weight mapping: `weights.length`는 source segment count(`points.length - 1`)와 같아야 한다.
 * zero-length segment는 weight가 양수여도 effective weight `0`으로 선택 대상이 아니다.
 *
 * 평가 순서(앞 단계에서 결정되면 이후는 평가하지 않는다):
 * 1. `weights.length` mismatch 또는 weight가 non-negative finite가 아니면 `RangeError`. RNG 미소비.
 * 2. `totalLength <= 0` 또는 non-finite이면 `false` + out 미수정 + RNG 미소비.
 *    — empty / single-point / repeated-point polyline, NaN/Infinity vertex가 모두 이 분기다.
 * 3. effective weight 합계가 `0`이거나 non-finite이면 `RangeError`. RNG 미소비.
 * 4. 위 분기를 모두 통과하면 RNG 1회 소비 후 point를 기록하고 `true` 반환.
 *
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * caller 책임: polyline vertex에 NaN/Infinity가 있으면 `false`를 반환한다. RNG가 `[0, 1)` 범위를
 * 벗어나는 값을 반환하면 결과는 정의되지 않는다.
 *
 * @param out 결과를 기록할 writable 좌표 output. `false` 또는 `RangeError` 시 수정하지 않는다
 * @param polyline 대상 polyline. source segment count는 `points.length - 1`
 * @param weights segment별 가중치 배열. 길이는 `points.length - 1`, 각 값은 finite `>= 0`
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const weightedPointOnPolylineInto = <Out extends XYWritable>(
  out: Out,
  polyline: PolylineLike,
  weights: readonly number[],
  rng?: RandomSource
): boolean => {
  const points = readPolylinePoints(polyline);
  const segmentCount = Math.max(0, points.length - 1);
  validateGeometryWeights(weights, segmentCount, 'weightedPointOnPolylineInto');

  const segLengths: number[] = [];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const len = pointDist(readX(points[i - 1]), readY(points[i - 1]), readX(points[i]), readY(points[i]));
    segLengths.push(len);
    totalLength += len;
  }

  if (!Number.isFinite(totalLength) || totalLength <= 0) {
    return false;
  }

  const distance = weightedSegmentOffset(segLengths, weights, rng, 'weightedPointOnPolylineInto');
  return pointAtLengthInto(out, polyline, distance);
};
