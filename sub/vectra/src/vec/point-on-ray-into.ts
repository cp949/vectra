import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * origin에서 normalize(direction) * distance 위치의 점을 out에 기록하고 out을 반환한다.
 *
 * zero-length direction이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out 결과를 기록할 writable output
 * @param origin ray 기준점
 * @param direction ray 방향 벡터 (정규화 없이 사용)
 * @param distance 이동 거리
 */
export function pointOnRayInto<Out extends XYWritable>(
  out: Out,
  origin: XYInput,
  direction: XYInput,
  distance: number
): Out | false {
  const dx = readX(direction);
  const dy = readY(direction);
  const len = Math.hypot(dx, dy);

  if (len === 0) return false;

  const nx = dx / len;
  const ny = dy / len;

  return writeXY(out, readX(origin) + nx * distance, readY(origin) + ny * distance);
}
