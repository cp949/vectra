import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * cubic Bezier 제어점이 chord 수직으로 flatness 이내인지 확인한다.
 *
 * adaptive subdivision에서 종료 조건으로 사용한다.
 * p1, p2의 chord 수직 거리가 모두 flatness 이하이면 true를 반환한다.
 * degenerate (p0 == p3)의 경우 p1, p2도 같은 점이면 true를 반환한다.
 *
 * @param p0 cubic Bezier 시작점
 * @param p1 cubic Bezier 첫 번째 제어점
 * @param p2 cubic Bezier 두 번째 제어점
 * @param p3 cubic Bezier 끝점
 * @param flatness 선형 근사 허용 geometric error
 */
export function cubicIsFlatEnough(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, flatness: number): boolean {
  const p0x = readX(p0),
    p0y = readY(p0);
  const p1x = readX(p1),
    p1y = readY(p1);
  const p2x = readX(p2),
    p2y = readY(p2);
  const p3x = readX(p3),
    p3y = readY(p3);

  const chordX = p3x - p0x;
  const chordY = p3y - p0y;
  const chordLen = Math.hypot(chordX, chordY);

  // degenerate: p0 == p3인 경우 p1, p2도 같은 점이면 true
  if (chordLen < flatness) {
    const d1 = Math.hypot(p1x - p0x, p1y - p0y);
    const d2 = Math.hypot(p2x - p0x, p2y - p0y);
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
