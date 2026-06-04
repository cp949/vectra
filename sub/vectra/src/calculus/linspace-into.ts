import { commitSequenceInto } from './sequence-commit.internal';
import type { LinspaceOptions } from './types';
import { assertFiniteNumber, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `xMin..xMax`를 균등 간격으로 나눈 `binCount`개의 sample을 `out`에 기록한다.
 *
 * `xMin`/`xMax`는 finite number, `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `endpoint`가 `true`(기본값)이면 마지막 entry는 산식이 아니라 `xMax`를 직접 기록해 누적 drift를 줄인다.
 * denominator는 `binCount - 1`이다. `endpoint`가 `false`이면 denominator는 `binCount`이고 마지막
 * entry는 `xMax`를 포함하지 않는다.
 * `binCount === 0`은 `[]`. `binCount === 1`은 `endpoint` 옵션과 무관하게 `[xMin]`.
 * 산식 결과가 non-finite가 되면 `RangeError`.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * 성공 시 결과의 `-0`은 `0`으로 canonicalize한다. 반환값은 `out`.
 *
 * @param out sequence를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 정확한 length를 갖는다.
 * @param xMin 첫 entry로 사용할 시작값. finite number.
 * @param xMax `endpoint: true`일 때 마지막 entry로 사용할 끝값. finite number.
 * @param binCount 생성할 sample 개수. 비음의 safe integer.
 * @param options 옵션. `endpoint` 기본 `true`.
 */
export function linspaceInto(
  out: number[],
  xMin: number,
  xMax: number,
  binCount: number,
  options?: LinspaceOptions
): number[] {
  assertFiniteNumber(xMin, 'xMin');
  assertFiniteNumber(xMax, 'xMax');
  assertNonNegativeSafeInteger(binCount, 'binCount');
  const endpoint = options?.endpoint ?? true;

  if (binCount === 0) {
    out.length = 0;
    return out;
  }
  if (binCount === 1) {
    commitSequenceInto(out, [xMin]);
    return out;
  }

  const span = xMax - xMin;
  if (!Number.isFinite(span)) {
    throw new RangeError(`linspace span (xMax - xMin) must be finite, got ${String(span)}`);
  }

  const denominator = endpoint ? binCount - 1 : binCount;
  const step = span / denominator;
  if (!Number.isFinite(step)) {
    throw new RangeError(`linspace step must be finite, got ${String(step)}`);
  }

  const lastIndex = endpoint ? binCount - 1 : -1;
  const temp = new Array<number>(binCount);
  for (let i = 0; i < binCount; i++) {
    if (i === 0) {
      temp[i] = xMin;
      continue;
    }
    if (i === lastIndex) {
      temp[i] = xMax;
      continue;
    }
    const value = xMin + step * i;
    if (!Number.isFinite(value)) {
      throw new RangeError(`linspace entry at index ${i} must be finite, got ${String(value)}`);
    }
    temp[i] = value;
  }

  commitSequenceInto(out, temp);
  return out;
}
