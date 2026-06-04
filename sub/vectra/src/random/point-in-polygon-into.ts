import { readPolygonPoints } from '../internal/polygon';
import { readX, readY, writeXY } from '../internal/xy';
import { boundsInto } from '../polygon/bounds-into';
import { containsPoint } from '../polygon/contains-point';
import { signedArea } from '../polygon/signed-area';
import type { PolygonLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

const MAX_ITERATIONS = 1024;

/**
 * polygon 내부의 무작위 점을 면적 균등 분포(area-uniform)로 기록한다.
 *
 * bounding-box rejection sampling을 사용한다. RNG 소비 횟수는 가변적이다(시도당 2회,
 * 성공 시 최소 2회, 한도 도달 시 최대 2048회).
 *
 * degenerate 처리: pts < 3, NaN/Infinity vertex, zero signed area, inverted/zero-area bounds이면
 * false를 반환하고 out을 수정하지 않는다.
 *
 * iteration 한도는 1024회다. bbox 대비 면적이 매우 작은 thin polygon에서는
 * 한도 도달 후 false를 반환할 수 있다.
 *
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * caller 책임: polygon vertex에 NaN/Infinity가 있으면 false를 반환한다.
 * RNG가 [0, 1) 범위를 벗어나는 값을 반환하면 containment 판정 결과는 정의되지 않는다.
 *
 * @param out 결과를 기록할 writable 좌표 output
 * @param polygon 대상 polygon. pts < 3이면 false
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInPolygonInto = <Out extends XYWritable>(
  out: Out,
  polygon: PolygonLike,
  rng?: RandomSource
): boolean => {
  const pts = readPolygonPoints(polygon);

  if (pts.length < 3) {
    return false;
  }

  for (const pt of pts) {
    const px = readX(pt);
    const py = readY(pt);
    if (!Number.isFinite(px) || !Number.isFinite(py)) {
      return false;
    }
  }

  const area = signedArea(polygon);
  if (!Number.isFinite(area) || area === 0) {
    return false;
  }

  const bbox = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  boundsInto(bbox, polygon);

  const minX = bbox.min.x;
  const minY = bbox.min.y;
  const maxX = bbox.max.x;
  const maxY = bbox.max.y;

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY) ||
    minX >= maxX ||
    minY >= maxY
  ) {
    return false;
  }

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const x = minX + random(rng) * rangeX;
    const y = minY + random(rng) * rangeY;
    if (containsPoint(polygon, { x, y })) {
      writeXY(out, x, y);
      return true;
    }
  }

  return false;
};
