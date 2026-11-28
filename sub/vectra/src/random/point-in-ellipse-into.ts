import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * ellipse 내부의 무작위 점을 면적 균등 분포(area-uniform)로 기록한다.
 *
 * `rx <= 0` 또는 `ry <= 0`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * area-uniform 보장을 위해 단위 원에서 sqrt(u)로 반지름을 뽑은 뒤 x/y 축에
 * rx/ry를 각각 적용한다. RNG를 정확히 2회 소비한다(theta 1회, r 1회).
 *
 * 양의 Infinity나 NaN인 반지름은 `<= 0` 검사에 걸리지 않아 out에
 * NaN/Infinity 좌표가 기록된 채 true를 반환한다.
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * @param out - 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param ellipse - 대상 axis-aligned ellipse. `cx, cy, rx, ry`를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInEllipseInto = (out: PointWritable, ellipse: Ellipse, rng?: RandomSource): boolean => {
  const radiusX = ellipse.rx;
  const radiusY = ellipse.ry;
  if (radiusX <= 0 || radiusY <= 0) {
    return false;
  }
  const theta = random(rng) * 2 * Math.PI;
  const r = Math.sqrt(random(rng));
  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const sampleX = cx + Math.cos(theta) * r * radiusX;
  const sampleY = cy + Math.sin(theta) * r * radiusY;
  out.x = sampleX;
  out.y = sampleY;
  return true;
};
