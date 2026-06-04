import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY, writeXY } from '../internal/xy';
import type { MatrixLike, XYInput, XYWritable } from '../types';

/**
 * points 각 원소에 matrix를 적용한 결과를 out 같은 index 위치에 기록하고 out을 반환한다.
 *
 * 변환 개수는 `points.length`다. `out.length < points.length`이면 `RangeError`를 던지고
 * out을 수정하지 않는다. `out.length > points.length`이면 초과 항목은 수정하지 않는다.
 * 각 `out[i]`는 호출 전에 `XYWritable` 인스턴스로 초기화되어 있어야 한다.
 *
 * `out[i] === points[i]` self-aliasing은 안전하다. `out`과 `points`가 같은 array여도 각
 * index의 입력 x/y를 먼저 읽은 뒤 해당 index의 출력에 기록한다.
 *
 * matrix component나 point component에 NaN/Infinity가 있으면 검증하지 않고 JS 산술 결과를
 * 그대로 기록한다 (caller 책임).
 *
 * @param out 변환된 point들을 기록할 writable output array. 길이는 `points.length` 이상.
 * @param matrix point에 적용할 matrix
 * @param points 변환할 point input array
 */
export function transformPointsInto<Out extends readonly XYWritable[]>(
  out: Out,
  matrix: MatrixLike,
  points: readonly XYInput[]
): Out {
  const count = points.length;
  if (out.length < count) {
    throw new RangeError(`transformPointsInto: out.length (${out.length}) < points.length (${count})`);
  }

  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);

  for (let i = 0; i < count; i += 1) {
    const point = points[i];
    // aliasing 안전: 같은 index의 input x/y를 먼저 읽은 뒤 out[i]에 기록한다
    const x = readX(point);
    const y = readY(point);
    writeXY(out[i], a * x + c * y + tx, b * x + d * y + ty);
  }

  return out;
}
