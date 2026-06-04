/**
 * monotone cubic Hermite(PCHIP) helper의 공유 internal.
 *
 * 좌표 읽기/검증, Fritsch-Carlson tangent, monotone cubic segment 생성을 모아둔다.
 * public monotone leaf는 이 helper만 공유하고 서로를 직접 import하지 않는다.
 */
import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/** monotone curve가 strict monotonic을 요구하는 축. */
export type MonotoneAxis = 'x' | 'y';

// 입력 point의 x/y를 배열로 읽고 모두 finite인지 검증한다. non-finite면 RangeError.
function readFiniteAxes(points: readonly XYInput[]): { xs: number[]; ys: number[] } {
  const n = points.length;
  const xs = new Array<number>(n);
  const ys = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const x = readX(points[i]);
    const y = readY(points[i]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new RangeError('monotone curve requires finite coordinates');
    }
    xs[i] = x;
    ys[i] = y;
  }
  return { xs, ys };
}

// primary axis가 strict monotonic인지 검증한다. 방향은 첫 두 값으로 정한다. duplicate나 비단조면 RangeError.
function assertStrictMonotonic(values: readonly number[], axisLabel: string): void {
  const n = values.length;
  const ascending = values[1] > values[0];
  for (let i = 1; i < n; i++) {
    const prev = values[i - 1];
    const cur = values[i];
    if (ascending ? !(cur > prev) : !(cur < prev)) {
      throw new RangeError(`monotone curve requires strictly monotonic ${axisLabel} values`);
    }
  }
}

// endpoint tangent: 비대칭 three-point 추정 후 monotonicity clamp. overshoot를 막는다.
function pchipEndpoint(hEdge: number, hNext: number, dEdge: number, dNext: number): number {
  let m = ((2 * hEdge + hNext) * dEdge - hEdge * dNext) / (hEdge + hNext);
  if (Math.sign(m) !== Math.sign(dEdge)) {
    m = 0;
  } else if (Math.sign(dEdge) !== Math.sign(dNext) && Math.abs(m) > 3 * Math.abs(dEdge)) {
    m = 3 * dEdge;
  }
  return m;
}

// Fritsch-Carlson(PCHIP) tangent slope. primary는 strict monotonic, 모든 값이 finite여야 한다.
function pchipTangents(primary: readonly number[], value: readonly number[]): number[] {
  const n = primary.length;
  const m = new Array<number>(n);
  const h = new Array<number>(n - 1);
  const delta = new Array<number>(n - 1);
  for (let i = 0; i < n - 1; i++) {
    h[i] = primary[i + 1] - primary[i];
    delta[i] = (value[i + 1] - value[i]) / h[i];
  }
  if (n === 2) {
    m[0] = delta[0];
    m[1] = delta[0];
    return m;
  }
  for (let i = 1; i < n - 1; i++) {
    const d0 = delta[i - 1];
    const d1 = delta[i];
    // 부호가 다르거나 한쪽이 0이면 local extremum이므로 tangent 0으로 overshoot를 막는다.
    if (d0 * d1 <= 0) {
      m[i] = 0;
    } else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d0 + w2 / d1);
    }
  }
  m[0] = pchipEndpoint(h[0], h[1], delta[0], delta[1]);
  m[n - 1] = pchipEndpoint(h[n - 2], h[n - 3], delta[n - 2], delta[n - 3]);
  return m;
}

/**
 * monotone cubic Hermite segment를 flat number[]로 생성한다.
 *
 * primary axis(monotoneX는 x, monotoneY는 y)가 strict monotonic이어야 한다.
 * non-finite 좌표나 비단조/duplicate axis는 RangeError로 실패한다.
 * 호출자는 points.length >= 2를 보장한다.
 *
 * @param points monotone curve가 통과할 입력 point 배열
 * @param axis strict monotonic을 요구하는 축
 * @returns cubic segment flat 배열과 segment 수
 */
export function monotoneCubicSegments(
  points: readonly XYInput[],
  axis: MonotoneAxis
): { segments: number[]; segCount: number } {
  const { xs, ys } = readFiniteAxes(points);
  const n = xs.length;
  const segCount = n - 1;
  const segments = new Array<number>(segCount * 8);

  if (axis === 'x') {
    assertStrictMonotonic(xs, 'x');
    const m = pchipTangents(xs, ys);
    for (let i = 0; i < segCount; i++) {
      const dx = (xs[i + 1] - xs[i]) / 3;
      const o = i * 8;
      segments[o] = xs[i];
      segments[o + 1] = ys[i];
      segments[o + 2] = xs[i] + dx;
      segments[o + 3] = ys[i] + dx * m[i];
      segments[o + 4] = xs[i + 1] - dx;
      segments[o + 5] = ys[i + 1] - dx * m[i + 1];
      segments[o + 6] = xs[i + 1];
      segments[o + 7] = ys[i + 1];
    }
  } else {
    assertStrictMonotonic(ys, 'y');
    const m = pchipTangents(ys, xs);
    for (let i = 0; i < segCount; i++) {
      const dy = (ys[i + 1] - ys[i]) / 3;
      const o = i * 8;
      segments[o] = xs[i];
      segments[o + 1] = ys[i];
      segments[o + 2] = xs[i] + dy * m[i];
      segments[o + 3] = ys[i] + dy;
      segments[o + 4] = xs[i + 1] - dy * m[i + 1];
      segments[o + 5] = ys[i + 1] - dy;
      segments[o + 6] = xs[i + 1];
      segments[o + 7] = ys[i + 1];
    }
  }

  return { segments, segCount };
}
