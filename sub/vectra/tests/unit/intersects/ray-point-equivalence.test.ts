/**
 * intersects.singleIntersectionSegmentRayInto / singleIntersectionSegmentRay / rayCircleIntersectionsInto /
 * rayCircleIntersections — object 전용 경로와 scalar kernel이 이전 구현과 비트 단위로 같은지 고정한다.
 *
 * 입력: 이전 구현에는 객체·tuple·class instance 점이 섞인 중첩 segment·ray·circle을 넘긴다.
 * 대상 함수에는 같은 좌표의 평평한 segment(x1·y1·x2·y2)·ray(ox·oy·dx·dy)·circle(cx·cy·r)을 넘긴다.
 *
 * 검증: 정수 격자·실수·±0·NaN·±Infinity 좌표,
 * 평행·collinear·zero-length·방향 벡터 0·끝점 접촉·tangent·ray 시작점이 circle 안인 경우, epsilon 생략·0·음수·NaN·여러 크기에서
 * 반환값과 기록한 좌표가 이전 구현과 `Object.is` 수준으로 같다. false일 때 out을 수정하지 않는 정책도 같다.
 * 이전 구현은 공유 reader와 `lineFamilyIntersectionPoint`/`lineFamilyEllipseIntersectionPoints`를 그대로 쓴다.
 */
import { describe, expect, test } from 'vitest';
import { rayCircleIntersections } from '../../../src/intersects/ray-circle-intersections';
import { rayCircleIntersectionsInto } from '../../../src/intersects/ray-circle-intersections-into';
import { singleIntersectionSegmentRay } from '../../../src/intersects/single-intersection-segment-ray';
import { singleIntersectionSegmentRayInto } from '../../../src/intersects/single-intersection-segment-ray-into';
import { readCircleCenter, readCircleRadius } from '../../../src/internal/circle';
import {
  lineFamilyIntersectionPoint,
  rayToLineFamilyParam,
  segmentToLineFamilyParam,
} from '../../../src/internal/line-family';
import { lineFamilyEllipseIntersectionPoints } from '../../../src/internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../../../src/internal/numeric';
import { readRayDirection, readRayOrigin } from '../../../src/internal/ray';
import { readSegmentA, readSegmentB } from '../../../src/internal/segment';
import { readX, readY } from '../../../src/internal/xy';
import { createRng } from '../../../src/random/create-rng';
import type { CircleLike, RayLike, SegmentLike, XYInput, XYObjectWritable } from '../../../src/types';

// 이전 구현. 공유 reader와 `LineFamilyParam` record, `solveLineFamilyEllipse` buffer를 그대로 쓴다.

function referenceSegmentRayInto(out: XYObjectWritable, line: SegmentLike, ray: RayLike, epsilon?: number): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const rayParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  return lineFamilyIntersectionPoint(out, lineParam, rayParam, epsilon);
}

function referenceRayCircleInto(
  outPoints: XYObjectWritable[],
  ray: RayLike,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  const center = readCircleCenter(circle);
  const radius = readCircleRadius(circle);
  return lineFamilyEllipseIntersectionPoints(
    outPoints,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'ray',
    readX(center),
    readY(center),
    radius,
    radius,
    epsilon
  );
}

class Point2 {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}
}

type Rng = () => number;

const SPECIAL = [0, -0, 1, -1, 1e-300, 1e150, -1e150, 1e308, -1e308, NaN, Infinity, -Infinity, 0.5];
const EPSILONS: Array<number | undefined> = [
  undefined,
  undefined,
  undefined,
  0,
  -0,
  1e-12,
  1e-9,
  1e-6,
  1e-3,
  0.5,
  1,
  100,
  -1e-9,
  NaN,
  Infinity,
];

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

function coord(rng: Rng): number {
  const r = rng();
  if (r < 0.03) return pick(rng, SPECIAL);
  if (r < 0.55) return Math.floor(rng() * 9) - 4;
  return (rng() - 0.5) * 20;
}

/** 점 한 개의 명세. 같은 명세로 이전 구현과 새 구현이 쓸 입력을 따로 만든다. */
interface PointSpec {
  form: number;
  x: number;
  y: number;
}

function makePoint(spec: PointSpec): XYInput {
  if (spec.form === 0) return { x: spec.x, y: spec.y };
  if (spec.form === 1) return [spec.x, spec.y];
  return new Point2(spec.x, spec.y);
}

function pointSpec(rng: Rng, objectBias: number, x = coord(rng), y = coord(rng)): PointSpec {
  const form = rng() < objectBias ? (rng() < 0.8 ? 0 : 2) : Math.floor(rng() * 3);
  return { form, x, y };
}

interface SegmentSpec {
  kind: number;
  a: PointSpec;
  b: PointSpec;
}

function segmentSpec(rng: Rng, objectBias: number): SegmentSpec {
  const a = pointSpec(rng, objectBias);
  const r = rng();
  let b: PointSpec;
  if (r < 0.07) b = { ...a };
  else if (r < 0.2) b = pointSpec(rng, objectBias, a.x + Math.floor(rng() * 3) - 1, a.y);
  else b = pointSpec(rng, objectBias);
  return { kind: rng() < objectBias ? 0 : Math.floor(rng() * 2), a, b };
}

function makeSegment(spec: SegmentSpec): SegmentLike {
  const a = makePoint(spec.a);
  const b = makePoint(spec.b);
  return spec.kind === 0 ? { a, b } : ([a, b] as const);
}

interface RaySpec {
  kind: number;
  origin: PointSpec;
  direction: PointSpec;
}

function raySpec(rng: Rng, objectBias: number): RaySpec {
  const origin = pointSpec(rng, objectBias);
  const r = rng();
  const direction =
    r < 0.07
      ? { ...origin, x: 0, y: 0 }
      : r < 0.2
        ? pointSpec(rng, objectBias, Math.floor(rng() * 3) - 1, 0)
        : pointSpec(rng, objectBias);
  return { kind: rng() < objectBias ? 0 : Math.floor(rng() * 2), origin, direction };
}

function makeRay(spec: RaySpec): RayLike {
  if (spec.kind === 0) return { origin: makePoint(spec.origin), direction: makePoint(spec.direction) };
  if (spec.kind === 1) return [spec.origin.x, spec.origin.y, spec.direction.x, spec.direction.y] as const;
  return { origin: [spec.origin.x, spec.origin.y], direction: [spec.direction.x, spec.direction.y] };
}

/** 난수 선분의 두 끝점을 평평한 입력으로 만든다. */
function flatSegment(spec: SegmentSpec) {
  return { x1: spec.a.x, y1: spec.a.y, x2: spec.b.x, y2: spec.b.y };
}

/** 난수 반직선의 원점과 방향을 평평한 입력으로 만든다. */
function flatRay(spec: RaySpec) {
  return { ox: spec.origin.x, oy: spec.origin.y, dx: spec.direction.x, dy: spec.direction.y };
}

interface CircleSpec {
  kind: number;
  center: PointSpec;
  radius: number;
}

function circleSpec(rng: Rng, objectBias: number): CircleSpec {
  const r = rng();
  const radius = r < 0.06 ? pick(rng, [0, -1, NaN, Infinity, 1e-300]) : r < 0.5 ? Math.floor(rng() * 5) + 1 : rng() * 6;
  return { kind: rng() < objectBias ? 0 : Math.floor(rng() * 2), center: pointSpec(rng, objectBias), radius };
}

function makeCircle(spec: CircleSpec): CircleLike {
  if (spec.kind === 0) return { center: makePoint(spec.center), radius: spec.radius };
  return [makePoint(spec.center), spec.radius] as const;
}

function same(a: number, b: number): boolean {
  return Object.is(a, b);
}

const N = 150_000;

describe('ray 점 반환 함수 — 이전 구현과 비트 단위 동일성', () => {
  test(`무작위 ${N}건: singleIntersectionSegmentRayInto가 반환값과 기록한 좌표까지 이전 구현과 같다`, () => {
    const rng = createRng(20260201);
    let hits = 0;
    for (let i = 0; i < N; i++) {
      const bias = i % 3 === 0 ? 1 : 0.3;
      const seg = segmentSpec(rng, bias);
      const ray = raySpec(rng, bias);
      const epsilon = pick(rng, EPSILONS);
      const expectedOut = { x: 77, y: 88 };
      const actualOut = { x: 77, y: 88 };
      const expected = referenceSegmentRayInto(expectedOut, makeSegment(seg), makeRay(ray), epsilon);
      const actual = singleIntersectionSegmentRayInto(actualOut, flatSegment(seg), flatRay(ray), epsilon);
      const { x: ex, y: ey } = expectedOut;
      const { x: ax, y: ay } = actualOut;
      if (actual !== expected || !same(ex, ax) || !same(ey, ay)) {
        throw new Error(
          `불일치: seg=${JSON.stringify(seg)} ray=${JSON.stringify(ray)} eps=${epsilon} 기대=${expected}(${ex}, ${ey}) 실제=${actual}(${ax}, ${ay})`
        );
      }
      if (expected) hits++;
    }
    // 교차 판정이 한쪽으로 쏠리지 않았는지 확인한다
    expect(hits).toBeGreaterThan(N / 50);
    expect(hits).toBeLessThan(N);
  });

  test(`무작위 ${N}건: singleIntersectionSegmentRay가 이전 구현과 같다`, () => {
    const rng = createRng(20260202);
    for (let i = 0; i < N; i++) {
      const bias = i % 3 === 0 ? 1 : 0.3;
      const seg = segmentSpec(rng, bias);
      const ray = raySpec(rng, bias);
      const epsilon = pick(rng, EPSILONS);
      const expectedOut = { x: 0, y: 0 };
      const expected = referenceSegmentRayInto(expectedOut, makeSegment(seg), makeRay(ray), epsilon)
        ? expectedOut
        : undefined;
      const actual = singleIntersectionSegmentRay(flatSegment(seg), flatRay(ray), epsilon);
      if ((actual === undefined) !== (expected === undefined)) {
        throw new Error(`판정 불일치: seg=${JSON.stringify(seg)} ray=${JSON.stringify(ray)} eps=${epsilon}`);
      }
      if (actual && expected && (!same(actual.x, expected.x) || !same(actual.y, expected.y))) {
        throw new Error(`좌표 불일치: seg=${JSON.stringify(seg)} ray=${JSON.stringify(ray)} eps=${epsilon}`);
      }
    }
  });

  test(`무작위 ${N}건: rayCircleIntersectionsInto와 rayCircleIntersections가 이전 구현과 같다`, () => {
    const rng = createRng(20260203);
    let pushed = 0;
    for (let i = 0; i < N; i++) {
      const bias = i % 3 === 0 ? 1 : 0.3;
      const ray = raySpec(rng, bias);
      const circle = circleSpec(rng, bias);
      const epsilon = rng() < 0.5 ? undefined : pick(rng, EPSILONS);
      const eps = epsilon === undefined ? DEFAULT_EPSILON : epsilon;
      const stale: XYObjectWritable[] = [{ x: 5, y: 5 }];
      const expected = referenceRayCircleInto(stale.slice(), makeRay(ray), makeCircle(circle), epsilon);
      const staleActual: XYObjectWritable[] = [{ x: 5, y: 5 }];
      const flatCircle = { cx: circle.center.x, cy: circle.center.y, r: circle.radius };
      const actual = rayCircleIntersectionsInto(staleActual, flatRay(ray), flatCircle, epsilon);
      const companion = rayCircleIntersections(flatRay(ray), flatCircle, eps);
      expect(actual).toBe(staleActual);
      for (const got of [actual, companion]) {
        let ok = got.length === expected.length;
        for (let k = 0; ok && k < got.length; k++) ok = same(got[k].x, expected[k].x) && same(got[k].y, expected[k].y);
        if (!ok) {
          throw new Error(
            `불일치: ray=${JSON.stringify(ray)} circle=${JSON.stringify(circle)} eps=${epsilon} 기대=${JSON.stringify(expected)} 실제=${JSON.stringify(got)}`
          );
        }
      }
      pushed += expected.length;
    }
    expect(pushed).toBeGreaterThan(N / 20);
  });

  test('교점마다 새 object를 만들고 호출 전 내용은 비운다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const ray = { ox: -5, oy: 0, dx: 1, dy: 0 };
    const circle = { cx: 0, cy: 0, r: 2 };
    const first = rayCircleIntersectionsInto(out, ray, circle);
    expect(first).toEqual([
      { x: -2, y: 0 },
      { x: 2, y: 0 },
    ]);
    const kept = first[0];
    rayCircleIntersectionsInto(out, ray, circle);
    expect(out[0]).not.toBe(kept);
  });
});
