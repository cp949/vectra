import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * vector에서 normal 성분을 제거한 벡터를 out에 기록하고 out을 반환한다.
 *
 * collision slide helper. `rejectFromInto`와 같은 계산 정책을 사용한다:
 * `vector - dot(vector, normal) / lengthSq(normal) * normal`. normal은 임의 길이다.
 * `lengthSq(normal) === 0`이면 vector를 그대로 out에 복사한다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param out 결과를 기록할 writable output
 * @param vector 슬라이드할 벡터
 * @param normal 충돌 표면 법선 벡터 (임의 길이)
 */
export function slideInto<Out extends XYWritable>(out: Out, vector: XYInput, normal: XYInput): Out {
  const vx = readX(vector);
  const vy = readY(vector);
  const nx = readX(normal);
  const ny = readY(normal);
  const lsq = nx * nx + ny * ny;
  if (lsq === 0) return writeXY(out, vx, vy);
  const scale = (vx * nx + vy * ny) / lsq;
  return writeXY(out, vx - scale * nx, vy - scale * ny);
}
