import { commitMatrixInto } from './commit-matrix.internal';
import type { MatWritable, VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * 두 vector의 outer product `out[i][j] = a[i] * b[j]`를 `out`에 기록하고 `out`을 반환한다.
 *
 * 결과 shape는 `[a.length, b.length]`이다.
 * 두 vector는 모두 non-empty여야 한다. 빈 vector는 one-sided zero shape를 만들어 nested matrix
 * 표현과 충돌하므로 `RangeError`.
 * 입력 vector entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 각 곱 `a[i] * b[j]`도 finite number여야 한다(overflow 시 `RangeError`).
 * `out`은 결과 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을 완성한 뒤 commit).
 * 성공 시 `out.length`는 `a.length`로, 각 row length는 `b.length`로 truncate된다.
 * 결과 entry에 `-0`이 남지 않는다(`+0`으로 canonicalize).
 *
 * caller가 `a` 또는 `b` vector 인스턴스를 `out`의 한 row로 재사용해도 안전하다(`out[k] === a`
 * 또는 `out[k] === b`). temp matrix에서 결과를 완성한 뒤 `commitMatrixInto`로 commit하므로
 * 입력 vector를 같은 row에서 동시에 읽고 쓰는 경합이 발생하지 않는다.
 *
 * @param out outer product를 기록할 writable matrix. 결과 shape에 맞는 capacity가 준비되어 있어야 한다.
 * @param a outer product의 좌측 vector
 * @param b outer product의 우측 vector
 */
export function outerProductInto<Out extends MatWritable>(out: Out, a: VecLike, b: VecLike): Out {
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  const rows = a.length;
  const columns = b.length;
  if (rows === 0 || columns === 0) {
    throw new RangeError(`outer product requires non-empty vectors, got a.length = ${rows}, b.length = ${columns}`);
  }
  const temp: number[][] = new Array(rows);
  for (let i = 0; i < rows; i++) {
    const ai = a[i];
    const row = new Array<number>(columns);
    for (let j = 0; j < columns; j++) {
      const value = ai * b[j];
      if (!Number.isFinite(value)) {
        throw new RangeError(`a[${i}] * b[${j}] must be a finite number, got ${String(value)}`);
      }
      row[j] = Object.is(value, -0) ? 0 : value;
    }
    temp[i] = row;
  }
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
