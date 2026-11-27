import type { CubicCurve } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * cubic Bezier 제어점이 chord 수직으로 flatness 이내인지 확인한다.
 *
 * adaptive subdivision에서 종료 조건으로 사용한다.
 * p1, p2의 chord 수직 거리가 모두 flatness 이하이면 true를 반환한다.
 * degenerate (p0 == p3)의 경우 p1, p2도 같은 점이면 true를 반환한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param flatness 선형 근사 허용 geometric error
 */
export function cubicIsFlatEnough(curve: CubicCurve, flatness: number): boolean {
  const p0x = curve.x0,
    p0y = curve.y0;
  const p1x = curve.x1,
    p1y = curve.y1;
  const p2x = curve.x2,
    p2y = curve.y2;
  const p3x = curve.x3,
    p3y = curve.y3;

  const chordX = p3x - p0x;
  const chordY = p3y - p0y;
  const chordLen = hypot2(chordX, chordY);

  // degenerate: p0 == p3인 경우 p1, p2도 같은 점이면 true
  if (chordLen < flatness) {
    const d1 = hypot2(p1x - p0x, p1y - p0y);
    const d2 = hypot2(p2x - p0x, p2y - p0y);
    return d1 <= flatness && d2 <= flatness;
  }

  // 단위 chord 벡터
  const ux = chordX / chordLen;
  const uy = chordY / chordLen;

  // p1의 chord 수직 거리
  const d1 = Math.abs((p1x - p0x) * uy - (p1y - p0y) * ux);

  // p2의 chord 수직 거리
  const d2 = Math.abs((p2x - p0x) * uy - (p2y - p0y) * ux);

  return d1 <= flatness && d2 <= flatness;
}
