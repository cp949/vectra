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
 * containment-only, empty/degenerate primitive, zero-extent bounds, tuple/object 입력 동등성,
 * non-finite(NaN/±Infinity) 입력을 검증한다.
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
import type { XYInput } from '../../../src/types';

// quadratic arc: 양 끝 (-2,-2),(2,-2), t=0.5에서 peak (0,0)을 지난다.
const qP0: XYInput = { x: -2, y: -2 };
const qP1: XYInput = { x: 0, y: 2 };
const qP2: XYInput = { x: 2, y: -2 };

// quadratic 수평선(collinear): y=0, x∈[-2,2]. tangent 검증용.
const qFlatP0: XYInput = { x: -2, y: 0 };
const qFlatP1: XYInput = { x: 0, y: 0 };
const qFlatP2: XYInput = { x: 2, y: 0 };

// cubic S-curve: 양 끝 (-2,-2),(2,2), t=0.5에서 (0,0)을 지난다.
const cP0: XYInput = { x: -2, y: -2 };
const cP1: XYInput = { x: 2, y: -2 };
const cP2: XYInput = { x: -2, y: 2 };
const cP3: XYInput = { x: 2, y: 2 };

describe('intersectsQuadraticCircle', () => {
  test('curve가 circle 내부를 지나면 true를 반환한다', () => {
    // circle 중심 (0,0) r=1 — peak (0,0)이 내부
    expect(intersectsQuadraticCircle(qP0, qP1, qP2, { center: { x: 0, y: 0 }, radius: 1 })).toBe(true);
  });

  test('수평 curve가 circle boundary에 접하면(tangent) true를 반환한다', () => {
    // 중심 (0,-1) r=1 → top (0,0)에서 y=0 직선과 접한다
    expect(intersectsQuadraticCircle(qFlatP0, qFlatP1, qFlatP2, { center: { x: 0, y: -1 }, radius: 1 })).toBe(true);
  });

  test('endpoint가 circle 내부면 true를 반환한다', () => {
    // 중심 (-2,-2) = p0, r=1
    expect(intersectsQuadraticCircle(qP0, qP1, qP2, { center: { x: -2, y: -2 }, radius: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticCircle(qP0, qP1, qP2, { center: { x: 0, y: 10 }, radius: 1 })).toBe(false);
  });

  test('empty circle (radius ≤ 0)는 false를 반환한다', () => {
    expect(intersectsQuadraticCircle(qP0, qP1, qP2, { center: { x: 0, y: 0 }, radius: 0 })).toBe(false);
  });
});

describe('intersectsQuadraticEllipse', () => {
  test('curve가 ellipse 내부를 지나면 true를 반환한다', () => {
    expect(intersectsQuadraticEllipse(qP0, qP1, qP2, { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 3 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(qP0, qP1, qP2, { center: { x: 10, y: 10 }, radiusX: 1, radiusY: 1 })).toBe(false);
  });

  test('empty ellipse (radiusY ≤ 0)는 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(qP0, qP1, qP2, { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 0 })).toBe(false);
  });
});

describe('intersectsQuadraticRect', () => {
  test('curve가 rect 경계를 가로지르면 true를 반환한다', () => {
    // rect [-1,1]² — peak (0,0) 내부, endpoint 외부
    expect(intersectsQuadraticRect(qP0, qP1, qP2, { x: -1, y: -1, width: 2, height: 2 })).toBe(true);
  });

  test('curve가 rect 내부에 완전히 들어가면(endpoint 포함) true를 반환한다', () => {
    expect(intersectsQuadraticRect(qP0, qP1, qP2, { x: -10, y: -10, width: 20, height: 20 })).toBe(true);
  });

  test('endpoint가 rect 꼭짓점에 닿으면 true를 반환한다', () => {
    // p0 (-2,-2)이 rect 꼭짓점
    expect(intersectsQuadraticRect(qP0, qP1, qP2, { x: -2, y: -2, width: 4, height: 4 })).toBe(true);
  });

  test('curve가 rect edge와 collinear overlap이면 true를 반환한다', () => {
    expect(intersectsQuadraticRect(qFlatP0, qFlatP1, qFlatP2, { x: -1, y: 0, width: 2, height: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticRect(qP0, qP1, qP2, { x: 100, y: 100, width: 2, height: 2 })).toBe(false);
  });

  test('empty rect (width ≤ 0)는 false를 반환한다', () => {
    expect(intersectsQuadraticRect(qP0, qP1, qP2, { x: -1, y: -1, width: 0, height: 2 })).toBe(false);
  });
});

describe('intersectsQuadraticBounds', () => {
  test('curve가 bounds 경계를 가로지르면 true를 반환한다', () => {
    expect(intersectsQuadraticBounds(qP0, qP1, qP2, { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } })).toBe(true);
  });

  test('zero-extent bounds(수직 선분)를 가로지르면 true를 반환한다', () => {
    // x=0, y∈[-5,5] 세로 선분. curve가 t=0.5에서 (0,0) 통과
    expect(intersectsQuadraticBounds(qP0, qP1, qP2, { min: { x: 0, y: -5 }, max: { x: 0, y: 5 } })).toBe(true);
  });

  test('zero-extent bounds edge와 collinear overlap이면 true를 반환한다', () => {
    expect(intersectsQuadraticBounds(qFlatP0, qFlatP1, qFlatP2, { min: { x: -1, y: 0 }, max: { x: 1, y: 0 } })).toBe(
      true
    );
  });

  test('zero-extent bounds point를 curve가 통과하면 true를 반환한다', () => {
    expect(intersectsQuadraticBounds(qP0, qP1, qP2, { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(qP0, qP1, qP2, { min: { x: 100, y: 100 }, max: { x: 101, y: 101 } })).toBe(false);
  });

  test('inverted bounds(min > max)는 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(qP0, qP1, qP2, { min: { x: 1, y: 1 }, max: { x: -1, y: -1 } })).toBe(false);
  });
});

describe('intersectsQuadraticTriangle', () => {
  test('curve가 triangle 변을 가로지르면 true를 반환한다', () => {
    // 작은 삼각형, origin 포함. peak (0,0) 내부, endpoint 외부
    expect(
      intersectsQuadraticTriangle(qP0, qP1, qP2, { a: { x: -1, y: -1 }, b: { x: 1, y: -1 }, c: { x: 0, y: 1 } })
    ).toBe(true);
  });

  test('triangle이 curve를 완전히 둘러싸면 true를 반환한다', () => {
    expect(
      intersectsQuadraticTriangle(qP0, qP1, qP2, { a: { x: -10, y: -10 }, b: { x: 10, y: -10 }, c: { x: 0, y: 10 } })
    ).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(
      intersectsQuadraticTriangle(qP0, qP1, qP2, {
        a: { x: 100, y: 100 },
        b: { x: 102, y: 100 },
        c: { x: 101, y: 102 },
      })
    ).toBe(false);
  });

  test('degenerate triangle(collinear)은 false를 반환한다', () => {
    expect(
      intersectsQuadraticTriangle(qP0, qP1, qP2, { a: { x: -1, y: 0 }, b: { x: 0, y: 0 }, c: { x: 1, y: 0 } })
    ).toBe(false);
  });

  test('curve가 non-degenerate triangle edge와 collinear overlap이면 true를 반환한다', () => {
    expect(
      intersectsQuadraticTriangle(qFlatP0, qFlatP1, qFlatP2, {
        a: { x: -1, y: 0 },
        b: { x: 1, y: 0 },
        c: { x: 0, y: 2 },
      })
    ).toBe(true);
  });
});

describe('intersectsCubicCircle', () => {
  test('S-curve가 circle 내부를 지나면 true를 반환한다', () => {
    expect(intersectsCubicCircle(cP0, cP1, cP2, cP3, { center: { x: 0, y: 0 }, radius: 1 })).toBe(true);
  });

  test('endpoint가 circle 내부면 true를 반환한다', () => {
    expect(intersectsCubicCircle(cP0, cP1, cP2, cP3, { center: { x: 2, y: 2 }, radius: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicCircle(cP0, cP1, cP2, cP3, { center: { x: 0, y: 20 }, radius: 1 })).toBe(false);
  });

  test('empty circle (radius ≤ 0)는 false를 반환한다', () => {
    expect(intersectsCubicCircle(cP0, cP1, cP2, cP3, { center: { x: 0, y: 0 }, radius: -1 })).toBe(false);
  });
});

describe('intersectsCubicEllipse', () => {
  test('S-curve가 ellipse 내부를 지나면 true를 반환한다', () => {
    expect(intersectsCubicEllipse(cP0, cP1, cP2, cP3, { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(cP0, cP1, cP2, cP3, { center: { x: 20, y: 0 }, radiusX: 1, radiusY: 1 })).toBe(false);
  });

  test('empty ellipse (radiusX ≤ 0)는 false를 반환한다', () => {
    expect(intersectsCubicEllipse(cP0, cP1, cP2, cP3, { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 1 })).toBe(false);
  });
});

describe('intersectsCubicRect', () => {
  test('curve가 rect 경계를 가로지르면 true를 반환한다', () => {
    expect(intersectsCubicRect(cP0, cP1, cP2, cP3, { x: -1, y: -1, width: 2, height: 2 })).toBe(true);
  });

  test('curve가 rect 내부에 완전히 들어가면 true를 반환한다', () => {
    expect(intersectsCubicRect(cP0, cP1, cP2, cP3, { x: -10, y: -10, width: 20, height: 20 })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicRect(cP0, cP1, cP2, cP3, { x: 100, y: 100, width: 2, height: 2 })).toBe(false);
  });
});

describe('intersectsCubicBounds', () => {
  test('zero-extent bounds(수직 선분)를 가로지르면 true를 반환한다', () => {
    expect(intersectsCubicBounds(cP0, cP1, cP2, cP3, { min: { x: 0, y: -5 }, max: { x: 0, y: 5 } })).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(intersectsCubicBounds(cP0, cP1, cP2, cP3, { min: { x: 100, y: 100 }, max: { x: 101, y: 101 } })).toBe(false);
  });
});

describe('intersectsCubicTriangle', () => {
  test('curve가 triangle 변을 가로지르면 true를 반환한다', () => {
    expect(
      intersectsCubicTriangle(cP0, cP1, cP2, cP3, { a: { x: -1, y: -1 }, b: { x: 1, y: -1 }, c: { x: 0, y: 1 } })
    ).toBe(true);
  });

  test('완전히 외부면 false를 반환한다', () => {
    expect(
      intersectsCubicTriangle(cP0, cP1, cP2, cP3, {
        a: { x: 100, y: 100 },
        b: { x: 102, y: 100 },
        c: { x: 101, y: 102 },
      })
    ).toBe(false);
  });

  test('degenerate triangle(collinear)은 false를 반환한다', () => {
    expect(
      intersectsCubicTriangle(cP0, cP1, cP2, cP3, { a: { x: -1, y: 0 }, b: { x: 0, y: 0 }, c: { x: 1, y: 0 } })
    ).toBe(false);
  });
});

describe('입력 형태 동등성 (tuple/object)', () => {
  const tupleP0: XYInput = [-2, -2];
  const tupleP1: XYInput = [0, 2];
  const tupleP2: XYInput = [2, -2];

  test('quadratic circle: tuple point가 object point와 같은 결과를 낸다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 1 };
    expect(intersectsQuadraticCircle(tupleP0, tupleP1, tupleP2, circle)).toBe(
      intersectsQuadraticCircle(qP0, qP1, qP2, circle)
    );
    expect(intersectsQuadraticCircle(tupleP0, tupleP1, tupleP2, circle)).toBe(true);
  });

  test('quadratic rect: tuple rect가 object rect와 같은 결과를 낸다', () => {
    expect(intersectsQuadraticRect(qP0, qP1, qP2, [-1, -1, 2, 2])).toBe(
      intersectsQuadraticRect(qP0, qP1, qP2, { x: -1, y: -1, width: 2, height: 2 })
    );
  });
});

describe('non-finite 입력', () => {
  test('quadratic: control point가 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticCircle({ x: Number.NaN, y: 0 }, qP1, qP2, { center: { x: 0, y: 0 }, radius: 1 })).toBe(
      false
    );
  });

  test('quadratic: circle radius가 +Infinity이면 false를 반환한다', () => {
    expect(intersectsQuadraticCircle(qP0, qP1, qP2, { center: { x: 0, y: 0 }, radius: Number.POSITIVE_INFINITY })).toBe(
      false
    );
  });

  test('cubic: control point가 -Infinity이면 false를 반환한다', () => {
    expect(
      intersectsCubicCircle({ x: Number.NEGATIVE_INFINITY, y: 0 }, cP1, cP2, cP3, { center: { x: 0, y: 0 }, radius: 1 })
    ).toBe(false);
  });

  test('cubic: rect width가 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicRect(cP0, cP1, cP2, cP3, { x: -1, y: -1, width: Number.NaN, height: 2 })).toBe(false);
  });
});
