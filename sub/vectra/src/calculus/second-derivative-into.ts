import { commitSequenceInto } from './sequence-commit.internal';
import { assertFiniteNumber, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `xMin..xMax` 균등 grid에서 sampled function `f`의 finite-difference second derivative를 `out`에 기록한다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `xMin`/`xMax`는 finite number, `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `binCount === 0`은 `out.length = 0`만 설정하고 `f`를 호출하지 않는다.
 * `binCount === 1`은 `[0]`을 기록하고 `f`를 호출하지 않는다(단일 sample에서는 second derivative가
 * 정의되지 않으며 일관된 zero-operator 결과).
 * `binCount === 2`는 `[0, 0]`을 기록하고 `f`를 호출하지 않는다(두 sample 사이의 second derivative는
 * 정의되지 않으며 zero-operator 결과). first derivative와 달리 second derivative는 3 sample을 요구한다.
 * `binCount >= 3`에서는 endpoint 포함 균등 grid `xMin, xMin + dx, ..., xMax`를 사용한다. 이 경우
 * `xMin < xMax`가 필요하고 위반 시 `RangeError`. spacing `dx = (xMax - xMin) / (binCount - 1)`과
 * scale `1 / dx^2`이 finite여야 한다. 위반 시 `RangeError`. 마지막 entry로 사용하는 `x`는 산식이
 * 아니라 `xMax`를 직접 기록해 누적 drift를 줄인다.
 * `f(x)` result는 모든 evaluated grid point에서 finite number여야 한다. 위반 시 `RangeError`.
 * middle row(`i ∈ (0, binCount - 1)`)는 central second-difference `(y[i-1] - 2*y[i] + y[i+1]) / dx^2`를
 * 사용한다. boundary row는 동일 공식의 shifted stencil(one-sided second-order fallback)을 사용한다.
 * `i === 0`은 stencil `[0, 1, 2]`, `i === binCount - 1`은 stencil `[binCount - 3, binCount - 2, binCount - 1]`.
 * 즉 boundary entry는 grid endpoint `x_i` 자리에 인접 interior point(`x_1`, `x_{binCount-2}`)의 second
 * derivative 근사치를 기록한다. caller가 정확한 `f''(xMin)`, `f''(xMax)`를 요구한다면 더 큰 binCount로
 * sample을 늘리거나 별도 boundary scheme를 적용해야 한다.
 * numerator(`y[a] - 2*y[b] + y[c]`)와 최종 entry(`numerator * (1 / dx^2)`)는 모두 finite여야 한다.
 * 위반 시 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * 반환값은 `out`이다.
 *
 * @param out second derivative sequence를 기록할 writable storage. 호출 전 length는 무시되고 commit 후
 *   정확한 length(`binCount`)를 갖는다.
 * @param f grid point마다 호출할 함수. finite number를 반환해야 한다. side effect는 호출자가 책임진다.
 * @param xMin grid 시작값. finite number.
 * @param xMax grid 끝값. finite number이며 `binCount >= 3`에서는 `xMin < xMax`여야 한다.
 * @param binCount 생성할 entry 개수. 비음의 safe integer. `f` 호출 횟수는 `binCount >= 3`일 때만
 *   `binCount`와 같고, 그 외에는 0이다.
 */
export function secondDerivativeInto(
  out: number[],
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  binCount: number
): number[] {
  if (typeof f !== 'function') {
    throw new TypeError(`f must be a function, got ${typeof f}`);
  }
  assertFiniteNumber(xMin, 'xMin');
  assertFiniteNumber(xMax, 'xMax');
  assertNonNegativeSafeInteger(binCount, 'binCount');

  if (binCount === 0) {
    out.length = 0;
    return out;
  }
  if (binCount === 1) {
    commitSequenceInto(out, [0]);
    return out;
  }
  if (binCount === 2) {
    commitSequenceInto(out, [0, 0]);
    return out;
  }

  if (!(xMin < xMax)) {
    throw new RangeError(`xMin must be less than xMax, got xMin=${String(xMin)}, xMax=${String(xMax)}`);
  }

  const span = xMax - xMin;
  if (!Number.isFinite(span)) {
    throw new RangeError(`second derivative span (xMax - xMin) must be finite, got ${String(span)}`);
  }
  const dx = span / (binCount - 1);
  // dx === 0은 매우 큰 binCount에서 underflow로 reachable. Number.isFinite(dx)는 방어용.
  if (!Number.isFinite(dx) || dx === 0) {
    throw new RangeError(`second derivative spacing must be a finite non-zero number, got ${String(dx)}`);
  }
  // dx는 finite non-zero이지만 dx * dx는 double-rounding underflow로 0이 될 수 있고(매우 작은 dx),
  // double overflow로 Infinity가 될 수도 있다(매우 큰 dx). 별도 guard로 분기.
  const dxSquared = dx * dx;
  if (!Number.isFinite(dxSquared) || dxSquared === 0) {
    throw new RangeError(`second derivative spacing squared must be finite non-zero, got ${String(dxSquared)}`);
  }
  const invDxSquared = 1 / dxSquared;
  if (!Number.isFinite(invDxSquared)) {
    throw new RangeError(`second derivative scale (1 / dx^2) must be finite, got ${String(invDxSquared)}`);
  }

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
        throw new RangeError(`second derivative grid point at index ${i} must be finite, got ${String(x)}`);
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
    // central stencil index. boundary는 shifted stencil로 one-sided second-order fallback.
    let a: number;
    let b: number;
    let c: number;
    if (i === 0) {
      a = 0;
      b = 1;
      c = 2;
    } else if (i === binCount - 1) {
      a = binCount - 3;
      b = binCount - 2;
      c = binCount - 1;
    } else {
      a = i - 1;
      b = i;
      c = i + 1;
    }

    const numerator = y[a] - 2 * y[b] + y[c];
    if (!Number.isFinite(numerator)) {
      throw new RangeError(`second derivative numerator at index ${i} must be finite, got ${String(numerator)}`);
    }
    const value = numerator * invDxSquared;
    if (!Number.isFinite(value)) {
      throw new RangeError(`second derivative entry at index ${i} must be finite, got ${String(value)}`);
    }
    temp[i] = value;
  }

  commitSequenceInto(out, temp);
  return out;
}
