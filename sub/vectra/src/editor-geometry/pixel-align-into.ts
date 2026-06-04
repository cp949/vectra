import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * point를 device pixel에 맞게 정렬하여 out에 기록하고 out을 반환한다.
 *
 * `out === point` aliasing은 안전하다. point의 x/y를 모두 읽은 뒤 writeXY로 기록하므로
 * 중간 상태 오염이 발생하지 않는다.
 *
 * devicePixelRatio가 양의 유한수가 아니면(0, 음수, NaN) NaN을 기록한다. 음수 dpr의 silent
 * 부호 반전을 막기 위함이다. throw하지 않는다 (editor hot path 정책).
 *
 * @param out 결과를 기록할 writable output
 * @param point 정렬할 입력 좌표
 * @param options.devicePixelRatio 장치 픽셀 비율 (기본값 1, 양수만 유효)
 */
export function pixelAlignInto<Out extends XYWritable>(
  out: Out,
  point: XYInput,
  options?: { devicePixelRatio?: number }
): Out {
  const dpr = options?.devicePixelRatio ?? 1;
  if (!(dpr > 0)) return writeXY(out, Number.NaN, Number.NaN);
  const x = Math.round(readX(point) * dpr) / dpr;
  const y = Math.round(readY(point) * dpr) / dpr;
  return writeXY(out, x, y);
}
