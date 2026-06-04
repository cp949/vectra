import type { OrientedRectQueryFrame } from './oriented-rect-query';

/**
 * 두 oriented-rect query frame이 closed region에서 겹치는지 SAT로 판정한다.
 *
 * `overlap` leaf와 `intersects` owner facade가 같은 overlap 정책을 공유하도록 frame-level
 * 계산을 이 helper에 둔다. 검사 axis는 두 frame의 local x/y axis 4개(`a.xAxis`, `a.yAxis`,
 * `b.xAxis`, `b.yAxis`)다. axis convention은 `xAxis=(cos, sin)`, `yAxis=(-sin, cos)`다. 각 axis에서
 * projection half extent는 `hw * abs(axis·xAxis) + hh * abs(axis·yAxis)`, center projection 거리는
 * `abs((b.center - a.center)·axis)`이며, `centerProjection <= extentA + extentB`이면 그 axis에서
 * 겹친다. 4개 axis가 모두 겹치면 true다. closed boundary 포함이라 `centerProjection === extentA +
 * extentB`(edge/corner 접촉)이면 true다.
 *
 * 한쪽이라도 `width <= 0 || height <= 0`인 empty frame이면 false다. frame center가 non-finite이면
 * center projection이 `NaN`/무한대가 되어 `<=` 비교가 false가 되고 결과가 false로 수렴한다.
 *
 * @param a overlap을 판정할 첫 query frame
 * @param b overlap을 판정할 둘째 query frame
 */
export function overlapsOrientedRectFrames(a: OrientedRectQueryFrame, b: OrientedRectQueryFrame): boolean {
  if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) return false;

  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;

  // axis (lx, ly)에 두 rect를 투영해 한 점에서라도 겹치면 true. NaN/무한대 center는 false로 수렴한다.
  const overlapsOnAxis = (lx: number, ly: number): boolean => {
    const centerProjection = Math.abs(dx * lx + dy * ly);
    const extentA = a.hw * Math.abs(lx * a.cos + ly * a.sin) + a.hh * Math.abs(-lx * a.sin + ly * a.cos);
    const extentB = b.hw * Math.abs(lx * b.cos + ly * b.sin) + b.hh * Math.abs(-lx * b.sin + ly * b.cos);
    return centerProjection <= extentA + extentB;
  };

  return (
    overlapsOnAxis(a.cos, a.sin) && // a.xAxis
    overlapsOnAxis(-a.sin, a.cos) && // a.yAxis
    overlapsOnAxis(b.cos, b.sin) && // b.xAxis
    overlapsOnAxis(-b.sin, b.cos) // b.yAxis
  );
}
