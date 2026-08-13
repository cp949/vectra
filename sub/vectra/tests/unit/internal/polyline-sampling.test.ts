/**
 * polylineSampleAtLengthInto의 분기 경계를 고정하는 characterization test.
 *
 * point-at-length-into 등 leaf를 통해 간접 검증되지만, "마지막 segment 강제 보간"과
 * "zero-length segment는 해당 vertex를 그대로 반환" 분기는 직접 exercise된 적이 없다.
 */

import { describe, expect, test } from 'vitest';
import { polylineSampleAtLengthInto } from '../../../src/internal/polyline-sampling.internal';
import type { XYWritable } from '../../../src/types';

function makeOut(): XYWritable {
  return { x: Number.NaN, y: Number.NaN };
}

describe('polylineSampleAtLengthInto', () => {
  const bend = [
    [0, 0],
    [4, 0],
    [4, 4],
  ] as const;

  test('target이 첫 segment 안이면 그 segment 위에서 보간한다', () => {
    const out = makeOut();
    polylineSampleAtLengthInto(out, bend, 1);
    expect(out).toEqual({ x: 1, y: 0 });
  });

  test('target이 마지막 segment의 누적 길이를 넘어서도 마지막 segment 위에서 강제 보간한다(i===n-1 강제 분기)', () => {
    // 3-4-5 직각삼각형: 첫 segment 길이 3, 둘째 segment 길이 4, 두 segment 누적 길이 합은 7.
    // target=8.5는 이 누적 길이를 넘어서므로 `acc+segLen>=target`은 마지막 segment에서도 false다 —
    // 오직 `i===n-1` 강제 분기 덕분에 마지막 segment 위에서 clamp(localT=1) 보간되어 끝점을 반환한다.
    const triangle = [
      [0, 0],
      [3, 0],
      [3, 4],
    ] as const;
    const out = makeOut();
    polylineSampleAtLengthInto(out, triangle, 8.5);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('zero-length segment가 target 구간에 걸리면 해당 vertex 좌표를 그대로 반환한다', () => {
    const repeatedStart = [
      [0, 0],
      [0, 0],
      [4, 0],
    ] as const;
    const out = makeOut();
    polylineSampleAtLengthInto(out, repeatedStart, 0);
    expect(out).toEqual({ x: 0, y: 0 });
  });
});
