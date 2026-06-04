import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input의 각 성분을 grid vector 단위로 가장 가까운 배수에 맞춰 out에 기록하고 out을 반환한다.
 *
 * origin 0 기준으로 `x`, `y`를 독립 처리한다. 성분별 `Math.round(v / g) * g`이며, 동률은
 * Math.round 정책을 따른다(0.5는 양의 무한대 방향으로 올림).
 *
 * grid size 0, negative, non-finite(NaN, Infinity, -Infinity) 입력은 검증하지 않고 JS 산술 결과를
 * 그대로 기록한다. grid 성분이 0이면 해당 성분은 NaN이 된다. 결과 `-0`은 canonicalize하지 않는다.
 *
 * input과 grid 성분을 local로 먼저 읽으므로 out이 input 또는 grid와 같은 storage여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input snap할 입력 point
 * @param grid 성분별 grid 간격 vector
 */
export function snapToGridInto<Out extends XYWritable>(out: Out, input: XYInput, grid: XYInput): Out {
  const ix = readX(input);
  const iy = readY(input);
  const gx = readX(grid);
  const gy = readY(grid);

  return writeXY(out, Math.round(ix / gx) * gx, Math.round(iy / gy) * gy);
}
