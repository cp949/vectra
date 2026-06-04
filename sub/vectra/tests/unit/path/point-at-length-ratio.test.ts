/**
 * pointAtLengthRatio / pointAtLengthRatioInto 단위 테스트.
 * ratio 정상값·경계·clamp·non-finite, Into variant 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { pointAtLengthRatio } from '../../../src/path/point-at-length-ratio';
import { pointAtLengthRatioInto } from '../../../src/path/point-at-length-ratio-into';
import type { PathCommand, XYObjectWritable } from '../../../src/types/index';

/**
 * (0,0) → (100, 0) 단일 수평 직선 path.
 * 길이 100, 접선 (1, 0), 법선 (0, 1).
 */
function makeHorizontalLine(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 100, y: 0 },
  ];
}

describe('pointAtLengthRatio / pointAtLengthRatioInto', () => {
  test('ratio=0 → 첫 segment 시작점', () => {
    const cmds = makeHorizontalLine();
    expect(pointAtLengthRatio(cmds, 0)).toEqual({ x: 0, y: 0 });
  });

  test('ratio=0.5 → 중간점', () => {
    const cmds = makeHorizontalLine();
    const r = pointAtLengthRatio(cmds, 0.5);
    expect(r?.x).toBeCloseTo(50, 10);
    expect(r?.y).toBeCloseTo(0, 10);
  });

  test('ratio=1 → 마지막 segment 끝점', () => {
    const cmds = makeHorizontalLine();
    const r = pointAtLengthRatio(cmds, 1);
    expect(r?.x).toBeCloseTo(100, 10);
    expect(r?.y).toBeCloseTo(0, 10);
  });

  test('ratio<0 → 시작점 clamp', () => {
    const cmds = makeHorizontalLine();
    expect(pointAtLengthRatio(cmds, -0.5)).toEqual({ x: 0, y: 0 });
  });

  test('ratio>1 → 끝점 clamp', () => {
    const cmds = makeHorizontalLine();
    const r = pointAtLengthRatio(cmds, 2);
    expect(r?.x).toBeCloseTo(100, 10);
    expect(r?.y).toBeCloseTo(0, 10);
  });

  test('empty path → undefined', () => {
    expect(pointAtLengthRatio([], 0.5)).toBeUndefined();
  });

  test('Move-only path → undefined', () => {
    expect(pointAtLengthRatio([{ kind: 'move', x: 5, y: 6 }], 0.5)).toBeUndefined();
  });

  test('non-finite ratio (NaN) → 마지막 segment 끝점 기록 (NaN 비교가 false라 forEach 끝까지 진행)', () => {
    const cmds = makeHorizontalLine();
    // NaN * totalLength = NaN. `distance <= cumulative + segLen` 비교가 NaN이므로 false →
    // forEach 종료 후 마지막 점 기록.
    const r = pointAtLengthRatio(cmds, Number.NaN);
    expect(r?.x).toBeCloseTo(100, 10);
    expect(r?.y).toBeCloseTo(0, 10);
  });

  test('non-finite ratio (Infinity) → 끝점 clamp (pointAtLengthInto의 distance>totalLength 분기)', () => {
    const cmds = makeHorizontalLine();
    const r = pointAtLengthRatio(cmds, Number.POSITIVE_INFINITY);
    expect(r?.x).toBeCloseTo(100, 10);
    expect(r?.y).toBeCloseTo(0, 10);
  });

  test('non-finite ratio (-Infinity) → 시작점 clamp', () => {
    const cmds = makeHorizontalLine();
    expect(pointAtLengthRatio(cmds, Number.NEGATIVE_INFINITY)).toEqual({ x: 0, y: 0 });
  });

  test('pointAtLengthRatioInto: 성공 시 true 반환 후 out 기록', () => {
    const cmds = makeHorizontalLine();
    const out: XYObjectWritable = { x: -1, y: -1 };
    expect(pointAtLengthRatioInto(out, cmds, 0.5)).toBe(true);
    expect(out.x).toBeCloseTo(50, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('pointAtLengthRatioInto: empty path → false 반환, out 미수정', () => {
    const out: XYObjectWritable = { x: 7, y: 8 };
    expect(pointAtLengthRatioInto(out, [], 0.5)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('pointAtLengthRatio: companion은 새 plain object 반환', () => {
    const cmds = makeHorizontalLine();
    const a = pointAtLengthRatio(cmds, 0.3);
    const b = pointAtLengthRatio(cmds, 0.3);
    expect(a).not.toBe(b);
  });
});
