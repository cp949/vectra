import type { MatrixWritable, Point } from '../types/flat-shapes.internal';
import { scaleAroundPointInto } from './scale-around-point-into';

/**
 * point를 중심으로 scale하는 matrix를 새 object로 반환한다.
 *
 * 축별 배율을 지정한다. 균일 배율은 `scale.x`와 `scale.y`에 같은 값을 넣는다.
 *
 * @param point scale 중심점
 * @param scale x축과 y축 배율
 */
export function scaleAroundPoint(point: Point, scale: Point): MatrixWritable {
  return scaleAroundPointInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, point, scale);
}
