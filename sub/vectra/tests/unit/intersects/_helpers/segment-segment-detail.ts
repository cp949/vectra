import { expect } from 'vitest';
import type { SegmentLike, SegmentSegmentDetail } from '../../../../src/types';

export const EXPECTED_PRECISION = 12;

export function segment(ax: number, ay: number, bx: number, by: number): SegmentLike {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}

export function expectPointDetail(
  result: SegmentSegmentDetail,
  expected: { point?: { x: number; y: number }; tA?: number; tB?: number },
  digits = EXPECTED_PRECISION
): void {
  expect(result.kind).toBe('point');
  if (result.kind !== 'point') {
    throw new Error(`point detail expected, got ${result.kind}`);
  }

  if (expected.point !== undefined) {
    expect(result.point).toEqual(expected.point);
  }
  if (expected.tA !== undefined) {
    expect(result.tA).toBeCloseTo(expected.tA, digits);
  }
  if (expected.tB !== undefined) {
    expect(result.tB).toBeCloseTo(expected.tB, digits);
  }
}

export function expectOverlapDetail(
  result: SegmentSegmentDetail,
  expected: {
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    tA?: readonly [number, number];
    tB?: readonly [number, number];
  },
  digits = EXPECTED_PRECISION
): void {
  expect(result.kind).toBe('overlap');
  if (result.kind !== 'overlap') {
    throw new Error(`overlap detail expected, got ${result.kind}`);
  }

  if (expected.start !== undefined) {
    expect(result.start).toEqual(expected.start);
  }
  if (expected.end !== undefined) {
    expect(result.end).toEqual(expected.end);
  }
  if (expected.tA !== undefined) {
    expect(result.tA[0]).toBeCloseTo(expected.tA[0], digits);
    expect(result.tA[1]).toBeCloseTo(expected.tA[1], digits);
  }
  if (expected.tB !== undefined) {
    expect(result.tB[0]).toBeCloseTo(expected.tB[0], digits);
    expect(result.tB[1]).toBeCloseTo(expected.tB[1], digits);
  }
}
