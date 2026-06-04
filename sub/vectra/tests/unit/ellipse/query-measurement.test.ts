import { describe, expect, test } from 'vitest';
import { area } from '../../../src/ellipse/area';
import { circumference } from '../../../src/ellipse/circumference';
import { containsPoint } from '../../../src/ellipse/contains-point';
import { equals } from '../../../src/ellipse/equals';
import { isEmpty } from '../../../src/ellipse/is-empty';
import { nearEquals } from '../../../src/ellipse/near-equals';

// ─── isEmpty ─────────────────────────────────────────────────────────────────

describe('ellipse query - isEmpty', () => {
  test('radiusX = 0이면 true를 반환한다', () => {
    expect(isEmpty({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 5 })).toBe(true);
  });

  test('radiusY = 0이면 true를 반환한다', () => {
    expect(isEmpty({ center: { x: 0, y: 0 }, radiusX: 5, radiusY: 0 })).toBe(true);
  });

  test('radiusX < 0이면 true를 반환한다', () => {
    expect(isEmpty({ center: { x: 0, y: 0 }, radiusX: -1, radiusY: 5 })).toBe(true);
  });

  test('radiusY < 0이면 true를 반환한다', () => {
    expect(isEmpty({ center: { x: 0, y: 0 }, radiusX: 5, radiusY: -1 })).toBe(true);
  });

  test('radiusX > 0이고 radiusY > 0이면 false를 반환한다', () => {
    expect(isEmpty({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 })).toBe(false);
  });

  test('object input을 처리한다', () => {
    expect(isEmpty({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 })).toBe(false);
  });

  test('tuple input을 처리한다', () => {
    expect(isEmpty([[1, 2], 3, 4] as const)).toBe(false);
    expect(isEmpty([[1, 2], 0, 4] as const)).toBe(true);
  });
});

// ─── area ────────────────────────────────────────────────────────────────────

describe('ellipse measurement - area', () => {
  test('원(r=5)의 넓이는 Math.PI * 25와 같다', () => {
    expect(area({ center: { x: 0, y: 0 }, radiusX: 5, radiusY: 5 })).toBe(Math.PI * 25);
  });

  test('비균일 ellipse(rx=3, ry=4)의 넓이는 Math.PI * 12와 같다', () => {
    expect(area({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 })).toBe(Math.PI * 12);
  });

  test('empty ellipse(rx=0, ry=5)는 0을 반환한다', () => {
    expect(area({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 5 })).toBe(0);
  });

  test('empty ellipse(rx=3, ry=-1)는 0을 반환한다', () => {
    expect(area({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: -1 })).toBe(0);
  });
});

// ─── circumference ───────────────────────────────────────────────────────────

describe('ellipse measurement - circumference', () => {
  test('원(r=5)의 둘레는 2*π*5와 tolerance 1e-6 이내이다', () => {
    const result = circumference({ center: { x: 0, y: 0 }, radiusX: 5, radiusY: 5 });
    expect(Math.abs(result - 2 * Math.PI * 5)).toBeLessThan(1e-6);
  });

  test('비균일 ellipse(rx=3, ry=4)의 둘레는 미리 계산한 값과 tolerance 1e-9 이내이다', () => {
    // h = ((3-4)/(3+4))² = 1/49 ≈ 0.020408...
    // circumference ≈ 22.103492160...
    const h = ((3 - 4) / (3 + 4)) ** 2;
    const expected = Math.PI * 7 * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
    const result = circumference({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 });
    expect(Math.abs(result - expected)).toBeLessThan(1e-9);
  });

  test('empty ellipse(rx=0, ry=5)는 0을 반환한다', () => {
    expect(circumference({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 5 })).toBe(0);
  });

  test('empty ellipse(rx=3, ry=-1)는 0을 반환한다', () => {
    expect(circumference({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: -1 })).toBe(0);
  });
});

// ─── equals ──────────────────────────────────────────────────────────────────

describe('ellipse query - equals', () => {
  test('동일한 center와 radii를 가진 ellipse는 true를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const b = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    expect(equals(a, b)).toBe(true);
  });

  test('center x가 다르면 false를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const b = { center: { x: 2, y: 2 }, radiusX: 3, radiusY: 4 };
    expect(equals(a, b)).toBe(false);
  });

  test('center y가 다르면 false를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const b = { center: { x: 1, y: 9 }, radiusX: 3, radiusY: 4 };
    expect(equals(a, b)).toBe(false);
  });

  test('radiusX가 다르면 false를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const b = { center: { x: 1, y: 2 }, radiusX: 5, radiusY: 4 };
    expect(equals(a, b)).toBe(false);
  });

  test('radiusY가 다르면 false를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const b = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 9 };
    expect(equals(a, b)).toBe(false);
  });

  test('object vs tuple input 조합을 처리한다', () => {
    const obj = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const tup = [[1, 2], 3, 4] as const;
    expect(equals(obj, tup)).toBe(true);
  });

  test('tuple vs object input 조합을 처리한다', () => {
    const tup = [{ x: 1, y: 2 }, 3, 4] as const;
    const obj = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    expect(equals(tup, obj)).toBe(true);
  });
});

// ─── nearEquals ──────────────────────────────────────────────────────────────

describe('ellipse query - nearEquals', () => {
  test('정확히 같은 값이면 true를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    expect(nearEquals(a, a)).toBe(true);
  });

  test('epsilon 이내 차이면 true를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const b = { center: { x: 1 + 1e-11, y: 2 }, radiusX: 3, radiusY: 4 };
    expect(nearEquals(a, b)).toBe(true);
  });

  test('epsilon 초과면 false를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const b = { center: { x: 1 + 1e-9, y: 2 }, radiusX: 3, radiusY: 4 };
    expect(nearEquals(a, b)).toBe(false);
  });

  test('음수 epsilon이면 항상 false를 반환한다', () => {
    const a = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    expect(nearEquals(a, a, -1)).toBe(false);
  });

  test('기본 epsilon(1e-10) 동작: 1e-11 차이는 true이다', () => {
    // float64에서 1 + 1e-10은 실제 차이가 ~1.0e-10을 초과하므로 1e-11을 사용한다
    const a = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 };
    const b = { center: { x: 0, y: 0 }, radiusX: 1 + 1e-11, radiusY: 1 };
    expect(nearEquals(a, b)).toBe(true);
  });

  test('기본 epsilon(1e-10) 동작: 2e-10 초과 차이는 false이다', () => {
    const a = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 };
    const b = { center: { x: 0, y: 0 }, radiusX: 1 + 2e-10, radiusY: 1 };
    expect(nearEquals(a, b)).toBe(false);
  });

  test('명시적 epsilon으로 tuple input을 처리한다', () => {
    const a = [[0, 0], 3, 4] as const;
    const b = [[0, 0], 3.001, 4] as const;
    expect(nearEquals(a, b, 0.01)).toBe(true);
    expect(nearEquals(a, b, 0.0001)).toBe(false);
  });
});

// ─── containsPoint ───────────────────────────────────────────────────────────

describe('ellipse query - containsPoint', () => {
  test('중심점은 포함된다', () => {
    expect(containsPoint({ center: { x: 3, y: 4 }, radiusX: 5, radiusY: 2 }, { x: 3, y: 4 })).toBe(true);
  });

  test('boundary point는 포함된다 (closed boundary)', () => {
    // x축 끝점: (cx+rx, cy)
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 3, y: 0 })).toBe(true);
    // y축 끝점: (cx, cy+ry)
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 0, y: 2 })).toBe(true);
  });

  test('내부 point는 포함된다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 4, radiusY: 3 }, { x: 2, y: 1 })).toBe(true);
  });

  test('외부 point는 포함되지 않는다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 4, y: 0 })).toBe(false);
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { x: 0, y: 3 })).toBe(false);
  });

  test('empty ellipse (radiusX=0)이면 항상 false를 반환한다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 }, { x: 0, y: 0 })).toBe(false);
  });

  test('empty ellipse (radiusY<=0)이면 항상 false를 반환한다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: -1 }, { x: 0, y: 0 })).toBe(false);
  });

  test('offset center를 가진 ellipse에서 내부/외부를 판별한다', () => {
    const e = { center: { x: 5, y: 3 }, radiusX: 4, radiusY: 2 };
    expect(containsPoint(e, { x: 6, y: 4 })).toBe(true);
    expect(containsPoint(e, { x: 10, y: 3 })).toBe(false);
  });

  test('tuple center point input을 처리한다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, [1, 1])).toBe(true);
    expect(containsPoint({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, [4, 0])).toBe(false);
  });

  test('tuple EllipseLike input을 처리한다', () => {
    expect(containsPoint([[0, 0], 3, 2] as const, { x: 1, y: 1 })).toBe(true);
    expect(containsPoint([[0, 0], 3, 2] as const, { x: 4, y: 0 })).toBe(false);
  });
});
