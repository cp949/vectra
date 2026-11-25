/**
 * sampleFixedCountInto / sampleFixedCount — 누적 길이 한 번 계산과 앞으로만 움직이는 segment 탐색 구현이
 * 이전 구현과 비트 단위로 같은지 고정한다.
 *
 * 검증: 객체·tuple·class instance·누락 field 점이 섞인 polyline, 점 수 0~40, 중복 점·길이 0 구간·
 * 정수·실수·큰 값(overflow)·±0·NaN·±Infinity 좌표, count 1~500에서 결과 point 목록이
 * 이전 구현과 `Object.is` 수준으로 같다. RangeError 조건과 outPoints aliasing 정책도 같다.
 */
import { describe, expect, test } from 'vitest';
import { polylineSampleAtLengthInto, polylineTotalLength, readPolylinePoints } from '../../../src/internal/polyline';
import { readX, readY } from '../../../src/internal/xy';
import { sampleFixedCount } from '../../../src/polyline/sample-fixed-count';
import { sampleFixedCountInto } from '../../../src/polyline/sample-fixed-count-into';
import { createRng } from '../../../src/random/create-rng';
import type { PolylineLike, XYInput, XYObjectWritable } from '../../../src/types';

// 이전 구현. 점 snapshot을 만들고 샘플마다 polyline을 처음부터 순회한다. 새 구현의 비교 기준으로만 쓴다.
function referenceSampleFixedCountInto(
  outPoints: XYObjectWritable[],
  polyline: PolylineLike,
  count: number
): XYObjectWritable[] {
  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError('count must be a positive integer');
  }

  const pts = readPolylinePoints(polyline);
  const n = pts.length;
  if (n < 2) {
    outPoints.length = 0;
    return outPoints;
  }

  const snapshot: XYObjectWritable[] = new Array(n);
  for (let i = 0; i < n; i++) {
    snapshot[i] = { x: readX(pts[i]), y: readY(pts[i]) };
  }

  const totalLen = polylineTotalLength(snapshot);
  const x0 = snapshot[0].x;
  const y0 = snapshot[0].y;

  outPoints.length = 0;

  if (count === 1) {
    outPoints.push({ x: x0, y: y0 });
    return outPoints;
  }

  if (totalLen === 0) {
    for (let i = 0; i < count; i++) {
      outPoints.push({ x: x0, y: y0 });
    }
    return outPoints;
  }

  const tmp = { x: 0, y: 0 };
  for (let i = 0; i < count; i++) {
    const target = (i / (count - 1)) * totalLen;
    polylineSampleAtLengthInto(tmp, snapshot, target);
    outPoints.push({ x: tmp.x, y: tmp.y });
  }

  return outPoints;
}

class Point2 {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}
}

type Rng = () => number;

const SPECIAL = [0, -0, 1, -1, 0.5, 1e-300, 1e150, -1e150, 1e308, -1e308, Number.MAX_VALUE, NaN, Infinity, -Infinity];

/** 좌표 한 값을 만든다. 일부는 특수값이다. `special`이 0이면 특수값을 만들지 않는다. */
function coord(rng: Rng, kind: number, special: number): number {
  const r = rng();
  if (r < special) return SPECIAL[Math.floor(rng() * SPECIAL.length)];
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

function makePolyline(rng: Rng): PolylineLike {
  const kind = Math.floor(rng() * 4);
  // 특수값 비율. 절반은 유한 좌표만 만들어 정상 경로를 충분히 본다.
  const special = rng() < 0.5 ? 0 : 0.06;
  const shape = rng();
  // 점 수는 0~40. 0, 1, 2, 3개 경계를 자주 만든다.
  const n = shape < 0.4 ? Math.floor(rng() * 5) : Math.floor(rng() * 41);
  const mode = rng();
  const baseForm = Math.floor(rng() * 3);
  const xy: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    if (mode < 0.15 && i > 0) xy.push(xy[i - 1]); // 중복 점, 길이 0 구간
    else if (mode < 0.25) xy.push([i, 2 * i + 1]); // collinear
    else if (mode < 0.3) xy.push([i % 2, 0]); // 왕복
    else if (mode < 0.35) xy.push([3, 4]); // 모든 점이 같다
    else xy.push([coord(rng, kind, special), coord(rng, kind, special)]);
  }
  // 닫힌 polyline: 마지막 점을 첫 점으로 되풀이한다.
  if (rng() < 0.2 && xy.length > 1) xy.push(xy[0]);
  const pts = xy.map(([x, y]) => {
    // 점마다 모양을 섞는 polyline을 일부 만든다. 누락 field는 드물게 쓴다.
    if (rng() < 0.3) return makePoint(x, y, Math.floor(rng() * 3));
    if (rng() < 0.01) return makePoint(x, y, 3);
    return makePoint(x, y, baseForm);
  });
  return rng() < 0.3 ? { points: pts } : pts;
}

function makeCount(rng: Rng): number {
  const r = rng();
  if (r < 0.3) return 1 + Math.floor(rng() * 3);
  if (r < 0.97) return 1 + Math.floor(rng() * 60);
  return 1 + Math.floor(rng() * 500);
}

function same(a: readonly XYObjectWritable[], b: readonly XYObjectWritable[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i].x, b[i].x) || !Object.is(a[i].y, b[i].y)) return false;
  }
  return true;
}

describe('sampleFixedCount — 이전 구현과 출력 동일성', () => {
  test('무작위 polyline 6만 개: sampleFixedCountInto 결과가 이전 구현과 비트 단위로 같다', () => {
    const rng = createRng('sample-fixed-count-equivalence');
    let mismatch = '';
    for (let i = 0; i < 60_000 && mismatch === ''; i++) {
      const polyline = makePolyline(rng);
      const count = makeCount(rng);
      const actual = sampleFixedCountInto([{ x: 9, y: 9 }], polyline, count);
      const expected = referenceSampleFixedCountInto([{ x: 9, y: 9 }], polyline, count);
      if (!same(actual, expected)) mismatch = `#${i} count=${count}`;
    }

    expect(mismatch).toBe('');
  });

  test('무작위 polyline 1.5만 개: sampleFixedCount가 새 배열에 이전 구현과 같은 결과를 반환한다', () => {
    const rng = createRng('sample-fixed-count-fresh');
    let mismatch = '';
    for (let i = 0; i < 15_000 && mismatch === ''; i++) {
      const polyline = makePolyline(rng);
      const count = makeCount(rng);
      if (!same(sampleFixedCount(polyline, count), referenceSampleFixedCountInto([], polyline, count))) {
        mismatch = `#${i} count=${count}`;
      }
    }

    expect(mismatch).toBe('');
  });

  test('count가 양의 정수가 아니면 이전 구현처럼 RangeError를 던지고 outPoints를 건드리지 않는다', () => {
    const polyline: PolylineLike = [
      [0, 0],
      [1, 1],
    ];
    for (const count of [0, -1, 1.5, NaN, Infinity, -Infinity]) {
      const out: XYObjectWritable[] = [{ x: 7, y: 7 }];

      expect(() => sampleFixedCountInto(out, polyline, count)).toThrow(RangeError);
      expect(() => referenceSampleFixedCountInto([], polyline, count)).toThrow(RangeError);
      expect(out).toEqual([{ x: 7, y: 7 }]);
    }
  });

  test('outPoints가 polyline point 배열과 같아도 이전 구현과 같은 결과를 낸다', () => {
    const rng = createRng('sample-fixed-count-alias');
    let mismatch = '';
    for (let i = 0; i < 6_000 && mismatch === ''; i++) {
      const polyline = makePolyline(rng);
      const points = readPolylinePoints(polyline);
      const count = makeCount(rng);
      const expected = referenceSampleFixedCountInto([], polyline, count);
      // polyline 점 배열 자체를 outPoints로 넘긴다. 배열 모양 polyline과 { points } 모양 모두 만든다.
      const target = points.slice() as unknown as XYObjectWritable[];
      const aliased: PolylineLike = Array.isArray(polyline) ? target : { points: target };
      const result = sampleFixedCountInto(target, aliased, count);
      if (result !== target || !same(result, expected)) mismatch = `#${i} count=${count}`;
    }

    expect(mismatch).toBe('');
  });

  test('field를 가진 tuple은 이전 구현처럼 tuple로 읽는다', () => {
    const tuple = Object.assign([4, 0] as [number, number], { x: 100, y: 200 });
    const polyline: PolylineLike = [[0, 0], tuple];

    expect(sampleFixedCount(polyline, 3)).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ]);
  });

  test('고정 입력: 끝점 포함 균등 간격 샘플을 반환한다', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    expect(sampleFixedCount(polyline, 5)).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 10, y: 10 },
    ]);
  });
});
