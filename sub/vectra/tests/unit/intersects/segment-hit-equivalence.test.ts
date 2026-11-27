import { flatPolygonFromLegacyPoints } from '../../../src/internal/legacy-polygon.internal';
/**
 * intersects.intersectsPolygonSegment / intersectsPolygonRay / intersectsPolygonInfiniteLine /
 * intersectsCircleSegment / intersectsSegmentSegment — 전용 reader, 재사용 param, 경계 근접 건너뛰기를
 * 쓰는 구현이 이전 구현과 같은 값을 반환하는지 고정한다.
 *
 * 검증: 객체·tuple·class instance·{ points } 입력, 점 모양이 섞인 polygon·segment, 점 수 0~12,
 * 정수 격자·실수·큰 offset·±0·NaN·±Infinity 좌표, polygon 경계에서 epsilon 근처로 떨어진 시작점,
 * epsilon 생략·0·음수·NaN·Infinity·여러 크기에서 반환값이 이전 구현과 같다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsCircleSegment } from '../../../src/intersects/intersects-circle-segment';
import { intersectsPolygonInfiniteLine } from '../../../src/intersects/intersects-polygon-infinite-line';
import { intersectsPolygonRay } from '../../../src/intersects/intersects-polygon-ray';
import { intersectsPolygonSegment } from '../../../src/intersects/intersects-polygon-segment';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { readCircleCenter, readCircleRadius } from '../../../src/internal/circle';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../../../src/internal/infinite-line';
import {
  infiniteLineToLineFamilyParam,
  lineFamilyCircleIntersects,
  lineFamilyIntersects,
  rayToLineFamilyParam,
  segmentToLineFamilyParam,
} from '../../../src/internal/line-family';
import type { LineFamilyParam } from '../../../src/internal/line-family';
import { DEFAULT_EPSILON } from '../../../src/internal/numeric';
import { polygonContainsPoint, readPolygonPoints } from '../../../src/internal/polygon';
import { readRayDirection, readRayOrigin } from '../../../src/internal/ray';
import { readSegmentA, readSegmentB } from '../../../src/internal/segment';
import { readX, readY } from '../../../src/internal/xy';
import { createRng } from '../../../src/random/create-rng';
import type { CircleLike, InfiniteLineLike, PolygonLike, RayLike, SegmentLike, XYInput } from '../../../src/types';

// 이전 구현. 공유 reader, 매번 새로 만드는 param, `(i + 1) % n` 순회, `polygonContainsPoint`를 그대로 쓴다.
// 새 구현의 비교 기준으로만 쓴다.

function referenceLineFamilyPolygonIntersects(
  line: LineFamilyParam,
  polygon: PolygonLike,
  epsilon: number | undefined
): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 3) return false;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = readX(pts[i]);
    const ay = readY(pts[i]);
    const bx = readX(pts[j]);
    const by = readY(pts[j]);
    if (lineFamilyIntersects(line, segmentToLineFamilyParam(ax, ay, bx, by), epsilon)) return true;
  }

  if (line.kind !== 'finite') return false;
  return polygonContainsPoint(flatPolygonFromLegacyPoints(pts), line.ox, line.oy, epsilon ?? DEFAULT_EPSILON);
}

function referencePolygonSegment(polygon: PolygonLike, line: SegmentLike, epsilon?: number): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  return referenceLineFamilyPolygonIntersects(lineParam, polygon, epsilon);
}

function referencePolygonRay(polygon: PolygonLike, ray: RayLike, epsilon?: number): boolean {
  const o = readRayOrigin(ray);
  const d = readRayDirection(ray);
  return referenceLineFamilyPolygonIntersects(
    rayToLineFamilyParam(readX(o), readY(o), readX(d), readY(d)),
    polygon,
    epsilon
  );
}

function referencePolygonInfiniteLine(polygon: PolygonLike, line: InfiniteLineLike, epsilon?: number): boolean {
  const o = readInfiniteLineOrigin(line);
  const d = readInfiniteLineDirection(line);
  return referenceLineFamilyPolygonIntersects(
    infiniteLineToLineFamilyParam(readX(o), readY(o), readX(d), readY(d)),
    polygon,
    epsilon
  );
}

function referenceCircleSegment(circle: CircleLike, line: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const center = readCircleCenter(circle);
  return lineFamilyCircleIntersects(lineParam, readX(center), readY(center), readCircleRadius(circle), epsilon);
}

function referenceSegmentSegment(a: SegmentLike, b: SegmentLike, epsilon?: number): boolean {
  const aa = readSegmentA(a);
  const ab = readSegmentB(a);
  const ba = readSegmentA(b);
  const bb = readSegmentB(b);
  return lineFamilyIntersects(
    segmentToLineFamilyParam(readX(aa), readY(aa), readX(ab), readY(ab)),
    segmentToLineFamilyParam(readX(ba), readY(ba), readX(bb), readY(bb)),
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

const SPECIAL = [0, -0, 1, -1, 1e-300, 1e150, -1e150, 1e308, -1e308, NaN, Infinity, -Infinity];
const EPSILONS: Array<number | undefined> = [
  undefined,
  undefined,
  undefined,
  0,
  -0,
  1e-12,
  1e-9,
  1e-9,
  1e-6,
  1e-3,
  0.5,
  1,
  100,
  -1e-9,
  NaN,
  Infinity,
  1e308,
];
const OFFSETS = [0, 0, 1e-12, 1e-10, 5e-10, 1e-9, 1.5e-9, 2e-9, 3e-9, 1e-8, 1e-6, 1e-3];

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

/** 좌표 한 값을 만든다. 일부는 특수값이다. */
function coord(rng: Rng, kind: number): number {
  if (rng() < 0.02) return pick(rng, SPECIAL);
  if (kind === 0) return Math.floor(rng() * 9) - 4;
  if (kind === 1) return (rng() - 0.5) * 20;
  return (rng() - 0.5) * 20;
}

/** 점 하나를 `form` 모양으로 만든다. 0=객체 1=tuple 2=class. */
function makePoint(x: number, y: number, form: number): XYInput {
  if (form === 0) return { x, y };
  if (form === 1) return [x, y];
  return new Point2(x, y);
}

/** 모든 좌표에 더하는 큰 offset이다. 큰 좌표에서 경계 근접 여유가 충분한지 확인한다. */
function pickOffset(rng: Rng): number {
  const r = rng();
  if (r < 0.7) return 0;
  return pick(rng, [1e3, 1e6, 1e9, -1e6]);
}

interface Scene {
  polygon: PolygonLike;
  xy: Array<[number, number]>;
  offset: number;
  form: number;
}

function makeScene(rng: Rng): Scene {
  const kind = Math.floor(rng() * 3);
  const n = rng() < 0.15 ? Math.floor(rng() * 4) : 3 + Math.floor(rng() * 10);
  const offset = pickOffset(rng);
  const form = Math.floor(rng() * 3);
  const xy: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const r = rng();
    if (r < 0.06 && i > 0) xy.push(xy[i - 1]);
    else xy.push([coord(rng, kind) + offset, coord(rng, kind) + offset]);
  }
  const mixed = rng() < 0.3;
  const pts = xy.map(([x, y]) => makePoint(x, y, mixed ? Math.floor(rng() * 3) : form));
  return { polygon: rng() < 0.3 ? { points: pts } : pts, xy, offset, form };
}

/** 시작점 후보를 만든다. polygon 경계 위나 경계에서 epsilon 근처로 떨어진 점을 자주 고른다. */
function startPoint(rng: Rng, scene: Scene): [number, number] {
  const { xy, offset } = scene;
  const r = rng();
  if (r < 0.5 && xy.length >= 2) {
    const i = Math.floor(rng() * xy.length);
    const [ax, ay] = xy[i];
    const [bx, by] = xy[(i + 1) % xy.length];
    const t = rng() < 0.3 ? pick(rng, [0, 1, 0.5]) : rng();
    const px = ax + (bx - ax) * t;
    const py = ay + (by - ay) * t;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    const d = pick(rng, OFFSETS) * (rng() < 0.5 ? 1 : -1);
    if (len > 0 && Number.isFinite(len)) return [px - (dy / len) * d, py + (dx / len) * d];
    return [px + d, py];
  }
  if (r < 0.6 && xy.length > 0) return [...pick(rng, xy)] as [number, number];
  return [coord(rng, 1) + offset, coord(rng, 1) + offset];
}

function makeSegment(rng: Rng, scene: Scene): SegmentLike {
  const [ax, ay] = startPoint(rng, scene);
  let bx: number;
  let by: number;
  const r = rng();
  if (r < 0.08) {
    bx = ax;
    by = ay;
  } else if (r < 0.4) {
    // 시작점에서 밖으로 향하는 짧은 segment. edge와 교차하지 않고 시작점 containment만 남는다.
    const ang = rng() * 2 * Math.PI;
    const len = pick(rng, [1e-12, 1e-9, 1e-6, 1e-3, 0.1, 1, 5]);
    bx = ax + Math.cos(ang) * len;
    by = ay + Math.sin(ang) * len;
  } else if (r < 0.5 && scene.xy.length > 0) {
    [bx, by] = pick(rng, scene.xy);
  } else {
    bx = coord(rng, 1) + scene.offset;
    by = coord(rng, 1) + scene.offset;
  }
  const form = rng() < 0.3 ? Math.floor(rng() * 3) : scene.form;
  const mixed = rng() < 0.2;
  const a = makePoint(ax, ay, mixed ? Math.floor(rng() * 3) : form);
  const b = makePoint(bx, by, mixed ? Math.floor(rng() * 3) : form);
  const k = rng();
  if (k < 0.5) return { a, b };
  if (k < 0.85) return [a, b] as unknown as SegmentLike;
  return { a, b } as SegmentLike;
}

const N = 150_000;

describe('polygon×segment/ray/infinite-line 교차 판정 — 이전 구현과 반환값 동일성', () => {
  test(`무작위 ${N}건: intersectsPolygonSegment가 이전 구현과 같다`, () => {
    const rng = createRng('polygon-segment-equivalence');
    let mismatch = '';
    for (let i = 0; i < N && mismatch === ''; i++) {
      const scene = makeScene(rng);
      const segment = makeSegment(rng, scene);
      const epsilon = pick(rng, EPSILONS);
      if (
        intersectsPolygonSegment(scene.polygon, segment, epsilon) !==
        referencePolygonSegment(scene.polygon, segment, epsilon)
      ) {
        mismatch = `#${i} epsilon=${String(epsilon)}`;
      }
    }

    expect(mismatch).toBe('');
  });

  test(`무작위 ${N}건: intersectsPolygonRay와 intersectsPolygonInfiniteLine이 이전 구현과 같다`, () => {
    const rng = createRng('polygon-line-family-equivalence');
    let mismatch = '';
    for (let i = 0; i < N && mismatch === ''; i++) {
      const scene = makeScene(rng);
      const [ox, oy] = startPoint(rng, scene);
      const ang = rng() * 2 * Math.PI;
      const dir: [number, number] =
        rng() < 0.1
          ? [0, 0]
          : rng() < 0.3
            ? [pick(rng, [1, -1, 0, 2]), pick(rng, [0, 1, -1])]
            : [Math.cos(ang), Math.sin(ang)];
      const form = Math.floor(rng() * 2);
      const origin = makePoint(ox, oy, form);
      const direction = makePoint(dir[0], dir[1], form);
      const ray: RayLike = { origin, direction } as RayLike;
      const line: InfiniteLineLike = { origin, direction } as InfiniteLineLike;
      const epsilon = pick(rng, EPSILONS);
      if (intersectsPolygonRay(scene.polygon, ray, epsilon) !== referencePolygonRay(scene.polygon, ray, epsilon)) {
        mismatch = `ray #${i} epsilon=${String(epsilon)}`;
      } else if (
        intersectsPolygonInfiniteLine(scene.polygon, line, epsilon) !==
        referencePolygonInfiniteLine(scene.polygon, line, epsilon)
      ) {
        mismatch = `infinite-line #${i} epsilon=${String(epsilon)}`;
      }
    }

    expect(mismatch).toBe('');
  });

  test(`무작위 ${N}건: intersectsCircleSegment와 intersectsSegmentSegment가 이전 구현과 같다`, () => {
    const rng = createRng('circle-segment-segment-equivalence');
    let mismatch = '';
    for (let i = 0; i < N && mismatch === ''; i++) {
      const scene = makeScene(rng);
      const segment = makeSegment(rng, scene);
      const other = makeSegment(rng, scene);
      const [cx, cy] = startPoint(rng, scene);
      const radius =
        rng() < 0.05 ? pick(rng, [0, -1, NaN, Infinity]) : pick(rng, [1e-9, 0.5, 1, 2, 5]) * (rng() < 0.5 ? 1 : rng());
      const form = Math.floor(rng() * 3);
      const center = makePoint(cx, cy, form);
      const circle: CircleLike = rng() < 0.4 ? ([center, radius] as unknown as CircleLike) : { center, radius };
      const epsilon = pick(rng, EPSILONS);
      if (intersectsCircleSegment(circle, segment) !== referenceCircleSegment(circle, segment)) {
        mismatch = `circle #${i}`;
      } else if (
        epsilon !== undefined &&
        intersectsCircleSegment(circle, segment, epsilon) !== referenceCircleSegment(circle, segment, epsilon)
      ) {
        mismatch = `circle #${i} epsilon=${String(epsilon)}`;
      } else if (
        intersectsSegmentSegment(segment, other, epsilon) !== referenceSegmentSegment(segment, other, epsilon)
      ) {
        mismatch = `segment-segment #${i} epsilon=${String(epsilon)}`;
      }
    }

    expect(mismatch).toBe('');
  });

  test('시작점이 경계 epsilon 근처인 polygon: 경계 안쪽·바깥쪽 판정이 이전 구현과 같다', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
    ];
    const away = { x: 0, y: -1 };
    let mismatch = '';
    for (const offset of [0, 1e-12, 5e-10, 1e-9, 1.0000001e-9, 2e-9, 3e-9, 1e-8]) {
      for (const shift of [0, 1e6, 1e9]) {
        const poly = square.map((p) => ({ x: p.x + shift, y: p.y + shift }));
        for (const sign of [1, -1]) {
          const segment = {
            a: { x: 2 + shift, y: shift - sign * offset },
            b: { x: 2 + shift, y: shift - sign * offset + away.y },
          };
          for (const epsilon of [undefined, 1e-9, 2e-9, 1e-12]) {
            if (intersectsPolygonSegment(poly, segment, epsilon) !== referencePolygonSegment(poly, segment, epsilon)) {
              mismatch = `offset=${offset} shift=${shift} sign=${sign} epsilon=${String(epsilon)}`;
            }
          }
        }
      }
    }

    expect(mismatch).toBe('');
  });

  test('segment가 polygon 안에 완전히 들어가면 true이고, 밖에서 멀면 false이다', () => {
    const triangle = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ];

    expect(intersectsPolygonSegment(triangle, { a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })).toBe(true);
    expect(intersectsPolygonSegment(triangle, { a: { x: 20, y: 20 }, b: { x: 30, y: 20 } })).toBe(false);
    expect(
      intersectsPolygonSegment(triangle, [
        [-5, 5],
        [5, 5],
      ])
    ).toBe(true);
  });
});
