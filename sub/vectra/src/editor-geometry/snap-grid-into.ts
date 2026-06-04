import { readX, readY, writeXY } from '../internal/xy';
import { snapScalar } from '../math/snap.internal';
import type { XYInput, XYWritable } from '../types';

/**
 * point를 grid에 snap하여 out에 기록하고 out을 반환한다.
 *
 * `out === point` aliasing은 안전하다. point의 x/y를 모두 읽은 뒤 writeXY로 기록하므로
 * 중간 상태 오염이 발생하지 않는다.
 *
 * gridSize의 x 또는 y가 양의 유한수가 아니면(0, 음수, NaN 등) 해당 축에 NaN을 기록한다.
 * throw하지 않는다 (editor hot path에서 호출되므로 silent NaN 정책).
 *
 * @param out 결과를 기록할 writable output
 * @param point snap할 입력 좌표
 * @param gridSize grid 간격. number이면 x/y 동일, 객체이면 x/y 독립
 * @param options.offset grid origin 오프셋 (기본값 0,0)
 */
export function snapPointToGridInto<Out extends XYWritable>(
  out: Out,
  point: XYInput,
  gridSize: number | { x: number; y: number },
  options?: { offset?: XYInput }
): Out {
  const gx = typeof gridSize === 'number' ? gridSize : gridSize.x;
  const gy = typeof gridSize === 'number' ? gridSize : gridSize.y;

  const ox = options?.offset != null ? readX(options.offset) : 0;
  const oy = options?.offset != null ? readY(options.offset) : 0;

  const snapX = gx > 0 ? snapScalar(readX(point), gx, ox) : Number.NaN;
  const snapY = gy > 0 ? snapScalar(readY(point), gy, oy) : Number.NaN;

  return writeXY(out, snapX, snapY);
}
