import { readX, readY } from '../internal/xy';
import type { PathCommand, XYInput } from '../types/index';
import { lineCommandsInto } from './line-commands-into';

/**
 * from → through → to 3점을 지나는 외접원 호를 move + cubic × N command로 out에 기록하고 out을 반환한다.
 *
 * 호는 외접원의 두 arc 중 through 점을 지나는 쪽을 선택한다. 호 크기를 π/2 이하 조각으로
 * 분할해 cubic Bezier로 근사한다. handle 길이는 조각 각도 `dA`에 대해
 * `(4 / 3) * tan(dA / 4) * r`이다.
 *
 * degenerate fallback (모두 단일 line fallback `Move(from) + Line(to)`로 통일):
 * - cross product가 0인 3점 collinear
 * - `from === to`
 * - `from === through`
 * - `through === to`
 *
 * 세 점이 모두 동일(`from === through === to`)이면 out을 clear만 하고 빈 commands를 반환한다.
 *
 * non-finite 좌표는 cross 계산이 NaN이 되어 collinear 분기에 걸리지 않는다.
 * 이후 `numSegments`도 NaN이 되어 for 루프가 실행되지 않고 `out`에는 NaN 좌표를 가진
 * move command 하나만 남는다 (path invalid numeric pass-through, throw 없이 전파).
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param from 시작점 (XYInput)
 * @param through 호 위를 지나야 할 중간 점 (XYInput)
 * @param to 끝점 (XYInput)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function arcThroughCommandsInto<Out extends PathCommand[]>(
  out: Out,
  from: XYInput,
  through: XYInput,
  to: XYInput
): Out {
  const ax = readX(from);
  const ay = readY(from);
  const bx = readX(through);
  const by = readY(through);
  const cx = readX(to);
  const cy = readY(to);

  // 세 점이 모두 동일하면 빈 commands.
  if (ax === bx && ay === by && bx === cx && by === cy) {
    out.length = 0;
    return out;
  }

  // 점 쌍 동일성은 외접원 정의가 불가하므로 line fallback.
  if ((ax === cx && ay === cy) || (ax === bx && ay === by) || (bx === cx && by === cy)) {
    return lineCommandsInto(out, from, to);
  }

  // 외접원 계산용 cross product. 0이면 collinear.
  const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (cross === 0) {
    return lineCommandsInto(out, from, to);
  }

  // 외접원 중심: 세 점의 perpendicular bisector 교차 (closed-form).
  const aSq = ax * ax + ay * ay;
  const bSq = bx * bx + by * by;
  const cSq = cx * cx + cy * cy;
  const d = 2 * cross;
  const ux = (aSq * (by - cy) + bSq * (cy - ay) + cSq * (ay - by)) / d;
  const uy = (aSq * (cx - bx) + bSq * (ax - cx) + cSq * (bx - ax)) / d;
  const r = Math.hypot(ax - ux, ay - uy);

  // 외접원 위에서 각 점의 각도.
  const angleFrom = Math.atan2(ay - uy, ax - ux);
  const angleTo = Math.atan2(cy - uy, cx - ux);

  // cross > 0이면 A→B→C가 좌회전(CCW), < 0이면 우회전(CW). 호 방향 = 회전 방향.
  const ccw = cross > 0;
  let sweep = angleTo - angleFrom;
  if (ccw) {
    // CCW: sweep을 양수로 정규화. through를 거치는 호는 정의상 작은 회전이 아닌 cross 부호 방향.
    if (sweep <= 0) {
      sweep += 2 * Math.PI;
    }
  } else if (sweep >= 0) {
    sweep -= 2 * Math.PI;
  }

  // 한 cubic Bezier 조각이 근사 가능한 최대 각도는 π/2 (kappa 근사 정확도 유지).
  const absSweep = Math.abs(sweep);
  const numSegments = Math.max(1, Math.ceil(absSweep / (Math.PI / 2)));
  const dAngle = sweep / numSegments;
  // handle 길이 = (4/3) * tan(dAngle / 4) * r. dAngle 부호가 handle 방향을 결정한다.
  const handleK = (4 / 3) * Math.tan(dAngle / 4);

  out.length = 0;
  out.push({ kind: 'move', x: ax, y: ay } as Out[number]);

  let currentAngle = angleFrom;
  let p0x = ax;
  let p0y = ay;
  for (let i = 0; i < numSegments; i++) {
    const nextAngle = currentAngle + dAngle;
    const cosA = Math.cos(currentAngle);
    const sinA = Math.sin(currentAngle);
    const cosB = Math.cos(nextAngle);
    const sinB = Math.sin(nextAngle);

    // 마지막 조각의 끝점은 input `to`를 사용해 수치 drift를 피한다.
    const isLast = i === numSegments - 1;
    const p3x = isLast ? cx : ux + r * cosB;
    const p3y = isLast ? cy : uy + r * sinB;

    // 호 위 점에서 CCW tangent = (-sin, cos). handleK 부호로 CW/CCW를 동시 처리.
    const p1x = p0x + r * handleK * -sinA;
    const p1y = p0y + r * handleK * cosA;
    const p2x = p3x - r * handleK * -sinB;
    const p2y = p3y - r * handleK * cosB;

    out.push({ kind: 'cubic', x1: p1x, y1: p1y, x2: p2x, y2: p2y, x: p3x, y: p3y } as Out[number]);

    currentAngle = nextAngle;
    p0x = p3x;
    p0y = p3y;
  }
  return out;
}
