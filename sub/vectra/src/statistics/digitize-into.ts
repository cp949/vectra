import { assertExplicitBinEdges, findBinIndex } from './histogram.internal';
import { commitSequenceInto } from './sequence-commit.internal';
import type { DigitizeOptions } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * `values`의 각 entry에 해당하는 bin index를 `out`에 기록한다.
 *
 * bin 매핑은 half-open `[edge[i], edge[i+1])` + 마지막 bin만 right-inclusive `[lastLower, lastUpper]`로
 * `histogram` 계열과 동일하다. `value < binEdges[0]` 또는 `value > binEdges[last]`이면 `RangeError`다(silent ignore 아님).
 *
 * `values`는 array가 아니면 `TypeError`. `binEdges`는 finite + length `>= 2` + strictly increasing 배열이어야 한다.
 * 위반은 `TypeError`/`RangeError`. entry non-finite는 `RangeError`.
 *
 * `options` 인자는 현재 사용하지 않는 미래 확장 자리다. 정의된 필드가 없어 `undefined`/`{}` 모두 허용된다.
 *
 * validation 실패 시 `out`은 호출 전 상태를 유지한다(모든 산술이 끝난 뒤 단일 commit). `out`과 `values` 또는
 * `binEdges`가 같은 배열이어도 안전하다(temp index 배열에서 산출 후 commit). 결과 entry는 non-negative safe
 * integer이고 `-0`은 발생하지 않지만 `commitSequenceInto`가 일관성을 위해 `0`으로 canonicalize한다.
 * 반환값은 `out`이다.
 *
 * @param out bin index를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 `values.length`를 가진다.
 * @param values 매핑할 finite number 배열. mutate하지 않는다.
 * @param binEdges strictly increasing finite number 경계 배열. mutate하지 않는다.
 * @param options 옵션. 현재 미사용.
 */
export function digitizeInto(
  out: number[],
  values: readonly number[],
  binEdges: readonly number[],
  // 미래 옵션 확장 자리. `_options` underscore prefix는 lint 무시 규칙(unused param)에 부합한다.
  _options?: DigitizeOptions
): number[] {
  assertValuesArray(values, 'values');
  assertExplicitBinEdges(binEdges, 'binEdges');

  const lastEdge = binEdges[binEdges.length - 1];
  const firstEdge = binEdges[0];
  const indices = new Array<number>(values.length);
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) {
      throw new RangeError(`values[${i}] must be a finite number, got ${String(v)}`);
    }
    const idx = findBinIndex(binEdges, v);
    if (idx < 0) {
      throw new RangeError(`values[${i}] (${v}) is out of binEdges range [${firstEdge}, ${lastEdge}]`);
    }
    indices[i] = idx;
  }

  commitSequenceInto(out, indices);
  return out;
}
