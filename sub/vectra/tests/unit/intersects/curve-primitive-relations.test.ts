/**
 * quadratic/cubic Bezier segment × closed primitive boolean relation 단위 테스트.
 *
 * 대상 함수:
 *  - intersectsQuadraticCircle / intersectsQuadraticEllipse / intersectsQuadraticRect
 *    / intersectsQuadraticBounds / intersectsQuadraticTriangle
 *  - intersectsCubicCircle / intersectsCubicEllipse / intersectsCubicRect
 *    / intersectsCubicBounds / intersectsCubicTriangle
 *
 * boundary tangent, two-point/S-curve crossing, endpoint 내부 포함, 완전 외부, primitive
 * containment-only, empty/degenerate primitive, zero-extent bounds, non-finite(NaN/±Infinity) 입력을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsCubicBounds } from '../../../src/intersects/intersects-cubic-bounds';
import { intersectsCubicCircle } from '../../../src/intersects/intersects-cubic-circle';
import { intersectsCubicEllipse } from '../../../src/intersects/intersects-cubic-ellipse';
import { intersectsCubicRect } from '../../../src/intersects/intersects-cubic-rect';
import { intersectsCubicTriangle } from '../../../src/intersects/intersects-cubic-triangle';
import { intersectsQuadraticBounds } from '../../../src/intersects/intersects-quadratic-bounds';
import { intersectsQuadraticCircle } from '../../../src/intersects/intersects-quadratic-circle';
import { intersectsQuadraticEllipse } from '../../../src/intersects/intersects-quadratic-ellipse';
import { intersectsQuadraticRect } from '../../../src/intersects/intersects-quadratic-rect';
import { intersectsQuadraticTriangle } from '../../../src/intersects/intersects-quadratic-triangle';

// quadratic arc: 양 끝 (-2,-2),(2,-2), t=0.5에서 peak (0,0)을 지난다.
const quadratic = { kind: 'quadratic', x0: -2, y0: -2, x1: 0, y1: 2, x2: 2, y2: -2 } as const;

// quadratic 수평선(collinear): y=0, x∈[-2,2]. tangent 검증용.
const flatQuadratic = { kind: 'quadratic', x0: -2, y0: 0, x1: 0, y1: 0, x2: 2, y2: 0 } as const;

// cubic S-curve: 양 끝 (-2,-2),(2,2), t=0.5에서 (0,0)을 지난다.
const cubic = { kind: 'cubic', x0: -2, y0: -2, x1: 2, y1: -2, x2: -2, y2: 2, x3: 2, y3: 2 } as const;

describe('intersectsQuadraticCircle', () => {
  test('curve가 circle 내부를 지나면 true를 반환한다', () => {
    // circle 중심 (0,0) r=1 — peak (0,0)이 내부
    expect(intersectsQuadraticCircle(quadratic, { cx: 0, cy: 0, r: 1 })).toBe(true);
  });

  test('수평 curve가 circle boundary에 접하면(tangent) true를 반환한다', () => {
    // 중심 (0,-1) r=1 → top (0,0)에서 y=0 직선과 접한다
    expect(intersectsQuadraticCircle(flatQuadratic, { cx: 0, cy: -1, r: 1 })).toBe(true);
  });

  test('endpoint가 circle 내부면 true를 반환한다', () => {
    // 중심 (-2,-2) = p0, r=1
    expect(intersectsQuadraticCircle(quadratic, { cx: -2, cy: -2, r: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticCircle(quadratic, { cx: 0, cy: 10, r: 1 })).toBe(false);
  });

  test('empty circle (r ≤ 0)은 false를 반환한다', () => {
    expect(intersectsQuadraticCircle(quadratic, { cx: 0, cy: 0, r: 0 })).toBe(false);
  });
});

describe('intersectsQuadraticEllipse', () => {
  test('curve가 ellipse 내부를 지나면 true를 반환한다', () => {
    expect(intersectsQuadraticEllipse(quadratic, { cx: 0, cy: 0, rx: 1, ry: 3 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(quadratic, { cx: 10, cy: 10, rx: 1, ry: 1 })).toBe(false);
  });

  test('empty ellipse (ry ≤ 0)는 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(quadratic, { cx: 0, cy: 0, rx: 1, ry: 0 })).toBe(false);
  });
});

describe('intersectsQuadraticRect', () => {
  test('curve가 rect 경계를 가로지르면 true를 반환한다', () => {
    // rect [-1,1]² — peak (0,0) 내부, endpoint 외부
    expect(intersectsQuadraticRect(quadratic, { x: -1, y: -1, width: 2, height: 2 })).toBe(true);
  });

  test('curve가 rect 내부에 완전히 들어가면(endpoint 포함) true를 반환한다', () => {
    expect(intersectsQuadraticRect(quadratic, { x: -10, y: -10, width: 20, height: 20 })).toBe(true);
  });

  test('endpoint가 rect 꼭짓점에 닿으면 true를 반환한다', () => {
    // p0 (-2,-2)이 rect 꼭짓점
    expect(intersectsQuadraticRect(quadratic, { x: -2, y: -2, width: 4, height: 4 })).toBe(true);
  });

  test('curve가 rect edge와 collinear overlap이면 true를 반환한다', () => {
    expect(intersectsQuadraticRect(flatQuadratic, { x: -1, y: 0, width: 2, height: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticRect(quadratic, { x: 100, y: 100, width: 2, height: 2 })).toBe(false);
  });

  test('empty rect (width ≤ 0)는 false를 반환한다', () => {
    expect(intersectsQuadraticRect(quadratic, { x: -1, y: -1, width: 0, height: 2 })).toBe(false);
  });
});

describe('intersectsQuadraticBounds', () => {
  test('curve가 bounds 경계를 가로지르면 true를 반환한다', () => {
    expect(intersectsQuadraticBounds(quadratic, { minX: -1, minY: -1, maxX: 1, maxY: 1 })).toBe(true);
  });

  test('zero-extent bounds(수직 선분)를 가로지르면 true를 반환한다', () => {
    // x=0, y∈[-5,5] 세로 선분. curve가 t=0.5에서 (0,0) 통과
    expect(intersectsQuadraticBounds(quadratic, { minX: 0, minY: -5, maxX: 0, maxY: 5 })).toBe(true);
  });

  test('zero-extent bounds edge와 collinear overlap이면 true를 반환한다', () => {
    expect(intersectsQuadraticBounds(flatQuadratic, { minX: -1, minY: 0, maxX: 1, maxY: 0 })).toBe(true);
  });

  test('zero-extent bounds point를 curve가 통과하면 true를 반환한다', () => {
    expect(intersectsQuadraticBounds(quadratic, { minX: 0, minY: 0, maxX: 0, maxY: 0 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(quadratic, { minX: 100, minY: 100, maxX: 101, maxY: 101 })).toBe(false);
  });

  test('inverted bounds(min > max)는 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(quadratic, { minX: 1, minY: 1, maxX: -1, maxY: -1 })).toBe(false);
  });
});

describe('intersectsQuadraticTriangle', () => {
  test('curve가 triangle 변을 가로지르면 true를 반환한다', () => {
    // 작은 삼각형, origin 포함. peak (0,0) 내부, endpoint 외부
    expect(intersectsQuadraticTriangle(quadratic, { x1: -1, y1: -1, x2: 1, y2: -1, x3: 0, y3: 1 })).toBe(true);
  });

  test('triangle이 curve를 완전히 둘러싸면 true를 반환한다', () => {
    expect(intersectsQuadraticTriangle(quadratic, { x1: -10, y1: -10, x2: 10, y2: -10, x3: 0, y3: 10 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticTriangle(quadratic, { x1: 100, y1: 100, x2: 102, y2: 100, x3: 101, y3: 102 })).toBe(
      false
    );
  });

  test('degenerate triangle(collinear)은 false를 반환한다', () => {
    expect(intersectsQuadraticTriangle(quadratic, { x1: -1, y1: 0, x2: 0, y2: 0, x3: 1, y3: 0 })).toBe(false);
  });

  test('curve가 non-degenerate triangle edge와 collinear overlap이면 true를 반환한다', () => {
    expect(intersectsQuadraticTriangle(flatQuadratic, { x1: -1, y1: 0, x2: 1, y2: 0, x3: 0, y3: 2 })).toBe(true);
  });
});

describe('intersectsCubicCircle', () => {
  test('S-curve가 circle 내부를 지나면 true를 반환한다', () => {
    expect(intersectsCubicCircle(cubic, { cx: 0, cy: 0, r: 1 })).toBe(true);
  });

  test('endpoint가 circle 내부면 true를 반환한다', () => {
    expect(intersectsCubicCircle(cubic, { cx: 2, cy: 2, r: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicCircle(cubic, { cx: 0, cy: 20, r: 1 })).toBe(false);
  });

  test('empty circle (r ≤ 0)은 false를 반환한다', () => {
    expect(intersectsCubicCircle(cubic, { cx: 0, cy: 0, r: -1 })).toBe(false);
  });
});

describe('intersectsCubicEllipse', () => {
  test('S-curve가 ellipse 내부를 지나면 true를 반환한다', () => {
    expect(intersectsCubicEllipse(cubic, { cx: 0, cy: 0, rx: 1, ry: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(cubic, { cx: 20, cy: 0, rx: 1, ry: 1 })).toBe(false);
  });

  test('empty ellipse (rx ≤ 0)는 false를 반환한다', () => {
    expect(intersectsCubicEllipse(cubic, { cx: 0, cy: 0, rx: 0, ry: 1 })).toBe(false);
  });
});

describe('intersectsCubicRect', () => {
  test('curve가 rect 경계를 가로지르면 true를 반환한다', () => {
    expect(intersectsCubicRect(cubic, { x: -1, y: -1, width: 2, height: 2 })).toBe(true);
  });

  test('curve가 rect 내부에 완전히 들어가면 true를 반환한다', () => {
    expect(intersectsCubicRect(cubic, { x: -10, y: -10, width: 20, height: 20 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicRect(cubic, { x: 100, y: 100, width: 2, height: 2 })).toBe(false);
  });
});

describe('intersectsCubicBounds', () => {
  test('zero-extent bounds(수직 선분)를 가로지르면 true를 반환한다', () => {
    expect(intersectsCubicBounds(cubic, { minX: 0, minY: -5, maxX: 0, maxY: 5 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicBounds(cubic, { minX: 100, minY: 100, maxX: 101, maxY: 101 })).toBe(false);
  });
});

describe('intersectsCubicTriangle', () => {
  test('curve가 triangle 변을 가로지르면 true를 반환한다', () => {
    expect(intersectsCubicTriangle(cubic, { x1: -1, y1: -1, x2: 1, y2: -1, x3: 0, y3: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicTriangle(cubic, { x1: 100, y1: 100, x2: 102, y2: 100, x3: 101, y3: 102 })).toBe(false);
  });

  test('degenerate triangle(collinear)은 false를 반환한다', () => {
    expect(intersectsCubicTriangle(cubic, { x1: -1, y1: 0, x2: 0, y2: 0, x3: 1, y3: 0 })).toBe(false);
  });
});

describe('non-finite 입력', () => {
  test('quadratic: control point가 NaN이면 false를 반환한다', () => {
    expect(
      intersectsQuadraticCircle(
        { kind: 'quadratic', x0: Number.NaN, y0: 0, x1: 0, y1: 2, x2: 2, y2: -2 },
        { cx: 0, cy: 0, r: 1 }
      )
    ).toBe(false);
  });

  test('quadratic: circle r이 +Infinity이면 false를 반환한다', () => {
    expect(intersectsQuadraticCircle(quadratic, { cx: 0, cy: 0, r: Number.POSITIVE_INFINITY })).toBe(false);
  });

  test('cubic: control point가 -Infinity이면 false를 반환한다', () => {
    expect(
      intersectsCubicCircle(
        { kind: 'cubic', x0: Number.NEGATIVE_INFINITY, y0: 0, x1: 2, y1: -2, x2: -2, y2: 2, x3: 2, y3: 2 },
        { cx: 0, cy: 0, r: 1 }
      )
    ).toBe(false);
  });

  test('cubic: rect width가 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicRect(cubic, { x: -1, y: -1, width: Number.NaN, height: 2 })).toBe(false);
  });
});
