import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * ellipse 내부의 무작위 점을 면적 균등 분포(area-uniform)로 기록한다.
 *
 * `radiusX <= 0` 또는 `radiusY <= 0`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * area-uniform 보장을 위해 단위 원에서 sqrt(u)로 반지름을 뽑은 뒤 x/y 축에
 * radiusX/radiusY를 각각 적용한다. RNG를 정확히 2회 소비한다(theta 1회, r 1회).
 *
 * NaN/Infinity radius는 `<= 0` 비교에서 false가 되지 않으므로 out에
 * NaN/Infinity 좌표가 기록된 채 true를 반환한다(caller 책임).
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param ellipse - 대상 axis-aligned ellipse. center, radiusX, radiusY를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInEllipseInto = <Out extends XYWritable>(
  out: Out,
  ellipse: EllipseLike,
  rng?: RandomSource
): boolean => {
  const radiusX = readEllipseRadiusX(ellipse);
  const radiusY = readEllipseRadiusY(ellipse);
  if (radiusX <= 0 || radiusY <= 0) {
    return false;
  }
  const theta = random(rng) * 2 * Math.PI;
  const r = Math.sqrt(random(rng));
  const center = readEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);
  writeXY(out, cx + Math.cos(theta) * r * radiusX, cy + Math.sin(theta) * r * radiusY);
  return true;
};
