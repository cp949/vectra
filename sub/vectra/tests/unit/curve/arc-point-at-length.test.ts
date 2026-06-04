/**
 * arcPointAtLength / arcPointAtLengthInto unit test.
 *
 * 검증 방법:
 * - 단위 원 quarter arc에서 distance=0은 start point (1, 0)을 반환한다.
 * - distance=totalLength는 end point (0, 1)을 반환한다.
 * - distance=π/4 (절반)은 (cos(π/4), sin(π/4))를 반환한다.
 * - negative distance는 start point를 반환한다.
 * - degenerate arc (rx=0)는 center 좌표를 반환한다.
 * - tuple out: arcPointAtLengthInto([0, 0], arc, 0) → [1, 0]
 * - object out: arcPointAtLengthInto({ x, y }, arc, 0) → { x: 1, y: 0 }
 * - arcPointAtLength는 새 object를 반환하며 Into와 같은 좌표다.
 */

import { describe, expect, it } from 'vitest';
import { arcPointAtLength } from '../../../src/curve/arc-point-at-length';
import { arcPointAtLengthInto } from '../../../src/curve/arc-point-at-length-into';
import type { CenterArcLike } from '../../../src/types';

const quarterCircle: CenterArcLike = {
  cx: 0,
  cy: 0,
  rx: 1,
  ry: 1,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI / 2,
  sweep: true,
};

const totalLength = Math.PI / 2;

describe('arcPointAtLengthInto', () => {
  it('distance=0이면 start point (1, 0)을 반환한다', () => {
    const out = arcPointAtLengthInto({ x: 0, y: 0 }, quarterCircle, 0);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('distance=totalLength이면 end point (0, 1)을 반환한다', () => {
    const out = arcPointAtLengthInto({ x: 0, y: 0 }, quarterCircle, totalLength);
    // arcTAtLength 이진 탐색 수렴 오차로 인해 ~1e-8 수준의 차이가 허용된다.
    expect(out.x).toBeCloseTo(0, 7);
    expect(out.y).toBeCloseTo(1, 7);
  });

  it('distance=π/4 (절반)이면 (cos(π/4), sin(π/4))를 반환한다', () => {
    const out = arcPointAtLengthInto({ x: 0, y: 0 }, quarterCircle, Math.PI / 4);
    expect(out.x).toBeCloseTo(Math.cos(Math.PI / 4), 5);
    expect(out.y).toBeCloseTo(Math.sin(Math.PI / 4), 5);
  });

  it('negative distance는 start point를 반환한다', () => {
    const out = arcPointAtLengthInto({ x: 0, y: 0 }, quarterCircle, -1);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('degenerate arc (rx=0)는 center 좌표를 반환한다', () => {
    const degenerate: CenterArcLike = {
      cx: 3,
      cy: 4,
      rx: 0,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI,
      sweep: true,
    };
    const out = arcPointAtLengthInto({ x: 0, y: 0 }, degenerate, 0.5);
    expect(out.x).toBeCloseTo(3, 10);
    expect(out.y).toBeCloseTo(4, 10);
  });

  it('tuple out: [0, 0]에 결과를 기록하고 반환한다', () => {
    const out = arcPointAtLengthInto([0, 0] as [number, number], quarterCircle, 0);
    expect(out[0]).toBeCloseTo(1, 10);
    expect(out[1]).toBeCloseTo(0, 10);
  });

  it('object out: { x, y }에 결과를 기록하고 반환한다', () => {
    const out = arcPointAtLengthInto({ x: 0, y: 0 }, quarterCircle, 0);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('out 참조를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = arcPointAtLengthInto(out, quarterCircle, 0);
    expect(result).toBe(out);
  });
});

describe('arcPointAtLength', () => {
  it('Into와 다른 참조 object를 반환한다', () => {
    const intoOut = { x: 0, y: 0 };
    arcPointAtLengthInto(intoOut, quarterCircle, 0);
    const companion = arcPointAtLength(quarterCircle, 0);
    expect(companion).not.toBe(intoOut);
  });

  it('distance=0이면 start point (1, 0)을 반환한다', () => {
    const result = arcPointAtLength(quarterCircle, 0);
    expect(result.x).toBeCloseTo(1, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  it('distance=totalLength이면 end point (0, 1)을 반환한다', () => {
    const result = arcPointAtLength(quarterCircle, totalLength);
    // arcTAtLength 이진 탐색 수렴 오차로 인해 ~1e-8 수준의 차이가 허용된다.
    expect(result.x).toBeCloseTo(0, 7);
    expect(result.y).toBeCloseTo(1, 7);
  });

  it('Into와 같은 좌표를 반환한다', () => {
    for (const dist of [0, Math.PI / 8, Math.PI / 4, Math.PI / 2]) {
      const intoResult = arcPointAtLengthInto({ x: 0, y: 0 }, quarterCircle, dist);
      const companionResult = arcPointAtLength(quarterCircle, dist);
      expect(companionResult.x).toBeCloseTo(intoResult.x, 10);
      expect(companionResult.y).toBeCloseTo(intoResult.y, 10);
    }
  });
});
