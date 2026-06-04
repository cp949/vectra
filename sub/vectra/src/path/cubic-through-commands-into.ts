import { readX, readY } from '../internal/xy';
import type { CubicThroughOptions, PathCommand, XYInput } from '../types/index';

/**
 * from → to를 잇는 cubic Bezier가 through 점을 지나도록 control point P1, P2를 계산해
 * move + cubic 2 command로 out에 기록하고 out을 반환한다.
 *
 * 공식:
 * - `P1 = from + (through - from) * ((1 + 2t) / (3t)) * controlScale`
 * - `P2 = to + (through - to) * ((3 - 2t) / (3(1 - t))) * controlScale`
 *
 * `controlScale === 1`이면 cubic을 parameter `t`에서 evaluate했을 때 through 점을 정확히 통과한다.
 * `controlScale`은 control handle 길이 배율로, `1`이 아니면 through 통과 대신 휘어짐 강도를 조절한다.
 * `t = 0` 또는 `t = 1`이면 계수 계산에서 분모가 0이 되어 NaN/Infinity로 흐른다.
 *
 * degenerate(from == to)인 경우에도 분기 없이 그대로 cubic을 구성한다.
 * non-finite 좌표/옵션은 그대로 흘려 NaN/Infinity가 control point에 전파된다 (path invalid numeric pass-through).
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param from 시작점 (XYInput)
 * @param through cubic 위에서 통과해야 할 점 (XYInput). 기본 `controlScale = 1`에서 `t = 0.5` 위치 통과
 * @param to 끝점 (XYInput)
 * @param options through 점 parameter / control handle 배율 옵션 (기본 `t = 0.5`, `controlScale = 1`)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function cubicThroughCommandsInto<Out extends PathCommand[]>(
  out: Out,
  from: XYInput,
  through: XYInput,
  to: XYInput,
  options?: CubicThroughOptions
): Out {
  const t = options?.t ?? 0.5;
  const controlScale = options?.controlScale ?? 1;
  const fx = readX(from);
  const fy = readY(from);
  const tx = readX(to);
  const ty = readY(to);
  const thx = readX(through);
  const thy = readY(through);

  const u = 1 - t;
  const k1 = ((1 + 2 * t) / (3 * t)) * controlScale;
  const k2 = ((3 - 2 * t) / (3 * u)) * controlScale;
  const x1 = fx + (thx - fx) * k1;
  const y1 = fy + (thy - fy) * k1;
  const x2 = tx + (thx - tx) * k2;
  const y2 = ty + (thy - ty) * k2;

  out.length = 0;
  out.push({ kind: 'move', x: fx, y: fy } as Out[number]);
  out.push({ kind: 'cubic', x1, y1, x2, y2, x: tx, y: ty } as Out[number]);
  return out;
}
