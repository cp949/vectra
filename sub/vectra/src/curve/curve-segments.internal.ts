/**
 * cubic Bezier segment collection을 path/polyline output으로 기록하는 공유 internal.
 *
 * monotone, natural spline, bump helper가 공통으로 사용한다.
 * segment는 flat number[]로 표현하고 각 segment는 8개 수
 * [p0x, p0y, c1x, c1y, c2x, c2y, p3x, p3y] 순서다. segment s의 p3는 segment s+1의 p0와 같다.
 */
import type { PathCommand, XYWritable } from '../types';

/** segment당 sample 수를 검증한다. safe integer가 아니거나 1 미만이면 RangeError. */
export function assertSamplesPerSegment(steps: number): void {
  if (!Number.isSafeInteger(steps) || steps < 1) {
    throw new RangeError(`steps must be a safe integer >= 1, got ${steps}`);
  }
}

/**
 * cubic segment collection을 move 1개 + cubic command로 out에 기록하고 out을 반환한다.
 *
 * segCount <= 0이면 out.length를 0으로 두고 반환한다. close는 추가하지 않는다.
 *
 * @param out command를 기록할 PathCommand 배열. 기존 내용은 덮어쓴다.
 * @param segments cubic segment flat 배열
 * @param segCount segment 수
 * @returns out
 */
export function cubicSegmentsToPathInto<Out extends PathCommand[]>(
  out: Out,
  segments: readonly number[],
  segCount: number
): Out {
  out.length = 0;
  if (segCount <= 0) return out;
  out.push({ kind: 'move', x: segments[0], y: segments[1] } as Out[number]);
  for (let s = 0; s < segCount; s++) {
    const o = s * 8;
    out.push({
      kind: 'cubic',
      x1: segments[o + 2],
      y1: segments[o + 3],
      x2: segments[o + 4],
      y2: segments[o + 5],
      x: segments[o + 6],
      y: segments[o + 7],
    } as Out[number]);
  }
  return out;
}

/**
 * cubic segment collection을 segment당 균등 샘플링해 out에 point로 기록하고 out을 반환한다.
 *
 * 첫 segment만 시작점을 포함하고 후속 segment는 연결점 중복을 피한다.
 * steps >= 2이면 t = j / (steps - 1), j = 0..steps-1 (양 끝점 포함)으로 샘플링한다.
 * steps === 1이면 각 segment 끝점만 기록하고 첫 segment에 시작점을 함께 포함한다.
 * steps가 safe integer가 아니거나 1 미만이면 RangeError로 실패하고 out은 그대로 유지된다.
 *
 * @param out point를 기록할 writable point 배열. 기존 내용은 덮어쓴다.
 * @param segments cubic segment flat 배열
 * @param segCount segment 수
 * @param steps segment당 sample 수
 * @returns out
 */
export function cubicSegmentsToPolylineInto(
  out: XYWritable[],
  segments: readonly number[],
  segCount: number,
  steps: number
): XYWritable[] {
  assertSamplesPerSegment(steps);
  out.length = 0;
  if (segCount <= 0) return out;
  for (let s = 0; s < segCount; s++) {
    const o = s * 8;
    const p0x = segments[o];
    const p0y = segments[o + 1];
    const c1x = segments[o + 2];
    const c1y = segments[o + 3];
    const c2x = segments[o + 4];
    const c2y = segments[o + 5];
    const p3x = segments[o + 6];
    const p3y = segments[o + 7];
    if (steps === 1) {
      if (s === 0) out.push({ x: p0x, y: p0y });
      out.push({ x: p3x, y: p3y });
      continue;
    }
    const startJ = s === 0 ? 0 : 1;
    for (let j = startJ; j < steps; j++) {
      const t = j / (steps - 1);
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const t2 = t * t;
      const t3 = t2 * t;
      const b1 = 3 * mt2 * t;
      const b2 = 3 * mt * t2;
      out.push({
        x: mt3 * p0x + b1 * c1x + b2 * c2x + t3 * p3x,
        y: mt3 * p0y + b1 * c1y + b2 * c2y + t3 * p3y,
      });
    }
  }
  return out;
}
