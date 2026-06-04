import { assertFiniteNumber, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `xMin..xMax` endpoint 포함 균등 grid에서 sampled function `f`의 composite trapezoidal integral을 반환한다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `xMin`/`xMax`는 finite number, `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `binCount < 2`는 적분 구간이 정의되지 않으므로 `RangeError`. integration helper는 derivative와 달리
 * single-sample zero-operator fallback을 갖지 않는다.
 * `binCount >= 2`에서는 `xMin < xMax`가 필요하다. 위반 시 `RangeError`. spacing
 * `dx = (xMax - xMin) / (binCount - 1)`이 finite non-zero여야 한다. 위반 시 `RangeError`.
 * grid는 `xMin, xMin + dx, ..., xMax`이며 마지막 sample은 산식이 아니라 `xMax`를 직접 평가해 누적
 * drift를 줄인다.
 * `f(x)`는 모든 grid point에서 finite number를 반환해야 한다. 위반 시 `RangeError`.
 * 가중합(`y[0]/2 + y[1] + ... + y[n-1] + y[n]/2`) 매 누적 단계와 최종 곱셈 결과는 모두 finite여야 한다.
 * 위반 시 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param f grid point마다 호출할 함수. finite number를 반환해야 한다. side effect는 호출자가 책임진다.
 * @param xMin 적분 구간 시작값. finite number.
 * @param xMax 적분 구간 끝값. finite number이며 `xMin < xMax`여야 한다.
 * @param binCount sample 개수(grid point 수). safe integer `>= 2`. interval 수는 `binCount - 1`이다.
 */
export function trapezoidalIntegral(f: (x: number) => number, xMin: number, xMax: number, binCount: number): number {
  if (typeof f !== 'function') {
    throw new TypeError(`f must be a function, got ${typeof f}`);
  }
  assertFiniteNumber(xMin, 'xMin');
  assertFiniteNumber(xMax, 'xMax');
  assertNonNegativeSafeInteger(binCount, 'binCount');

  if (binCount < 2) {
    throw new RangeError(`binCount must be a safe integer >= 2 for trapezoidal integration, got ${String(binCount)}`);
  }
  if (!(xMin < xMax)) {
    throw new RangeError(`xMin must be less than xMax, got xMin=${String(xMin)}, xMax=${String(xMax)}`);
  }

  const span = xMax - xMin;
  if (!Number.isFinite(span)) {
    throw new RangeError(`integration span (xMax - xMin) must be finite, got ${String(span)}`);
  }
  const dx = span / (binCount - 1);
  // dx === 0은 매우 큰 binCount에서 underflow로 reachable. Number.isFinite(dx)는 방어용.
  if (!Number.isFinite(dx) || dx === 0) {
    throw new RangeError(`integration spacing must be a finite non-zero number, got ${String(dx)}`);
  }

  const y0 = evaluateAt(f, xMin, 0);
  const yLast = evaluateAt(f, xMax, binCount - 1);

  // composite trapezoidal: dx * (y[0]/2 + y[1] + ... + y[n-1] + y[n]/2)
  let sum = (y0 + yLast) * 0.5;
  if (!Number.isFinite(sum)) {
    throw new RangeError(`trapezoidal partial sum at endpoint pair must be finite, got ${String(sum)}`);
  }
  for (let i = 1; i < binCount - 1; i++) {
    const x = xMin + dx * i;
    // xMin / dx finite + i in [1, binCount - 2]에서 x는 항상 finite. 방어용 가드.
    if (!Number.isFinite(x)) {
      throw new RangeError(`integration grid point at index ${i} must be finite, got ${String(x)}`);
    }
    const value = evaluateAt(f, x, i);
    sum += value;
    if (!Number.isFinite(sum)) {
      throw new RangeError(`trapezoidal partial sum at index ${i} must be finite, got ${String(sum)}`);
    }
  }

  const result = sum * dx;
  if (!Number.isFinite(result)) {
    throw new RangeError(`trapezoidal integral result must be finite, got ${String(result)}`);
  }
  return Object.is(result, -0) ? 0 : result;
}

function evaluateAt(f: (x: number) => number, x: number, index: number): number {
  const value = f(x);
  if (!Number.isFinite(value)) {
    throw new RangeError(`f must return a finite number, got ${String(value)} at x=${String(x)} (index ${index})`);
  }
  return value;
}
