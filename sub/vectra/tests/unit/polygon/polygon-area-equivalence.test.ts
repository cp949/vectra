/**
 * polygon.area / signedArea / isClockwise / isCounterClockwise / centroidInto —
 * 전용 reader와 한 번 순회 구현이 이전 구현과 비트 단위로 같은지 고정한다.
 *
 * 검증: 객체·tuple·class instance·{ points } 입력, 점 모양이 섞인 polygon, 점 수 0~40,
 * 정수·실수·큰 값(overflow)·±0·NaN·±Infinity·중복 점·collinear·누락 field 좌표에서
 * 결과가 이전 구현과 `Object.is` 수준으로 같다. centroidInto는 out 미수정 정책도 같다.
 */
import { describe, expect, test } from 'vitest';
import { createRng } from '../../../src/random/create-rng';
import { area } from '../../../src/polygon/area';
import { centroidInto } from '../../../src/polygon/centroid-into';
import { isClockwise } from '../../../src/polygon/is-clockwise';
import { isCounterClockwise } from '../../../src/polygon/is-counter-clockwise';
import { signedArea } from '../../../src/polygon/signed-area';
import { readPolygonPoints, readX, readY, writeXY } from '../_helpers/v1-geometry-reference';
import type { PolygonLike, XYInput, XYWritable } from '../_helpers/v1-geometry-reference';

// 이전 구현. 공유 readX/readY와 `(i + 1) % n` 순회를 그대로 쓴다. 새 구현의 비교 기준으로만 쓴다.

function referenceShoelace2x(points: readonly XYInput[]): number {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += readX(points[i]) * readY(points[j]) - readX(points[j]) * readY(points[i]);
  }
  return sum;
}

function referenceArea(polygon: PolygonLike): number {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return 0;
  return Math.abs(referenceShoelace2x(pts)) / 2;
}

function referenceSignedArea(polygon: PolygonLike): number {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return 0;
  return referenceShoelace2x(pts) / 2;
}

function referenceIsClockwise(polygon: PolygonLike): boolean {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return false;
  return referenceShoelace2x(pts) < 0;
}

function referenceIsCounterClockwise(polygon: PolygonLike): boolean {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return false;
  return referenceShoelace2x(pts) > 0;
}

function referenceCentroidInto(out: XYWritable, polygon: PolygonLike): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;

  if (n === 0) return false;

  if (n === 1) {
    writeXY(out, readX(pts[0]), readY(pts[0]));
    return true;
  }

  if (n === 2) {
    writeXY(out, (readX(pts[0]) + readX(pts[1])) / 2, (readY(pts[0]) + readY(pts[1])) / 2);
    return true;
  }

  const twoA = referenceShoelace2x(pts);

  if (twoA === 0) {
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < n; i++) {
      sumX += readX(pts[i]);
      sumY += readY(pts[i]);
    }
    writeXY(out, sumX / n, sumY / n);
    return true;
  }

  let cx = 0;
  let cy = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = readX(pts[i]);
    const yi = readY(pts[i]);
    const xj = readX(pts[j]);
    const yj = readY(pts[j]);
    const cross = xi * yj - xj * yi;
    cx += (xi + xj) * cross;
    cy += (yi + yj) * cross;
  }

  writeXY(out, cx / (3 * twoA), cy / (3 * twoA));
  return true;
}

class Point2 {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}
}

type Rng = () => number;

const SPECIAL = [0, -0, 1, -1, 0.5, 1e-300, 1e150, -1e150, 1e308, -1e308, Number.MAX_VALUE, NaN, Infinity, -Infinity];

/** 좌표 한 값을 만든다. 일부는 특수값이다. */
function coord(rng: Rng, kind: number): number {
  const r = rng();
  if (r < 0.06) return SPECIAL[Math.floor(rng() * SPECIAL.length)];
  if (kind === 0) return Math.floor(rng() * 21) - 10;
  if (kind === 1) return (rng() - 0.5) * 200;
  if (kind === 2) return (rng() - 0.5) * 2e154;
  return 1e6 + rng() * 1e-3;
}

/** 점 하나를 `form` 모양으로 만든다. 0=객체 1=tuple 2=class 3=누락 field 객체. */
function makePoint(x: number, y: number, form: number): XYInput {
  if (form === 0) return { x, y };
  if (form === 1) return [x, y];
  if (form === 2) return new Point2(x, y);
  return { x } as unknown as XYInput;
}

function makePolygon(rng: Rng): PolygonLike {
  const kind = Math.floor(rng() * 4);
  const shape = rng();
  // 점 수는 0~40. 1, 2, 3개 경계를 자주 만든다.
  const n = shape < 0.4 ? Math.floor(rng() * 5) : Math.floor(rng() * 41);
  const mode = rng();
  const baseForm = Math.floor(rng() * 3);
  const xy: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    if (mode < 0.1 && i > 0) xy.push(xy[i - 1]); // 중복 점
    else if (mode < 0.2) xy.push([i, 2 * i + 1]); // collinear
    else if (mode < 0.3) xy.push([i % 2, 0]); // 면적 0
    else xy.push([coord(rng, kind), coord(rng, kind)]);
  }
  const pts = xy.map(([x, y]) => {
    // 점마다 모양을 섞는 polygon을 일부 만든다. 누락 field는 드물게 쓴다.
    if (rng() < 0.3) return makePoint(x, y, Math.floor(rng() * 3));
    if (rng() < 0.01) return makePoint(x, y, 3);
    return makePoint(x, y, baseForm);
  });
  return rng() < 0.3 ? { points: pts } : pts;
}

const SENTINEL = -12345.5;

function sentinelOut(tuple: boolean): XYWritable {
  return tuple ? ([SENTINEL, SENTINEL] as [number, number]) : { x: SENTINEL, y: SENTINEL };
}

function outXY(out: XYWritable): [number, number] {
  return Array.isArray(out) ? [out[0], out[1]] : [(out as { x: number }).x, (out as { y: number }).y];
}

describe('polygon area 계열 — 이전 구현과 출력 동일성', () => {
  test('무작위 polygon 30만 개: area, signedArea, isClockwise, isCounterClockwise가 이전 구현과 비트 단위로 같다', () => {
    const rng = createRng('polygon-area-equivalence');
    let mismatch = '';
    for (let i = 0; i < 300_000 && mismatch === ''; i++) {
      const legacy = makePolygon(rng);
      const polygon = readPolygonPoints(legacy).flatMap((point) => [readX(point), readY(point)]);
      if (!Object.is(area(polygon), referenceArea(legacy))) mismatch = `area #${i}`;
      else if (!Object.is(signedArea(polygon), referenceSignedArea(legacy))) mismatch = `signedArea #${i}`;
      else if (isClockwise(polygon) !== referenceIsClockwise(legacy)) mismatch = `isClockwise #${i}`;
      else if (isCounterClockwise(polygon) !== referenceIsCounterClockwise(legacy)) mismatch = `isCCW #${i}`;
    }

    expect(mismatch).toBe('');
  });

  test('무작위 polygon 30만 개: centroidInto의 반환값과 out 좌표가 이전 구현과 비트 단위로 같다', () => {
    const rng = createRng('polygon-centroid-equivalence');
    let mismatch = '';
    for (let i = 0; i < 300_000 && mismatch === ''; i++) {
      const legacy = makePolygon(rng);
      const polygon = readPolygonPoints(legacy).flatMap((point) => [readX(point), readY(point)]);
      const tuple = rng() < 0.5;
      const actual = { x: SENTINEL, y: SENTINEL };
      const expected = sentinelOut(tuple);
      const okActual = centroidInto(actual, polygon);
      const okExpected = referenceCentroidInto(expected, legacy);
      const [ax, ay] = outXY(actual);
      const [ex, ey] = outXY(expected);
      if (okActual !== okExpected || !Object.is(ax, ex) || !Object.is(ay, ey)) mismatch = `centroidInto #${i}`;
    }

    expect(mismatch).toBe('');
  });
});
