/**
 * 점 목록 변환과 출력 버퍼, 별칭, 비유한 좌표 처리를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { transformPoints } from '../../../src/matrix/transform-points';
import { transformPointsInto } from '../../../src/matrix/transform-points-into';
import type { Matrix, Point, PointWritable } from '../../../src/types/flat-shapes.internal';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** 시험용 점을 만든다. */
function makePt(): { x: number; y: number } {
  return { x: 0, y: 0 };
}

/** 기존 점을 담은 출력 배열을 만든다. */
function makeBuffer(n: number): { x: number; y: number }[] {
  const buf: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i += 1) buf.push(makePt());
  return buf;
}

const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

// ─── transformPointsInto ─────────────────────────────────────────────────────

describe('transformPointsInto - 기본 변환', () => {
  test('identity matrix는 모든 point를 그대로 기록한다', () => {
    const points: Point[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ];
    const out = makeBuffer(points.length);
    const result = transformPointsInto(out, identity, points);
    expect(result).toBe(out);
    expect(out[0]).toEqual({ x: 1, y: 2 });
    expect(out[1]).toEqual({ x: 3, y: 4 });
    expect(out[2]).toEqual({ x: 5, y: 6 });
  });

  test('translation matrix가 모든 point에 tx/ty를 더한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const points: Point[] = [
      { x: 1, y: 2 },
      { x: -3, y: -4 },
    ];
    const out = makeBuffer(2);
    transformPointsInto(out, m, points);
    expect(out[0]).toEqual({ x: 11, y: 22 });
    expect(out[1]).toEqual({ x: 7, y: 16 });
  });

  test('scale matrix가 모든 point를 변환한다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    const points: Point[] = [
      { x: 1, y: 1 },
      { x: 4, y: 5 },
    ];
    const out = makeBuffer(2);
    transformPointsInto(out, m, points);
    expect(out[0]).toEqual({ x: 2, y: 3 });
    expect(out[1]).toEqual({ x: 8, y: 15 });
  });

  test('rotation matrix(π/2)가 모든 point를 변환한다', () => {
    // R(π/2): a=0, b=1, c=-1, d=0
    const m: Matrix = { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 };
    const points: Point[] = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    const out = makeBuffer(2);
    transformPointsInto(out, m, points);
    expect(out[0].x).toBeCloseTo(0, 12);
    expect(out[0].y).toBeCloseTo(1, 12);
    expect(out[1].x).toBeCloseTo(-1, 12);
    expect(out[1].y).toBeCloseTo(0, 12);
  });
});

describe('transformPointsInto - aliasing', () => {
  test('out[i] === points[i] self-aliasing이 안전하다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: 2 };
    const p0 = { x: 4, y: 5 };
    const p1 = { x: 6, y: 7 };
    const points = [p0, p1];
    const out = [p0, p1];
    transformPointsInto(out, m, points);
    // p0: (2*4+1, 3*5+2) = (9, 17)
    // p1: (2*6+1, 3*7+2) = (13, 23)
    expect(p0).toEqual({ x: 9, y: 17 });
    expect(p1).toEqual({ x: 13, y: 23 });
  });

  test('out === points 같은 array self-aliasing이 안전하다', () => {
    const m: Matrix = { a: 2, b: 1, c: 3, d: 4, tx: 5, ty: 6 };
    const buffer = [
      { x: 1, y: 1 },
      { x: 2, y: 3 },
    ];
    // out과 points를 같은 array로 전달
    transformPointsInto(buffer, m, buffer);
    // (1,1): (2*1+3*1+5, 1*1+4*1+6) = (10, 11)
    // (2,3): (2*2+3*3+5, 1*2+4*3+6) = (18, 20)
    expect(buffer[0]).toEqual({ x: 10, y: 11 });
    expect(buffer[1]).toEqual({ x: 18, y: 20 });
  });
});

describe('transformPointsInto - empty / 초과 / 부족 buffer', () => {
  test('empty input은 empty output 그대로 반환한다', () => {
    const out: PointWritable[] = [];
    const result = transformPointsInto(out, identity, []);
    expect(result).toBe(out);
    expect(out.length).toBe(0);
  });

  test('extra output slot은 수정하지 않는다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const extra = { x: 999, y: 888 };
    const out = [makePt(), extra];
    transformPointsInto(out, m, [{ x: 1, y: 2 }]);
    expect(out[0]).toEqual({ x: 11, y: 22 });
    // 초과 slot은 그대로 유지
    expect(out[1]).toBe(extra);
    expect(out[1]).toEqual({ x: 999, y: 888 });
  });

  test('out.length < points.length이면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const sentinel0 = { x: 999, y: 888 };
    const sentinel1 = { x: 777, y: 666 };
    const out = [sentinel0, sentinel1];
    expect(() =>
      transformPointsInto(out, identity, [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
      ])
    ).toThrow(RangeError);
    // 부분 기록 없음
    expect(out[0]).toEqual({ x: 999, y: 888 });
    expect(out[1]).toEqual({ x: 777, y: 666 });
  });
});

describe('transformPointsInto - non-finite pass-through', () => {
  test('NaN matrix component는 pass through한다', () => {
    const m: Matrix = { a: Number.NaN, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const out = makeBuffer(1);
    transformPointsInto(out, m, [{ x: 1, y: 2 }]);
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(out[0].y).toBe(2);
  });

  test('Infinity matrix component는 pass through한다', () => {
    const m: Matrix = { a: Number.POSITIVE_INFINITY, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const out = makeBuffer(1);
    transformPointsInto(out, m, [{ x: 1, y: 2 }]);
    expect(out[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(out[0].y).toBe(2);
  });

  test('-Infinity matrix component는 pass through한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: Number.NEGATIVE_INFINITY, ty: 0 };
    const out = makeBuffer(1);
    transformPointsInto(out, m, [{ x: 1, y: 2 }]);
    expect(out[0].x).toBe(Number.NEGATIVE_INFINITY);
    expect(out[0].y).toBe(2);
  });

  test('NaN point component는 pass through한다 (0*NaN=NaN으로 cross 성분도 NaN)', () => {
    const out = makeBuffer(1);
    // identity matrix에서도 0*NaN=NaN으로 y도 NaN이 된다 (JS 산술 결과 그대로)
    transformPointsInto(out, identity, [{ x: Number.NaN, y: 1 }]);
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(Number.isNaN(out[0].y)).toBe(true);
  });

  test('Infinity / -Infinity point component는 pass through한다 (0*Inf=NaN으로 cross 성분도 NaN)', () => {
    const out = makeBuffer(2);
    // identity matrix에서도 0*Infinity=NaN으로 cross 성분이 NaN이 된다
    transformPointsInto(out, identity, [
      { x: Number.POSITIVE_INFINITY, y: 0 },
      { x: 0, y: Number.NEGATIVE_INFINITY },
    ]);
    expect(out[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out[0].y)).toBe(true);
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(out[1].y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('pure-translation matrix에서 Infinity point는 finite component를 보존한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out = makeBuffer(2);
    // tx/ty는 + 연산만 받으므로 cross-product NaN이 생기지 않는다
    transformPointsInto(out, m, [
      { x: 1, y: Number.POSITIVE_INFINITY },
      { x: 2, y: Number.NEGATIVE_INFINITY },
    ]);
    // (1, +Inf): x' = 1*1 + 0*Inf + 10. 0*Inf=NaN → x'=NaN. y' = 0*1 + 1*Inf + 20 = Inf
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(out[0].y).toBe(Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(out[1].y).toBe(Number.NEGATIVE_INFINITY);
  });
});

// ─── transformPoints companion ───────────────────────────────────────────────

describe('transformPoints - companion', () => {
  test('plain point array를 새로 만들어 반환한다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: 2 };
    const points: Point[] = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const result = transformPoints(m, points);
    expect(result).toEqual([
      { x: 3, y: 5 },
      { x: 5, y: 8 },
    ]);
    // 결과는 input과 다른 array다
    expect(result).not.toBe(points);
    expect(result[0]).not.toBe(points[0]);
    expect(result[1]).not.toBe(points[1]);
    expect(points).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
  });

  test('empty input은 empty array를 반환한다', () => {
    const result = transformPoints(identity, []);
    expect(result).toEqual([]);
  });
});
