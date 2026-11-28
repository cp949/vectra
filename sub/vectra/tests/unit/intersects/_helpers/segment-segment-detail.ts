/**
 * segmentSegmentDetail 시험이 함께 쓰는 선분 생성 함수와 결과 단언 함수.
 */
import { expect } from 'vitest';
import type { SegmentSegmentDetail } from '../../../../src/types';
import type { Segment } from '../../../../src/types/flat-shapes.internal';

/** 교차 parameter를 비교할 소수 자릿수. */
export const EXPECTED_PRECISION = 12;

/** 두 끝점 좌표로 평평한 선분을 만든다. */
export function segment(ax: number, ay: number, bx: number, by: number): Segment {
  return { x1: ax, y1: ay, x2: bx, y2: by };
}

/**
 * 결과가 `point`인지 확인하고, 주어진 필드만 기대값과 비교한다.
 * 생략한 필드는 검사하지 않는다.
 */
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

/**
 * 결과가 `overlap`인지 확인하고, 주어진 필드만 기대값과 비교한다.
 * 생략한 필드는 검사하지 않는다.
 */
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
