/**
 * intersects ray × shape hit-T 함수 단위 테스트.
 *
 * 대상 함수:
 *  - rayCircleHitT, rayEllipseHitT : circumference와 처음 만나는 ray parameter t
 *  - raySegmentHitT                : segment와 만나는 t
 *  - rayPolygonHitT                : polygon edge와 처음 만나는 t
 *  - rayRectHitT, rayBoundsHitT    : box boundary와 처음 만나는 t
 *
 * rayRectHitT·rayBoundsHitT는 중첩 ray·box 입력을 받는다. 나머지는 평평한 ray(ox, oy, dx, dy)를 받는다.
 *
 * 검증:
 *  - t는 ray 방향 벡터의 길이 단위다. 방향 벡터를 정규화하지 않는다.
 *  - hit이 없으면 Infinity다. 접선, 평행, 공선, 방향 벡터 0, empty shape, NaN 입력을 고정한다.
 *  - tMin은 inclusive 경계다. 시작점이 안쪽이면 exit 교점이다.
 *  - 반사 직후 출발 면은 tMin으로 거른다. 거르지 않으면 같은 면에서 t = 0이 나온다.
 *
 * 기존 점 반환 함수와의 동일성은 ray-hit-t-equivalence.test.ts가 난수 입력으로 확인한다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { rayBoundsHitT } from '../../../src/intersects/ray-bounds-hit-t';
import { rayCircleHitT } from '../../../src/intersects/ray-circle-hit-t';
import { rayEllipseHitT } from '../../../src/intersects/ray-ellipse-hit-t';
import { rayPolygonHitT } from '../../../src/intersects/ray-polygon-hit-t';
import { rayRectHitT } from '../../../src/intersects/ray-rect-hit-t';
import { raySegmentHitT } from '../../../src/intersects/ray-segment-hit-t';
import type { Ray, Segment } from '../../../src/types/flat-shapes.internal';
import { reflectInto } from '../../../src/vec/reflect-into';

// 원점에서 +x로 가는 ray. 대부분의 시험이 이 ray를 쓴다.
const RIGHT = { ox: 0, oy: 0, dx: 1, dy: 0 };

describe('rayCircleHitT', () => {
  const right = { ox: 0, oy: 0, dx: 1, dy: 0 };
  const circle = { cx: 5, cy: 0, r: 1 };

  test('가까운 교점의 t를 반환한다', () => {
    expect(rayCircleHitT(right, circle)).toBe(4);
  });

  test('(dx, dy)를 정규화하지 않으므로 t는 (dx, dy) 길이 단위다', () => {
    expect(rayCircleHitT({ ox: 0, oy: 0, dx: 2, dy: 0 }, circle)).toBe(2);
    expect(rayCircleHitT({ ox: 0, oy: 0, dx: 0.5, dy: 0 }, circle)).toBe(8);
  });

  test('시작점 (ox, oy)가 안쪽이면 exit 교점의 t를 반환한다', () => {
    expect(rayCircleHitT({ ox: 5, oy: 0, dx: 1, dy: 0 }, { cx: 5, cy: 0, r: 2 })).toBe(2);
    expect(rayCircleHitT({ ox: 5, oy: 0, dx: 2, dy: 0 }, { cx: 5, cy: 0, r: 2 })).toBe(1);
  });

  test('접선은 접점의 t를 반환한다', () => {
    expect(rayCircleHitT(right, { cx: 5, cy: 1, r: 1 })).toBe(5);
  });

  test('빗나가면 Infinity를 반환한다', () => {
    expect(rayCircleHitT(right, { cx: 5, cy: 3, r: 1 })).toBe(Infinity);
  });

  test('circle이 ray 뒤쪽에 있으면 Infinity를 반환한다', () => {
    expect(rayCircleHitT(right, { cx: -5, cy: 0, r: 1 })).toBe(Infinity);
  });

  test('tMin 이상인 root 중 작은 쪽을 고른다', () => {
    expect(rayCircleHitT(right, circle, 3)).toBe(4);
    expect(rayCircleHitT(right, circle, 4.5)).toBe(6);
    expect(rayCircleHitT(right, circle, 6.5)).toBe(Infinity);
  });

  test('tMin은 inclusive다', () => {
    expect(rayCircleHitT(right, circle, 4)).toBe(4);
    expect(rayCircleHitT(right, circle, 6)).toBe(6);
  });

  test('접점 t가 tMin보다 작으면 Infinity를 반환한다', () => {
    const tangent = { cx: 5, cy: 1, r: 1 };
    expect(rayCircleHitT(right, tangent, 5)).toBe(5);
    expect(rayCircleHitT(right, tangent, 5.5)).toBe(Infinity);
  });

  test('출발점이 circumference 위면 tMin으로 출발 면을 거른다', () => {
    // 바깥으로 떠나는 ray: 출발점 t = 0만 맞고 되돌아오지 않는다.
    expect(rayCircleHitT({ ox: 6, oy: 0, dx: 1, dy: 0 }, circle)).toBeCloseTo(0, 12);
    expect(rayCircleHitT({ ox: 6, oy: 0, dx: 1, dy: 0 }, circle, 1e-9)).toBe(Infinity);
    // 안쪽으로 들어가는 ray: 출발점을 거르면 반대편 exit이 남는다.
    expect(rayCircleHitT({ ox: 4, oy: 0, dx: 1, dy: 0 }, circle)).toBeCloseTo(0, 12);
    expect(rayCircleHitT({ ox: 4, oy: 0, dx: 1, dy: 0 }, circle, 1e-9)).toBe(2);
  });

  test('dx = dy = 0이면 Infinity를 반환한다', () => {
    expect(rayCircleHitT({ ox: 5, oy: 0, dx: 0, dy: 0 }, { cx: 5, cy: 0, r: 2 })).toBe(Infinity);
  });

  test('empty circle(r ≤ 0)은 Infinity를 반환한다', () => {
    expect(rayCircleHitT(right, { cx: 5, cy: 0, r: 0 })).toBe(Infinity);
    expect(rayCircleHitT(right, { cx: 5, cy: 0, r: -1 })).toBe(Infinity);
  });

  test('epsilon을 키우면 접선에 가까운 빗나감도 접점으로 본다', () => {
    const nearTangent = { cx: 5, cy: 1 + 1e-10, r: 1 };
    expect(rayCircleHitT(right, nearTangent)).toBe(Infinity);
    expect(rayCircleHitT(right, nearTangent, 0, 1e-3)).toBe(5);
  });

  test('non-finite 입력은 hit 없음으로 처리한다', () => {
    expect(rayCircleHitT({ ox: Number.NaN, oy: 0, dx: 1, dy: 0 }, circle)).toBe(Infinity);
    expect(rayCircleHitT({ ox: 0, oy: 0, dx: Number.NaN, dy: 0 }, circle)).toBe(Infinity);
    expect(rayCircleHitT(right, { cx: Number.NaN, cy: 0, r: 1 })).toBe(Infinity);
    expect(rayCircleHitT(right, circle, Number.NaN)).toBe(Infinity);
  });
});

describe('rayEllipseHitT', () => {
  const right = { ox: 0, oy: 0, dx: 1, dy: 0 };
  const ellipse = { cx: 5, cy: 0, rx: 2, ry: 1 };

  test('x축과 y축 반지름이 다른 ellipse의 교점 t를 반환한다', () => {
    expect(rayEllipseHitT(right, ellipse)).toBe(3);
    // 위에서 아래로 쏘면 y 반지름이 적용된다.
    expect(rayEllipseHitT({ ox: 5, oy: 4, dx: 0, dy: -1 }, ellipse)).toBe(3);
  });

  test('시작점 (ox, oy)가 안쪽이면 exit 교점의 t를 반환한다', () => {
    expect(rayEllipseHitT({ ox: 5, oy: 0, dx: 1, dy: 0 }, ellipse)).toBe(2);
    expect(rayEllipseHitT({ ox: 5, oy: 0, dx: 0, dy: 1 }, ellipse)).toBe(1);
  });

  test('접선은 접점의 t를 반환하고 tMin이 더 크면 Infinity를 반환한다', () => {
    const tangent = { cx: 5, cy: 1, rx: 2, ry: 1 };
    expect(rayEllipseHitT(right, tangent)).toBe(5);
    expect(rayEllipseHitT(right, tangent, 6)).toBe(Infinity);
  });

  test('tMin으로 가까운 교점을 건너뛴다', () => {
    expect(rayEllipseHitT(right, ellipse, 3.5)).toBe(7);
    expect(rayEllipseHitT(right, ellipse, 3)).toBe(3);
    expect(rayEllipseHitT(right, ellipse, 7.5)).toBe(Infinity);
  });

  test('빗나감, dx = dy = 0인 ray, empty ellipse는 Infinity를 반환한다', () => {
    expect(rayEllipseHitT(right, { cx: 5, cy: 3, rx: 2, ry: 1 })).toBe(Infinity);
    expect(rayEllipseHitT({ ox: 0, oy: 0, dx: 0, dy: 0 }, ellipse)).toBe(Infinity);
    expect(rayEllipseHitT(right, { cx: 5, cy: 0, rx: 0, ry: 1 })).toBe(Infinity);
    expect(rayEllipseHitT(right, { cx: 5, cy: 0, rx: 2, ry: -1 })).toBe(Infinity);
  });
});

describe('raySegmentHitT', () => {
  test('평평한 ray와 segment를 받는다', () => {
    expectTypeOf(raySegmentHitT).parameter(0).toEqualTypeOf<Ray>();
    expectTypeOf(raySegmentHitT).parameter(1).toEqualTypeOf<Segment>();
  });
  const wall = { x1: 3, y1: -1, x2: 3, y2: 1 };
  const right = { ox: 0, oy: 0, dx: 1, dy: 0 };

  test('교점의 t를 반환한다', () => {
    expect(raySegmentHitT(right, wall)).toBe(3);
  });

  test('(dx, dy)를 정규화하지 않으므로 t는 (dx, dy) 길이 단위다', () => {
    expect(raySegmentHitT({ ox: 0, oy: 0, dx: 2, dy: 0 }, wall)).toBe(1.5);
    expect(raySegmentHitT({ ox: 0, oy: 0, dx: 3, dy: 4 }, { x1: 3, y1: 0, x2: 3, y2: 8 })).toBeCloseTo(1, 12);
  });

  test('segment 끝점 접촉은 hit이다', () => {
    expect(raySegmentHitT(right, { x1: 3, y1: 0, x2: 3, y2: 1 })).toBe(3);
    expect(raySegmentHitT(right, { x1: 3, y1: -1, x2: 3, y2: 0 })).toBe(3);
  });

  test('끝점을 조금만 벗어나도 miss다', () => {
    expect(raySegmentHitT(right, { x1: 3, y1: 1e-9, x2: 3, y2: 1 })).toBe(Infinity);
    expect(raySegmentHitT(right, { x1: 3, y1: -1, x2: 3, y2: -1e-9 })).toBe(Infinity);
  });

  test('segment가 ray 뒤쪽에 있으면 Infinity를 반환한다', () => {
    expect(raySegmentHitT(right, { x1: -3, y1: -1, x2: -3, y2: 1 })).toBe(Infinity);
  });

  test('평행이면 Infinity를 반환한다', () => {
    expect(raySegmentHitT(right, { x1: 1, y1: 1, x2: 5, y2: 1 })).toBe(Infinity);
  });

  test('공선 overlap도 hit으로 보지 않는다', () => {
    expect(raySegmentHitT(right, { x1: 2, y1: 0, x2: 6, y2: 0 })).toBe(Infinity);
    expect(raySegmentHitT({ ox: 4, oy: 0, dx: 1, dy: 0 }, { x1: 2, y1: 0, x2: 6, y2: 0 })).toBe(Infinity);
  });

  test('zero-length segment와 dx = dy = 0인 ray는 Infinity를 반환한다', () => {
    expect(raySegmentHitT(right, { x1: 3, y1: 0, x2: 3, y2: 0 })).toBe(Infinity);
    expect(raySegmentHitT({ ox: 0, oy: 0, dx: 0, dy: 0 }, wall)).toBe(Infinity);
  });

  test('tMin은 inclusive이고 더 크면 Infinity를 반환한다', () => {
    expect(raySegmentHitT(right, wall, 3)).toBe(3);
    expect(raySegmentHitT(right, wall, 3.0001)).toBe(Infinity);
  });

  test('epsilon을 명시하면 평행 판정이 cross 절대값 비교로 바뀐다', () => {
    const almostParallel = { x1: 1, y1: 0, x2: 2, y2: 1e-7 };
    // 기본값: sin θ가 1e-9보다 크므로 교차한다.
    expect(raySegmentHitT(right, almostParallel)).toBeCloseTo(1, 9);
    // |cross| = 1e-7 ≤ 1e-6이면 평행이다.
    expect(raySegmentHitT(right, almostParallel, 0, 1e-6)).toBe(Infinity);
  });

  test('non-finite 입력은 hit 없음으로 처리한다', () => {
    expect(raySegmentHitT({ ox: Number.NaN, oy: 0, dx: 1, dy: 0 }, wall)).toBe(Infinity);
    expect(raySegmentHitT({ ox: 0, oy: 0, dx: 1, dy: Number.NaN }, wall)).toBe(Infinity);
    expect(raySegmentHitT(right, { x1: 3, y1: Number.NaN, x2: 3, y2: 1 })).toBe(Infinity);
    expect(raySegmentHitT(right, wall, Number.NaN)).toBe(Infinity);
  });
});

describe('rayPolygonHitT', () => {
  const right = { ox: 0, oy: 0, dx: 1, dy: 0 };
  const square = [0, 0, 4, 0, 4, 4, 0, 4];

  test('밖에서 들어오는 ray는 진입 edge의 t를 반환한다', () => {
    expect(rayPolygonHitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, square)).toBe(2);
  });

  test('시작점 (ox, oy)가 안쪽이면 exit edge의 t를 반환한다', () => {
    expect(rayPolygonHitT({ ox: 2, oy: 2, dx: 1, dy: 0 }, square)).toBe(2);
    expect(rayPolygonHitT({ ox: 2, oy: 2, dx: 0, dy: -1 }, square)).toBe(2);
  });

  test('(dx, dy)를 정규화하지 않으므로 t는 (dx, dy) 길이 단위다', () => {
    expect(rayPolygonHitT({ ox: -2, oy: 2, dx: 4, dy: 0 }, square)).toBe(0.5);
  });

  test('여러 edge와 만나면 가장 작은 t를 반환한다', () => {
    // 오목 polygon: 위쪽에서 아래로 쏘면 가까운 윗면이 먼저다.
    const notch = [0, 0, 6, 0, 6, 4, 4, 4, 4, 2, 2, 2, 2, 4, 0, 4] as const;
    expect(rayPolygonHitT({ ox: 3, oy: 8, dx: 0, dy: -1 }, notch)).toBe(6);
    expect(rayPolygonHitT({ ox: 1, oy: 8, dx: 0, dy: -1 }, notch)).toBe(4);
  });

  test('vertex를 지나는 ray는 이웃 edge가 hit으로 잡는다', () => {
    expect(rayPolygonHitT({ ox: -2, oy: -2, dx: 1, dy: 1 }, square)).toBe(2);
  });

  test('edge를 따라 달리는 ray는 edge 끝의 이웃 edge에서 hit한다', () => {
    expect(rayPolygonHitT({ ox: -2, oy: 0, dx: 1, dy: 0 }, square)).toBe(2);
  });

  test('tMin으로 출발 edge를 거른다', () => {
    // 아래 edge 위에서 위로 떠난다.
    expect(rayPolygonHitT({ ox: 2, oy: 0, dx: 0, dy: 1 }, square)).toBeCloseTo(0, 12);
    expect(rayPolygonHitT({ ox: 2, oy: 0, dx: 0, dy: 1 }, square, 1e-9)).toBe(4);
    // 아래 edge 위에서 바깥으로 떠나면 되돌아오지 않는다.
    expect(rayPolygonHitT({ ox: 2, oy: 0, dx: 0, dy: -1 }, square)).toBeCloseTo(0, 12);
    expect(rayPolygonHitT({ ox: 2, oy: 0, dx: 0, dy: -1 }, square, 1e-9)).toBe(Infinity);
  });

  test('빗나가거나 ray 뒤쪽에 있으면 Infinity를 반환한다', () => {
    expect(rayPolygonHitT({ ox: -2, oy: 6, dx: 1, dy: 0 }, square)).toBe(Infinity);
    expect(rayPolygonHitT({ ox: -2, oy: 2, dx: -1, dy: 0 }, square)).toBe(Infinity);
  });

  test('좌표 수 < 6인 polygon과 dx = dy = 0인 ray는 Infinity를 반환한다', () => {
    expect(rayPolygonHitT(right, [1, -1, 1, 1])).toBe(Infinity);
    expect(rayPolygonHitT(right, [])).toBe(Infinity);
    expect(rayPolygonHitT({ ox: -2, oy: 2, dx: 0, dy: 0 }, square)).toBe(Infinity);
  });

  test('닫는 점을 반복해도 같은 t를 반환한다', () => {
    expect(rayPolygonHitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, [...square, square[0], square[1]])).toBe(2);
  });

  test('non-finite 좌표를 가진 edge는 건너뛰고 나머지 edge로 판정한다', () => {
    const broken = [0, 0, 4, 0, Number.NaN, Number.NaN, 0, 4];
    expect(rayPolygonHitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, broken)).toBe(2);
    // 오른쪽 edge는 NaN vertex 때문에 건너뛰므로 왼쪽 edge까지 지나간다.
    expect(rayPolygonHitT({ ox: 6, oy: 2, dx: -1, dy: 0 }, broken)).toBe(6);
  });

  test('epsilon을 명시하면 평행 판정이 cross 절대값 비교로 바뀐다', () => {
    // 아래쪽 edge는 ray와 거의 평행하다. |cross| = 2e-8이다.
    const sliver = [1, -1e-8, 3, 1e-8, 3, -5] as const;
    expect(rayPolygonHitT(right, sliver)).toBeCloseTo(2, 6);
    // 거의 평행한 edge를 건너뛰고 x = 3 edge에서 hit한다.
    expect(rayPolygonHitT(right, sliver, 0, 1e-6)).toBe(3);
  });
});

/**
 * rect와 bounds가 공유하는 box 계약을 한 이름으로 묶어 검증한다.
 *
 * @param name describe 이름
 * @param hitT 검증할 함수
 * @param box 객체 형태의 [0, 4] × [0, 4] box
 */
function describeBoxHitT<Box>(name: string, hitT: (ray: Ray, box: Box, tMin?: number) => number, box: Box): void {
  describe(name, () => {
    test('밖에서 들어오는 ray는 진입 교점의 t를 반환한다', () => {
      expect(hitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, box)).toBe(2);
      expect(hitT({ ox: 2, oy: 8, dx: 0, dy: -1 }, box)).toBe(4);
    });

    test('direction을 정규화하지 않으므로 t는 direction 길이 단위다', () => {
      expect(hitT({ ox: -2, oy: 2, dx: 4, dy: 0 }, box)).toBe(0.5);
    });

    test('origin이 안쪽이면 exit 교점의 t를 반환한다', () => {
      expect(hitT({ ox: 2, oy: 2, dx: 1, dy: 0 }, box)).toBe(2);
      expect(hitT({ ox: 1, oy: 2, dx: -1, dy: 0 }, box)).toBe(1);
      expect(hitT({ ox: 2, oy: 2, dx: 1, dy: 1 }, box)).toBe(2);
    });

    test('tMin은 inclusive이고 진입을 건너뛰면 exit을 반환한다', () => {
      expect(hitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, box, 2)).toBe(2);
      expect(hitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, box, 3)).toBe(6);
      expect(hitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, box, 6)).toBe(6);
      expect(hitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, box, 6.5)).toBe(Infinity);
    });

    test('tMin으로 출발 면을 거른다', () => {
      // 왼쪽 면 위에서 바깥으로 떠난다.
      expect(hitT({ ox: 0, oy: 2, dx: -1, dy: 0 }, box)).toBeCloseTo(0, 12);
      expect(hitT({ ox: 0, oy: 2, dx: -1, dy: 0 }, box, 1e-9)).toBe(Infinity);
      // 왼쪽 면 위에서 안쪽으로 들어간다.
      expect(hitT({ ox: 0, oy: 2, dx: 1, dy: 0 }, box)).toBeCloseTo(0, 12);
      expect(hitT({ ox: 0, oy: 2, dx: 1, dy: 0 }, box, 1e-9)).toBe(4);
    });

    test('모서리 접촉은 hit이다', () => {
      expect(hitT({ ox: -1, oy: 3, dx: 1, dy: 1 }, box)).toBe(1);
      expect(hitT({ ox: -1, oy: 3, dx: 1, dy: 1 }, box, 2)).toBe(Infinity);
    });

    test('변을 따라 달리는 ray는 box에 들어서는 모서리의 t를 반환한다', () => {
      expect(hitT({ ox: -2, oy: 0, dx: 1, dy: 0 }, box)).toBe(2);
      expect(hitT({ ox: 0, oy: -2, dx: 0, dy: 1 }, box)).toBe(2);
    });

    test('축에 평행한 ray가 slab 밖에 있으면 Infinity를 반환한다', () => {
      expect(hitT({ ox: -1, oy: 2, dx: 0, dy: 1 }, box)).toBe(Infinity);
      expect(hitT({ ox: 2, oy: 5, dx: 1, dy: 0 }, box)).toBe(Infinity);
    });

    test('빗나가거나 box 뒤쪽에 있으면 Infinity를 반환한다', () => {
      expect(hitT({ ox: -2, oy: 6, dx: 1, dy: 0 }, box)).toBe(Infinity);
      expect(hitT({ ox: -2, oy: 2, dx: -1, dy: 0 }, box)).toBe(Infinity);
      expect(hitT({ ox: -2, oy: 12, dx: 1, dy: -1 }, box)).toBe(Infinity);
    });

    test('zero direction은 Infinity를 반환한다', () => {
      expect(hitT({ ox: 2, oy: 2, dx: 0, dy: 0 }, box)).toBe(Infinity);
    });

    test('non-finite 입력은 hit 없음으로 처리한다', () => {
      expect(hitT({ ox: Number.NaN, oy: 2, dx: 1, dy: 0 }, box)).toBe(Infinity);
      expect(hitT({ ox: Number.NaN, oy: 2, dx: 0, dy: 1 }, box)).toBe(Infinity);
      expect(hitT({ ox: -2, oy: 2, dx: Number.NaN, dy: 0 }, box)).toBe(Infinity);
      expect(hitT({ ox: 2, oy: Number.NaN, dx: 1, dy: 0 }, box)).toBe(Infinity);
      expect(hitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, box, Number.NaN)).toBe(Infinity);
    });
  });
}

describeBoxHitT('rayRectHitT', rayRectHitT, { x: 0, y: 0, width: 4, height: 4 });
describeBoxHitT('rayBoundsHitT', rayBoundsHitT, { minX: 0, minY: 0, maxX: 4, maxY: 4 });

describe('rayRectHitT empty 입력', () => {
  test('width 또는 height가 0 이하면 Infinity를 반환한다', () => {
    expect(rayRectHitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, { x: 0, y: 0, width: 0, height: 4 })).toBe(Infinity);
    expect(rayRectHitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, { x: 0, y: 0, width: 4, height: -1 })).toBe(Infinity);
  });
});

describe('rayBoundsHitT empty·zero-extent 입력', () => {
  test('inverted bounds는 Infinity를 반환한다', () => {
    expect(rayBoundsHitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, { minX: 4, minY: 0, maxX: 0, maxY: 4 })).toBe(Infinity);
    expect(rayBoundsHitT({ ox: -2, oy: 2, dx: 1, dy: 0 }, { minX: 0, minY: 4, maxX: 4, maxY: 0 })).toBe(Infinity);
  });

  test('zero-extent bounds는 유효하다. 점을 지나는 ray만 hit이다', () => {
    const point = { minX: 5, minY: 0, maxX: 5, maxY: 0 };
    expect(rayBoundsHitT(RIGHT, point)).toBe(5);
    expect(rayBoundsHitT({ ox: 0, oy: 0, dx: 1, dy: 1 }, point)).toBe(Infinity);
  });

  test('zero-extent bounds가 선이면 가로지르는 ray의 t를 반환한다', () => {
    const line = { minX: 5, minY: -1, maxX: 5, maxY: 1 };
    expect(rayBoundsHitT(RIGHT, line)).toBe(5);
  });
});

// 반사 직후 출발 면 문제: tMin이 없으면 같은 면과 t = 0으로 다시 만난다.
describe('광선 추적 소비 시나리오', () => {
  /** 가장 가까운 segment와 그 t를 찾는다. 같은 면을 건너뛰도록 tMin을 받는다. */
  function nearestWall(ray: Ray, walls: readonly Segment[], tMin: number): { index: number; t: number } {
    let best = Infinity;
    let index = -1;
    for (let i = 0; i < walls.length; i++) {
      const t = raySegmentHitT(ray, walls[i], tMin);
      if (t < best) {
        best = t;
        index = i;
      }
    }
    return { index, t: best };
  }

  const floorAndCeiling = [
    { x1: 0, y1: 0, x2: 20, y2: 0 },
    { x1: 0, y1: 5, x2: 20, y2: 5 },
  ] as const;

  test('반사한 위치에서 tMin 없이 다시 쏘면 출발한 면을 t = 0으로 맞힌다', () => {
    // (2, 5)에서 (1, -1) 방향: 바닥 (7, 0)에 t = 5로 닿는다.
    const first = nearestWall({ ox: 2, oy: 5, dx: 1, dy: -1 }, [floorAndCeiling[0]], 0);
    expect(first.t).toBe(5);

    const dir = reflectInto({ x: 0, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 1 });
    expect(dir).toEqual({ x: 1, y: 1 });

    const next = { ox: 7, oy: 0, dx: dir.x, dy: dir.y };
    const withoutTMin = nearestWall(next, floorAndCeiling, 0);
    expect(withoutTMin.index).toBe(0);
    expect(withoutTMin.t).toBeCloseTo(0, 12);
  });

  test('tMin으로 출발 면을 거르면 반대편 면을 맞힌다', () => {
    const next = { ox: 7, oy: 0, dx: 1, dy: 1 };
    const withTMin = nearestWall(next, floorAndCeiling, 1e-9);
    expect(withTMin.index).toBe(1);
    expect(withTMin.t).toBe(5);
  });

  test('닫힌 방에서 20번 튕겨도 같은 면을 연속으로 맞히지 않는다', () => {
    const room = [
      { x1: 0, y1: 0, x2: 10, y2: 0 },
      { x1: 10, y1: 0, x2: 10, y2: 6 },
      { x1: 10, y1: 6, x2: 0, y2: 6 },
      { x1: 0, y1: 6, x2: 0, y2: 0 },
    ] as const;
    const normals = [
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 0],
    ] as const;

    let ray = { ox: 3, oy: 2, dx: 0.8, dy: 0.3 };
    let previous = -1;
    for (let bounce = 0; bounce < 20; bounce++) {
      const { index, t } = nearestWall(ray, room, 1e-9);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(t).toBeGreaterThan(0);
      expect(index).not.toBe(previous);

      const hitX = ray.ox + t * ray.dx;
      const hitY = ray.oy + t * ray.dy;
      // 부동소수점 오차가 있어도 hit 점은 방 안이다.
      expect(hitX).toBeGreaterThanOrEqual(-1e-9);
      expect(hitX).toBeLessThanOrEqual(10 + 1e-9);
      expect(hitY).toBeGreaterThanOrEqual(-1e-9);
      expect(hitY).toBeLessThanOrEqual(6 + 1e-9);

      const [nx, ny] = normals[index];
      const dir = reflectInto({ x: 0, y: 0 }, { x: ray.dx, y: ray.dy }, { x: nx, y: ny });
      ray = { ox: hitX, oy: hitY, dx: dir.x, dy: dir.y };
      previous = index;
    }
  });

  test('원과 벽이 섞인 장면에서 가장 작은 t의 물체를 고른다', () => {
    const circle = { cx: 4, cy: 0, r: 1 };
    const wall = { x1: 7, y1: -3, x2: 7, y2: 3 } as const;
    const ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    const tCircle = rayCircleHitT(ray, circle);
    const tWall = raySegmentHitT(ray, wall);
    expect(Math.min(tCircle, tWall)).toBe(tCircle);
    expect(tCircle).toBe(3);
    expect(tWall).toBe(7);
    // 원 안에서 출발한 ray는 exit을 먼저 맞힌다.
    expect(rayCircleHitT({ ox: 4, oy: 0, dx: 1, dy: 0 }, circle, 1e-9)).toBe(1);
  });
});
