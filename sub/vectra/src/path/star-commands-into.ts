import type { Point } from '../types/flat-shapes.internal';
import type { PathCommand, StarOptions } from '../types/index';

/**
 * star polygon을 move + (2 * points - 1) line + close, 총 2 * points + 1 command로 out에 기록하고 out을 반환한다.
 *
 * outer / inner vertex를 번갈아 배치한다 (총 `2 * points` vertex).
 * `points`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) out을 clear만 하고 반환한다 (validation throw 없음).
 * `inner > outer`도 그대로 사용한다 (caller 책임).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 outer vertex 시작), `clockwise = true` (SVG y-down).
 * non-finite innerRadius/outerRadius/startAngle은 그대로 흘러 NaN/Infinity vertex가 push된다.
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param center star 중심점 (Point)
 * @param innerRadius inner vertex가 위치한 원의 반지름
 * @param outerRadius outer vertex가 위치한 원의 반지름
 * @param points outer vertex 수 (별의 꼭짓점 수). 3 이상 정수가 아니면 out clear만 (non-integer/NaN/Infinity 포함)
 * @param options startAngle/clockwise 옵션
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function starCommandsInto(
  out: PathCommand[],
  center: Point,
  innerRadius: number,
  outerRadius: number,
  points: number,
  options?: Required<StarOptions>
): PathCommand[] {
  out.length = 0;
  if (!Number.isInteger(points) || points < 3) {
    // non-integer, NaN, ±Infinity, < 3 모두 여기서 걸린다.
    return out;
  }

  const startAngle = options === undefined ? -Math.PI / 2 : options.startAngle;
  const clockwise = options === undefined ? true : options.clockwise;
  const cx = center.x;
  const cy = center.y;
  const total = 2 * points;
  // 한 vertex 당 각도 step. clockwise(true)면 SVG y-down에서 각도 증가 = 시계 방향.
  const step = ((clockwise ? 1 : -1) * (2 * Math.PI)) / total;

  // index 0: outer, index 1: inner, ... 교차.
  out.push({
    kind: 'move',
    x: cx + outerRadius * Math.cos(startAngle),
    y: cy + outerRadius * Math.sin(startAngle),
  });
  for (let i = 1; i < total; i++) {
    const angle = startAngle + step * i;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    out.push({ kind: 'line', x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  out.push({ kind: 'close' });
  return out;
}
