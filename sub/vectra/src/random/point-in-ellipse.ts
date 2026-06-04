import type { EllipseLike } from '../types';
import { pointInEllipseInto } from './point-in-ellipse-into';
import type { RandomSource } from './random';

/**
 * ellipse 내부의 무작위 점을 면적 균등 분포(area-uniform)로 새 object로 반환한다.
 *
 * `radiusX <= 0` 또는 `radiusY <= 0`이면 undefined를 반환한다.
 *
 * area-uniform 보장을 위해 단위 원에서 sqrt(u)로 반지름을 뽑은 뒤 x/y 축에
 * radiusX/radiusY를 각각 적용한다. RNG를 정확히 2회 소비한다(theta 1회, r 1회).
 *
 * NaN/Infinity radius는 NaN/Infinity 좌표를 담은 object를 반환한다(caller 책임).
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * @param ellipse - 대상 axis-aligned ellipse. center, radiusX, radiusY를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInEllipse(ellipse: EllipseLike, rng?: RandomSource): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointInEllipseInto(out, ellipse, rng) ? out : undefined;
}
