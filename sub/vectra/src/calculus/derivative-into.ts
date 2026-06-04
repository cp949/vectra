import { commitSequenceInto } from './sequence-commit.internal';
import type { DerivativeOptions } from './types';
import { assertFiniteNumber, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `xMin..xMax` 균등 grid에서 sampled function `f`의 finite-difference derivative를 `out`에 기록한다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `xMin`/`xMax`는 finite number, `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `options.method`는 `"forward"`/`"backward"`/`"central"` 중 하나여야 한다. 기본 `"central"`.
 * 다른 값이면 `RangeError`.
 * `binCount === 0`은 `out.length = 0`만 설정하고 `f`를 호출하지 않는다.
 * `binCount === 1`은 `[0]`을 기록하고 `f`를 호출하지 않는다. 단일 sample에서는 이웃 sample이 없어
 * derivative가 정의되지 않으며 일관된 zero-operator 결과를 반환한다.
 * `binCount >= 2`에서는 endpoint 포함 균등 grid `xMin, xMin + dx, ..., xMax`를 사용한다. 이 경우
 * `xMin < xMax`가 필요하고 위반 시 `RangeError`. spacing `dx = (xMax - xMin) / (binCount - 1)`과
 * scale `1 / dx`가 finite여야 한다. 위반 시 `RangeError`. 마지막 entry로 사용하는 `x`는 산식이 아니라
 * `xMax`를 직접 기록해 누적 drift를 줄인다.
 * `f(x)` result는 모든 evaluated grid point에서 finite number여야 한다. 위반 시 `RangeError`.
 * boundary row(`i === 0`, `i === binCount - 1`)는 method와 무관하게 one-sided fallback이다. middle
 * row만 method에 따라 forward/backward/central 차분을 계산한다.
 * spacing, scale, `f(x)`, arithmetic 결과 중 하나라도 non-finite면 `RangeError`. 결과의 `-0`은 `0`으로
 * canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * 반환값은 `out`이다.
 *
 * @param out derivative sequence를 기록할 writable storage. 호출 전 length는 무시되고 commit 후
 *   정확한 length(`binCount`)를 갖는다.
 * @param f grid point마다 호출할 함수. finite number를 반환해야 한다. side effect는 호출자가 책임진다.
 * @param xMin grid 시작값. finite number.
 * @param xMax grid 끝값. finite number이며 `binCount >= 2`에서는 `xMin < xMax`여야 한다.
 * @param binCount 생성할 derivative entry 개수. 비음의 safe integer. `f` 호출 횟수는 `binCount >= 2`일
 *   때만 `binCount`와 같고, 그 외에는 0이다.
 * @param options 옵션. `method` 기본 `"central"`.
 */
export function derivativeInto(
  out: number[],
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  binCount: number,
  options?: DerivativeOptions
): number[] {
  if (typeof f !== 'function') {
    throw new TypeError(`f must be a function, got ${typeof f}`);
  }
  assertFiniteNumber(xMin, 'xMin');
  assertFiniteNumber(xMax, 'xMax');
  assertNonNegativeSafeInteger(binCount, 'binCount');

  const method = options?.method ?? 'central';
  if (method !== 'forward' && method !== 'backward' && method !== 'central') {
    throw new RangeError(`method must be "forward" | "backward" | "central", got ${String(method)}`);
  }

  if (binCount === 0) {
    out.length = 0;
    return out;
  }
  if (binCount === 1) {
    commitSequenceInto(out, [0]);
    return out;
  }

  if (!(xMin < xMax)) {
    throw new RangeError(`xMin must be less than xMax, got xMin=${String(xMin)}, xMax=${String(xMax)}`);
  }

  const span = xMax - xMin;
  if (!Number.isFinite(span)) {
    throw new RangeError(`derivative span (xMax - xMin) must be finite, got ${String(span)}`);
  }
  const dx = span / (binCount - 1);
  // dx === 0은 매우 큰 binCount에서 underflow로 reachable. Number.isFinite(dx)는 방어용.
  if (!Number.isFinite(dx) || dx === 0) {
    throw new RangeError(`derivative spacing must be a finite non-zero number, got ${String(dx)}`);
  }
  const invDx = 1 / dx;
  if (!Number.isFinite(invDx)) {
    throw new RangeError(`derivative scale (1 / spacing) must be finite, got ${String(invDx)}`);
  }
  const halfInvDx = invDx * 0.5;

  const y = new Array<number>(binCount);
  for (let i = 0; i < binCount; i++) {
    let x: number;
    if (i === 0) {
      x = xMin;
    } else if (i === binCount - 1) {
      x = xMax;
    } else {
      x = xMin + dx * i;
      // xMin / dx finite + i in [1, binCount - 2]에서 x는 항상 finite. 방어용 가드.
      if (!Number.isFinite(x)) {
        throw new RangeError(`derivative grid point at index ${i} must be finite, got ${String(x)}`);
      }
    }
    const value = f(x);
    if (!Number.isFinite(value)) {
      throw new RangeError(`f must return a finite number, got ${String(value)} at x=${String(x)} (index ${i})`);
    }
    y[i] = value;
  }

  const temp = new Array<number>(binCount);
  for (let i = 0; i < binCount; i++) {
    let diff: number;
    let scale: number;
    if (i === 0) {
      // boundary fallback: 모든 method에서 첫 row는 forward one-sided.
      diff = y[1] - y[0];
      scale = invDx;
    } else if (i === binCount - 1) {
      // boundary fallback: 모든 method에서 마지막 row는 backward one-sided.
      diff = y[binCount - 1] - y[binCount - 2];
      scale = invDx;
    } else if (method === 'forward') {
      diff = y[i + 1] - y[i];
      scale = invDx;
    } else if (method === 'backward') {
      diff = y[i] - y[i - 1];
      scale = invDx;
    } else {
      diff = y[i + 1] - y[i - 1];
      scale = halfInvDx;
    }

    if (!Number.isFinite(diff)) {
      throw new RangeError(`derivative difference at index ${i} must be finite, got ${String(diff)}`);
    }
    const value = diff * scale;
    if (!Number.isFinite(value)) {
      throw new RangeError(`derivative entry at index ${i} must be finite, got ${String(value)}`);
    }
    temp[i] = value;
  }

  commitSequenceInto(out, temp);
  return out;
}
