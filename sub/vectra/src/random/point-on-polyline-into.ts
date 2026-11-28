import { length } from '../polyline/length';
import { pointAtLengthInto } from '../polyline/point-at-length-into';
import type { PointWritable, Polyline } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * polyline 위의 무작위 점을 길이 균등 분포(length-uniform)로 기록한다.
 *
 * open segment model을 따르며 closed polyline의 closing edge는 포함하지 않는다.
 * `pointAtLengthInto`에 위임하여 결과를 기록한다. RNG는 distance 계산에 1회 소비한다.
 *
 * degenerate 처리: `totalLength <= 0` 또는 `!Number.isFinite(totalLength)`이면
 * false를 반환하고 out을 수정하지 않는다.
 * — polyline.length < 2는 totalLength=0으로 환원되어 같은 분기에서 처리된다.
 * — NaN vertex는 `length`의 Euclidean 거리를 통해 NaN이 전파되어 false를 반환한다.
 * — Infinity vertex는 totalLength가 Infinity가 되어 false를 반환한다.
 *
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * caller 책임: polyline vertex에 NaN/Infinity가 있으면 false를 반환한다.
 * RNG가 [0, 1) 범위를 벗어나는 값을 반환하면 결과는 정의되지 않는다.
 *
 * @param out 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param polyline 대상 polyline. polyline.length < 2이면 false
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointOnPolylineInto = (out: PointWritable, polyline: Polyline, rng?: RandomSource): boolean => {
  const totalLength = length(polyline);

  if (!Number.isFinite(totalLength) || totalLength <= 0) {
    return false;
  }

  const distance = random(rng) * totalLength;
  return pointAtLengthInto(out, polyline, distance);
};
