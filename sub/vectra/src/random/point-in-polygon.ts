import type { PolygonLike } from '../types';
import { pointInPolygonInto } from './point-in-polygon-into';
import type { RandomSource } from './random';

/**
 * polygon 내부의 무작위 점을 면적 균등 분포(area-uniform)로 반환한다.
 *
 * 성공 시 `{ x, y }`를 반환하고, degenerate polygon이거나 iteration 한도를 초과하면
 * undefined를 반환한다.
 *
 * degenerate 처리: pts < 3, NaN/Infinity vertex, zero signed area, inverted/zero-area bounds이면
 * undefined를 반환한다.
 *
 * bounding-box rejection sampling을 사용한다. RNG 소비 횟수는 가변적이다(시도당 2회,
 * 성공 시 최소 2회, 한도 도달 시 최대 2048회). iteration 한도는 1024회다.
 *
 * bbox 대비 면적이 매우 작은 thin polygon에서는 한도 도달 후 undefined를 반환할 수 있다.
 *
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * caller 책임: polygon vertex에 NaN/Infinity가 있으면 undefined를 반환한다.
 * RNG가 [0, 1) 범위를 벗어나는 값을 반환하면 containment 판정 결과는 정의되지 않는다.
 *
 * @param polygon 대상 polygon. pts < 3이면 undefined
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInPolygon(polygon: PolygonLike, rng?: RandomSource): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointInPolygonInto(out, polygon, rng) ? out : undefined;
}
