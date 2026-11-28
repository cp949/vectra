import { snapScalar } from '../math/snap.internal';
import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * point를 grid에 snap하여 out에 기록하고 out을 반환한다.
 *
 * `out === point` aliasing은 안전하다. point의 x/y를 모두 읽은 뒤 기록하므로
 * 중간 상태 오염이 발생하지 않는다.
 *
 * gridSize의 x 또는 y가 양수가 아니면(0, 음수, NaN 등) 해당 축에 NaN을 기록한다.
 * throw하지 않는다 (editor hot path에서 호출되므로 silent NaN 정책).
 *
 * @param out 결과 좌표를 기록할 출력 { x, y }
 * @param point snap할 입력 좌표
 * @param gridSize 축별 grid 간격 { x, y }
 * @param options grid origin 오프셋 { offsetX, offsetY } (생략 시 0, 0)
 */
export function snapPointToGridInto<Out extends PointWritable>(
  out: Out,
  point: Point,
  gridSize: Point,
  options?: { offsetX: number; offsetY: number }
): Out {
  const gx = gridSize.x;
  const gy = gridSize.y;

  const ox = options === undefined ? 0 : options.offsetX;
  const oy = options === undefined ? 0 : options.offsetY;

  const snapX = gx > 0 ? snapScalar(point.x, gx, ox) : Number.NaN;
  const snapY = gy > 0 ? snapScalar(point.y, gy, oy) : Number.NaN;

  out.x = snapX;
  out.y = snapY;
  return out;
}
