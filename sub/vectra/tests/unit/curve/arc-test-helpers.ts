/**
 * arc 시험이 함께 쓰는 허용 오차 비교와 fixture 생성 helper를 모은다.
 * 시험 파일이 아니다. arc.test.ts가 import한다.
 */
import { expect } from 'vitest';
import type { ArcCommand, CenterArcLike } from '../../../src/types';

export const EPS = 1e-12;
export const LOOSE_EPS = 1e-9;

export type PointOut = { x: number; y: number };
export type BoundsOut = { minX: number; minY: number; maxX: number; maxY: number };

/**
 * 기대값 대비 상대 오차를 구한다.
 * 기대값이 0이면 절대 오차를 돌려준다.
 */
export function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

/**
 * 결과가 기대값과 상대 오차 epsilon 안에서 같은지 단언한다.
 */
export function expectNear(result: number, expected: number, epsilon = EPS): void {
  expect(relErr(result, expected)).toBeLessThan(epsilon);
}

/**
 * 결과의 절댓값이 epsilon보다 작은지 단언한다.
 * 상대 오차를 쓸 수 없는 0 근처 값에 쓴다.
 */
export function expectAbsNearZero(result: number, epsilon = EPS): void {
  expect(Math.abs(result)).toBeLessThan(epsilon);
}

/**
 * 점의 x와 y를 각각 상대 오차로 비교한다.
 */
export function expectPointNear(point: PointOut, expected: PointOut, epsilon = EPS): void {
  expectNear(point.x, expected.x, epsilon);
  expectNear(point.y, expected.y, epsilon);
}

/**
 * 경계 상자의 네 값을 min, max 점과 상대 오차로 비교한다.
 */
export function expectBoundsNear(bounds: BoundsOut, min: PointOut, max: PointOut, epsilon = EPS): void {
  expectNear(bounds.minX, min.x, epsilon);
  expectNear(bounds.minY, min.y, epsilon);
  expectNear(bounds.maxX, max.x, epsilon);
  expectNear(bounds.maxY, max.y, epsilon);
}

/**
 * 끝점 형식 arc 명령 fixture를 만든다.
 * 기본값은 단위 반지름 호다. 시험은 필요한 필드만 덮어쓴다.
 */
export function makeArc(overrides: Partial<ArcCommand> = {}): ArcCommand {
  return {
    kind: 'arc',
    rx: 1,
    ry: 1,
    xRotation: 0,
    largeArc: false,
    sweep: false,
    x: 1,
    y: 1,
    ...overrides,
  };
}

/**
 * 중심 형식 arc fixture를 만든다.
 * 기본값은 원점 중심 단위 원의 1사분면 sweep=true 호다.
 */
export function makeCenterArc(overrides: Partial<CenterArcLike> = {}): CenterArcLike {
  return {
    cx: 0,
    cy: 0,
    rx: 1,
    ry: 1,
    xRotation: 0,
    startAngle: 0,
    endAngle: Math.PI / 2,
    sweep: true,
    ...overrides,
  };
}

/**
 * 중심 형식 out 인자로 넘길 0 초기값 객체를 만든다.
 */
export function makeCenterOut(): CenterArcLike {
  return makeCenterArc({ rx: 0, ry: 0, startAngle: 0, endAngle: 0, sweep: false });
}

/**
 * 끝점 형식 out 인자로 넘길 0 초기값 arc 명령을 만든다.
 */
export function makeEndpointOut(): ArcCommand {
  return makeArc({ rx: 0, ry: 0, largeArc: false, sweep: false, x: 0, y: 0 });
}

/**
 * 점 out 인자로 넘길 원점 객체를 만든다.
 */
export function makePointOut(): PointOut {
  return { x: 0, y: 0 };
}

/**
 * 경계 상자 out 인자로 넘길 0 초기값 객체를 만든다.
 */
export function makeBoundsOut(): BoundsOut {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

/**
 * 꺾은선의 인접 점 사이 거리 합을 구한다.
 * 평탄화 결과가 실제 호 길이에 수렴하는지 비교할 때 쓴다.
 */
export function polylineLength(points: PointOut[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}
