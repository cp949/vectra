import { expect } from 'vitest';
import type { ArcCommand, CenterArcLike } from '../../../src/types';

export const EPS = 1e-12;
export const LOOSE_EPS = 1e-9;

export type PointOut = { x: number; y: number };
export type BoundsOut = { min: PointOut; max: PointOut };

export function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

export function expectNear(result: number, expected: number, epsilon = EPS): void {
  expect(relErr(result, expected)).toBeLessThan(epsilon);
}

export function expectAbsNearZero(result: number, epsilon = EPS): void {
  expect(Math.abs(result)).toBeLessThan(epsilon);
}

export function expectPointNear(point: PointOut, expected: PointOut, epsilon = EPS): void {
  expectNear(point.x, expected.x, epsilon);
  expectNear(point.y, expected.y, epsilon);
}

export function expectBoundsNear(bounds: BoundsOut, min: PointOut, max: PointOut, epsilon = EPS): void {
  expectPointNear(bounds.min, min, epsilon);
  expectPointNear(bounds.max, max, epsilon);
}

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

export function makeCenterOut(): CenterArcLike {
  return makeCenterArc({ rx: 0, ry: 0, startAngle: 0, endAngle: 0, sweep: false });
}

export function makeEndpointOut(): ArcCommand {
  return makeArc({ rx: 0, ry: 0, largeArc: false, sweep: false, x: 0, y: 0 });
}

export function makePointOut(): PointOut {
  return { x: 0, y: 0 };
}

export function makeBoundsOut(): BoundsOut {
  return { min: makePointOut(), max: makePointOut() };
}

export function polylineLength(points: PointOut[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}
