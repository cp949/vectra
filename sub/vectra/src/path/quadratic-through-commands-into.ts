import { readX, readY } from '../internal/xy';
import type { PathCommand, QuadraticThroughOptions, XYInput } from '../types/index';

/**
 * from → to를 잇는 quadratic Bezier가 parameter `t`에서 through 점을 통과하도록 control point를
 * 계산해 move + quadratic 2 command로 out에 기록하고 out을 반환한다.
 *
 * 공식: `P1 = (through - (1 - t)^2 * from - t^2 * to) / (2 * t * (1 - t))`.
 * 기본 `t = 0.5`이면 `P1 = 2 * through - 0.5 * (from + to)`이다.
 * `t = 0` 또는 `t = 1`이면 분모가 0이 되어 P1이 ±Infinity/NaN으로 흐른다 (invalid numeric pass-through).
 * degenerate(from == to)인 경우에도 분기 없이 그대로 quadratic을 구성한다.
 * non-finite 좌표는 그대로 push한다.
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param from 시작점 (XYInput)
 * @param through quadratic 위 parameter `t`에서 통과해야 할 점 (XYInput)
 * @param to 끝점 (XYInput)
 * @param options through 점의 parameter 위치 옵션 (기본 `t = 0.5`)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function quadraticThroughCommandsInto<Out extends PathCommand[]>(
  out: Out,
  from: XYInput,
  through: XYInput,
  to: XYInput,
  options?: QuadraticThroughOptions
): Out {
  const t = options?.t ?? 0.5;
  const fx = readX(from);
  const fy = readY(from);
  const tx = readX(to);
  const ty = readY(to);
  const thx = readX(through);
  const thy = readY(through);

  const u = 1 - t;
  const denom = 2 * t * u;
  const x1 = (thx - u * u * fx - t * t * tx) / denom;
  const y1 = (thy - u * u * fy - t * t * ty) / denom;

  out.length = 0;
  out.push({ kind: 'move', x: fx, y: fy } as Out[number]);
  out.push({ kind: 'quadratic', x1, y1, x: tx, y: ty } as Out[number]);
  return out;
}
