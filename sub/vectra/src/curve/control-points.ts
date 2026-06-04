import type {
  ControlPointsOptions,
  CurveControlPoints,
  CurveControlPointsWritable,
  XYInput,
  XYObjectWritable,
} from '../types';
import { controlPointsInto } from './control-points-into';

/**
 * point list에서 index가 가리키는 current point의 4-point neighborhood를 새 object로 반환한다.
 *
 * controlPointsInto의 allocating companion이다. points.length === 0이면 undefined를 반환한다.
 * points.length > 0에서 index가 정수가 아니거나 [0, points.length) 밖이면 RangeError를 던진다.
 * options.closed === true이면 index lookup이 modulo wrapping을 사용하고, 아니면 open edge를 clamp한다.
 *  - previous: points[index - 1]가 없으면 current
 *  - next: points[index + 1]가 없으면 current
 *  - nextNext: points[index + 2]가 없으면 next
 * 마지막 점에서는 next === current, nextNext === next다. single point는 네 field 모두 같은 점이다.
 * 반환 object와 네 nested point는 새 plain object다. input point object를 재사용하지 않는다.
 * 좌표는 검증 없이 복사하므로 NaN/Infinity/-Infinity/-0는 그대로 pass through한다.
 * 성능 최적화가 필요하면 controlPointsInto를 사용한다.
 *
 * @param points neighborhood를 읽을 point list. 읽기 전용.
 * @param index current point index. 정수이며 [0, points.length) 범위여야 한다.
 * @param options closed 여부. closed면 modulo wrapping, 아니면 open edge clamp.
 * @returns 새 CurveControlPoints object, points.length === 0이면 undefined
 */
export function controlPoints(
  points: readonly XYInput[],
  index: number,
  options?: ControlPointsOptions
): CurveControlPoints | undefined {
  const out: CurveControlPointsWritable<XYObjectWritable> = {
    previous: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    next: { x: 0, y: 0 },
    nextNext: { x: 0, y: 0 },
  };

  return controlPointsInto(out, points, index, options) ? out : undefined;
}
