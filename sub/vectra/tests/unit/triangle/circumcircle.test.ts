/**
 * triangle circumscribed circle 단위 테스트.
 *
 * circumcenter / circumcenterInto / circumcircle / circumcircleInto의
 * 정확도, degenerate 처리, output 계약을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { circumcenter } from '../../../src/triangle/circumcenter';
import { circumcenterInto } from '../../../src/triangle/circumcenter-into';
import { circumcircle } from '../../../src/triangle/circumcircle';
import { circumcircleInto } from '../../../src/triangle/circumcircle-into';

/** 변이 1인 정삼각형 */
const equilateral = { x1: 0, y1: 0, x2: 1, y2: 0, x3: 0.5, y3: Math.sqrt(3) / 2 };

/** collinear(degenerate) triangle */
const collinear = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };

describe('circumcenterInto', () => {
  test('직각삼각형의 외심은 빗변 중점이다', () => {
    // a(0,0) b(4,0) c(0,4): 외심 = (2, 2)
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
    const out = { x: 0, y: 0 };
    const result = circumcenterInto(out, t);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('정삼각형의 외심은 centroid와 같다', () => {
    const out = { x: 0, y: 0 };
    const result = circumcenterInto(out, equilateral);
    expect(result).not.toBe(false);
    if (result !== false) {
      // centroid of equilateral
      expect(result.x).toBeCloseTo((0 + 1 + 0.5) / 3, 8);
      expect(result.y).toBeCloseTo((0 + 0 + Math.sqrt(3) / 2) / 3, 8);
    }
  });

  test('degenerate(collinear) triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const result = circumcenterInto(out, collinear);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('non-finite vertex: false를 반환하고 out을 수정하지 않는다', () => {
    const t = { x1: Infinity, y1: 0, x2: 0, y2: 1, x3: 1, y3: 0 };
    const out = { x: 99, y: 99 };
    expect(circumcenterInto(out, t)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('외심은 세 vertex에서 등거리다', () => {
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 1, y3: 3 };
    const out = { x: 0, y: 0 };
    const result = circumcenterInto(out, t);
    expect(result).not.toBe(false);
    if (result !== false) {
      const da = Math.sqrt((result.x - 0) ** 2 + (result.y - 0) ** 2);
      const db = Math.sqrt((result.x - 4) ** 2 + (result.y - 0) ** 2);
      const dc = Math.sqrt((result.x - 1) ** 2 + (result.y - 3) ** 2);
      expect(da).toBeCloseTo(db, 10);
      expect(db).toBeCloseTo(dc, 10);
    }
  });
});

describe('circumcenter', () => {
  test('직각삼각형: 빗변 중점을 반환한다', () => {
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
    const result = circumcenter(t);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(2, 10);
    expect(result?.y).toBeCloseTo(2, 10);
  });

  test('degenerate triangle: undefined를 반환한다', () => {
    expect(circumcenter(collinear)).toBeUndefined();
  });

  test('plain object { x, y }를 반환한다', () => {
    const t = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 0, y3: 2 };
    const result = circumcenter(t);
    expect(result).toEqual({ x: 1, y: 1 });
  });
});

describe('circumcircleInto', () => {
  test('직각삼각형: 외접원 중심이 빗변 중점이고 반지름이 빗변 절반이다', () => {
    // a(0,0) b(4,0) c(0,4): 빗변 BC=4√2, 외접원 반지름 = 2√2
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
    const out = { cx: 0, cy: 0, r: 0 };
    const result = circumcircleInto(out, t);
    expect(result).toBe(out);
    expect(out.cx).toBeCloseTo(2, 10);
    expect(out.cy).toBeCloseTo(2, 10);
    expect(out.r).toBeCloseTo(2 * Math.sqrt(2), 10);
  });

  test('degenerate triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { cx: 99, cy: 99, r: 99 };
    const result = circumcircleInto(out, collinear);
    expect(result).toBe(false);
    expect(out.cx).toBe(99);
    expect(out.r).toBe(99);
  });

  test('외접원의 반지름은 세 vertex에서 외심까지의 거리와 같다', () => {
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 1, y3: 3 };
    const out = { cx: 0, cy: 0, r: 0 };
    circumcircleInto(out, t);
    const da = Math.sqrt((out.cx - 0) ** 2 + (out.cy - 0) ** 2);
    const db = Math.sqrt((out.cx - 4) ** 2 + (out.cy - 0) ** 2);
    expect(da).toBeCloseTo(out.r, 10);
    expect(db).toBeCloseTo(out.r, 10);
  });
});

describe('circumcircle', () => {
  test('직각삼각형: 외접원을 반환한다', () => {
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
    const result = circumcircle(t);
    expect(result).not.toBeUndefined();
    expect(result?.cx).toBeCloseTo(2, 10);
    expect(result?.r).toBeCloseTo(2 * Math.sqrt(2), 10);
  });

  test('degenerate triangle: undefined를 반환한다', () => {
    expect(circumcircle(collinear)).toBeUndefined();
  });
});
