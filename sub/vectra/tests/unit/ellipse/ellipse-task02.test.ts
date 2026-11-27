/** 타원의 이심률, 초점, 초점으로부터의 복원 계약을 검증한다. */
import { describe, expect, test } from 'vitest';
import { eccentricity } from '../../../src/ellipse/eccentricity';
import { foci } from '../../../src/ellipse/foci';
import { fociInto } from '../../../src/ellipse/foci-into';
import { fromFoci } from '../../../src/ellipse/from-foci';
import { fromFociInto } from '../../../src/ellipse/from-foci-into';
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';
import { makeEllipse } from './_helpers';

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

/** 두 초점을 기록할 빈 선분을 만든다. */
function makeSegmentOut(): SegmentWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}

// ─── eccentricity ────────────────────────────────────────────────────────────

describe('eccentricity', () => {
  test('원(rx == ry > 0)이면 0을 반환한다', () => {
    expect(eccentricity({ cx: 0, cy: 0, rx: 5, ry: 5 })).toBe(0);
  });

  test('납작한 타원(ry < rx)의 이심률을 계산한다', () => {
    // rx=5, ry=4 → c=3, e=3/5=0.6
    expect(eccentricity({ cx: 0, cy: 0, rx: 5, ry: 4 })).toBeCloseTo(0.6, 10);
  });

  test('세로 타원(rx < ry)의 이심률을 계산한다', () => {
    // ry=5, rx=4 → major=5, c=3, e=0.6
    expect(eccentricity({ cx: 0, cy: 0, rx: 4, ry: 5 })).toBeCloseTo(0.6, 10);
  });

  test('3-4-5 직각삼각형 비율 타원', () => {
    // rx=5, ry=3 → c=4, e=4/5=0.8
    expect(eccentricity({ cx: 0, cy: 0, rx: 5, ry: 3 })).toBeCloseTo(0.8, 10);
  });

  test('empty ellipse(rx=0)이면 NaN을 반환한다', () => {
    expect(eccentricity({ cx: 0, cy: 0, rx: 0, ry: 3 })).toBeNaN();
  });

  test('empty ellipse(ry=0)이면 NaN을 반환한다', () => {
    expect(eccentricity({ cx: 0, cy: 0, rx: 3, ry: 0 })).toBeNaN();
  });

  test('음수 반지름이면 NaN을 반환한다', () => {
    expect(eccentricity({ cx: 0, cy: 0, rx: -1, ry: 3 })).toBeNaN();
  });
});

// ─── fociInto ────────────────────────────────────────────────────────────────

describe('fociInto', () => {
  test('원이면 두 초점 모두 center를 기록한다', () => {
    const out = makeSegmentOut();
    fociInto(out, { cx: 3, cy: 4, rx: 5, ry: 5 });
    expect(out.x1).toBe(3);
    expect(out.y1).toBe(4);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(4);
  });

  test('empty ellipse이면 두 초점 모두 center를 기록한다', () => {
    const out = makeSegmentOut();
    fociInto(out, { cx: 1, cy: 2, rx: 0, ry: 0 });
    expect(out.x1).toBe(1);
    expect(out.y1).toBe(2);
    expect(out.x2).toBe(1);
    expect(out.y2).toBe(2);
  });

  test('rx > ry 타원이면 초점이 x축 방향으로 위치한다', () => {
    // rx=5, ry=4 → c=3 → 초점 (cx±3, cy)
    const out = makeSegmentOut();
    fociInto(out, { cx: 0, cy: 0, rx: 5, ry: 4 });
    expect(out.x1).toBeCloseTo(-3, 10);
    expect(out.y1).toBeCloseTo(0, 10);
    expect(out.x2).toBeCloseTo(3, 10);
    expect(out.y2).toBeCloseTo(0, 10);
  });

  test('ry > rx 타원이면 초점이 y축 방향으로 위치한다', () => {
    // ry=5, rx=4 → c=3 → 초점 (cx, cy±3)
    const out = makeSegmentOut();
    fociInto(out, { cx: 0, cy: 0, rx: 4, ry: 5 });
    expect(out.x1).toBeCloseTo(0, 10);
    expect(out.y1).toBeCloseTo(-3, 10);
    expect(out.x2).toBeCloseTo(0, 10);
    expect(out.y2).toBeCloseTo(3, 10);
  });

  test('center가 이동된 타원도 올바르게 계산한다', () => {
    // cx=10, cy=20, rx=5, ry=3 → c=4 → 초점 (6,20), (14,20)
    const out = makeSegmentOut();
    fociInto(out, { cx: 10, cy: 20, rx: 5, ry: 3 });
    expect(out.x1).toBeCloseTo(6, 10);
    expect(out.y1).toBeCloseTo(20, 10);
    expect(out.x2).toBeCloseTo(14, 10);
    expect(out.y2).toBeCloseTo(20, 10);
  });

  test('out을 반환한다', () => {
    const out = makeSegmentOut();
    const result = fociInto(out, { cx: 0, cy: 0, rx: 5, ry: 4 });
    expect(result).toBe(out);
  });
});

// ─── foci (allocating companion) ─────────────────────────────────────────────

describe('foci', () => {
  test('plain object {x1, y1, x2, y2}를 반환한다', () => {
    const result = foci({ cx: 0, cy: 0, rx: 5, ry: 4 });
    expect(result.x1).toBeCloseTo(-3, 10);
    expect(result.x2).toBeCloseTo(3, 10);
  });

  test('원이면 두 초점 모두 center를 반환한다', () => {
    const result = foci({ cx: 1, cy: 2, rx: 3, ry: 3 });
    expect(result.x1).toBe(1);
    expect(result.y1).toBe(2);
    expect(result.x2).toBe(1);
    expect(result.y2).toBe(2);
  });
});

// ─── fromFociInto ────────────────────────────────────────────────────────────

describe('fromFociInto', () => {
  test('유효한 입력으로 ellipse를 계산한다', () => {
    // focusA=(-3,0), focusB=(3,0), sum=10 → a=5, c=3, b=4
    const out = makeEllipse();
    const result = fromFociInto(out, { x: -3, y: 0 }, { x: 3, y: 0 }, 10);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 0, y: 0 });
    expect(out.radiusX).toBeCloseTo(5, 10);
    expect(out.radiusY).toBeCloseTo(4, 10);
  });

  test('center가 이동된 경우도 올바르게 계산한다', () => {
    // focusA=(7,20), focusB=(13,20), sum=10 → center=(10,20), a=5, c=3, b=4
    const out = makeEllipse();
    fromFociInto(out, { x: 7, y: 20 }, { x: 13, y: 20 }, 10);
    expect(out.center).toEqual({ x: 10, y: 20 });
    expect(out.radiusX).toBeCloseTo(5, 10);
    expect(out.radiusY).toBeCloseTo(4, 10);
  });

  test('sumOfDistances == dist이면 degenerate(radiusY=0) ellipse를 반환한다', () => {
    // focusA=(-3,0), focusB=(3,0), sum=6 == dist → b=0
    const out = makeEllipse();
    const result = fromFociInto(out, { x: -3, y: 0 }, { x: 3, y: 0 }, 6);
    expect(result).not.toBe(false);
    expect(out.radiusY).toBeCloseTo(0, 10);
  });

  test('두 초점이 같으면 원을 반환한다', () => {
    // focusA = focusB = (0,0), sum=10 → c=0, a=5, b=5
    const out = makeEllipse();
    fromFociInto(out, { x: 0, y: 0 }, { x: 0, y: 0 }, 10);
    expect(out.radiusX).toBeCloseTo(5, 10);
    expect(out.radiusY).toBeCloseTo(5, 10);
  });

  test('sumOfDistances <= 0이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeEllipse(1, 2, 3, 4);
    const result = fromFociInto(out, { x: -1, y: 0 }, { x: 1, y: 0 }, 0);
    expect(result).toBe(false);
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
  });

  test('sumOfDistances < dist이면 false를 반환한다', () => {
    // dist=6, sum=5 → 삼각형 부등식 위반
    const out = makeEllipse();
    const result = fromFociInto(out, { x: -3, y: 0 }, { x: 3, y: 0 }, 5);
    expect(result).toBe(false);
  });

  test('NaN 입력이면 false를 반환한다', () => {
    const out = makeEllipse();
    expect(fromFociInto(out, { x: NaN, y: 0 }, { x: 3, y: 0 }, 10)).toBe(false);
    expect(fromFociInto(out, { x: -3, y: 0 }, { x: 3, y: 0 }, NaN)).toBe(false);
  });

  test('Infinity 입력이면 false를 반환한다', () => {
    const out = makeEllipse();
    expect(fromFociInto(out, { x: -Infinity, y: 0 }, { x: 3, y: 0 }, 10)).toBe(false);
    expect(fromFociInto(out, { x: -3, y: 0 }, { x: 3, y: 0 }, Infinity)).toBe(false);
  });

  test('tuple 입력도 올바르게 처리한다', () => {
    const out = makeEllipse();
    fromFociInto(out, [-3, 0], [3, 0], 10);
    expect(out.radiusX).toBeCloseTo(5, 10);
    expect(out.radiusY).toBeCloseTo(4, 10);
  });
});

// ─── fromFoci (allocating companion) ─────────────────────────────────────────

describe('fromFoci', () => {
  test('유효한 입력으로 plain object를 반환한다', () => {
    const result = fromFoci({ x: -3, y: 0 }, { x: 3, y: 0 }, 10);
    expect(result).not.toBe(undefined);
    if (result === undefined) throw new Error('결과가 undefined여서는 안 된다');
    expect(result.center).toEqual({ x: 0, y: 0 });
    expect(result.radiusX).toBeCloseTo(5, 10);
    expect(result.radiusY).toBeCloseTo(4, 10);
  });

  test('invalid 입력이면 undefined를 반환한다', () => {
    expect(fromFoci({ x: -3, y: 0 }, { x: 3, y: 0 }, 0)).toBe(undefined);
    expect(fromFoci({ x: -3, y: 0 }, { x: 3, y: 0 }, -5)).toBe(undefined);
  });
});

// ─── round-trip 검증 ──────────────────────────────────────────────────────────

describe('fociInto + fromFociInto round-trip', () => {
  test('ellipse → foci → fromFoci로 원본 ellipse를 복원한다', () => {
    const original = { cx: 5, cy: 10, rx: 13, ry: 5 };
    const segOut = makeSegmentOut();
    fociInto(segOut, original);

    // foci → focusA, focusB 사이 거리의 합 = 2 * radiusX
    const sumOfDist = 2 * original.rx;
    const restored = fromFoci({ x: segOut.x1, y: segOut.y1 }, { x: segOut.x2, y: segOut.y2 }, sumOfDist);

    expect(restored).not.toBe(undefined);
    if (restored === undefined) throw new Error('복원 결과가 undefined여서는 안 된다');
    expect(restored.center.x).toBeCloseTo(original.cx, 10);
    expect(restored.center.y).toBeCloseTo(original.cy, 10);
    expect(restored.radiusX).toBeCloseTo(original.rx, 10);
    expect(restored.radiusY).toBeCloseTo(original.ry, 10);
  });
});
