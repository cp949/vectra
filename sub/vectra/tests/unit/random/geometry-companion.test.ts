/**
 * random geometry companion 함수 단위 테스트.
 *
 * Into 함수를 위임하는 geometry companion의 반환 타입과 실패 시 undefined 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { direction } from '../../../src/random/direction';
import { pointInBounds } from '../../../src/random/point-in-bounds';
import { pointInCircle } from '../../../src/random/point-in-circle';
import { pointInEllipse } from '../../../src/random/point-in-ellipse';
import { pointInEllipseInto } from '../../../src/random/point-in-ellipse-into';
import { pointInPolygon } from '../../../src/random/point-in-polygon';
import { pointInPolygonInto } from '../../../src/random/point-in-polygon-into';
import { pointInRect } from '../../../src/random/point-in-rect';
import { pointInRectOutside } from '../../../src/random/point-in-rect-outside';
import { pointInRectOutsideInto } from '../../../src/random/point-in-rect-outside-into';
import { pointInTriangle } from '../../../src/random/point-in-triangle';
import { pointOnCircle } from '../../../src/random/point-on-circle';
import { pointOnPath } from '../../../src/random/point-on-path';
import { pointOnPathInto } from '../../../src/random/point-on-path-into';
import { pointOnPolyline } from '../../../src/random/point-on-polyline';
import { pointOnPolylineInto } from '../../../src/random/point-on-polyline-into';
import { pointOnSegment } from '../../../src/random/point-on-segment';

/** 순서가 고정된 난수 시퀀스를 반환하는 테스트용 rng 생성 헬퍼 */
const sequence = (values: readonly number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('random geometry companion 함수', () => {
  describe('direction', () => {
    test('direction은 { x, y } 형태의 방향 벡터를 반환한다', () => {
      // rng=0 → theta=0 → (1, 0)
      const result = direction(1, () => 0);
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
    });

    test('direction은 length 파라미터를 반영한다', () => {
      // rng=0.5 → theta=PI → cos(PI)≈-1, sin(PI)≈0, length=3 → (-3, 0)
      const result = direction(3, () => 0.5);
      expect(result.x).toBeCloseTo(-3);
      expect(result.y).toBeCloseTo(0);
    });

    test('direction은 length 생략 시 단위 벡터를 반환한다', () => {
      // rng=0 → theta=0 → (1, 0)
      const result = direction(undefined, () => 0);
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
    });

    test('direction은 매번 새 object를 반환한다', () => {
      const r1 = direction(1, () => 0);
      const r2 = direction(1, () => 0);
      expect(r1).not.toBe(r2);
    });
  });

  describe('pointOnSegment', () => {
    test('pointOnSegment는 { x, y } 형태를 반환한다', () => {
      // t=0.25, a=(10,20), b=(30,60) → (15, 30)
      const result = pointOnSegment({ a: { x: 10, y: 20 }, b: { x: 30, y: 60 } }, () => 0.25);
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toEqual({ x: 15, y: 30 });
    });

    test('pointOnSegment는 degenerate segment에서 endpoint를 반환한다', () => {
      const result = pointOnSegment({ a: { x: 5, y: 7 }, b: { x: 5, y: 7 } }, () => 0.5);
      expect(result).toEqual({ x: 5, y: 7 });
    });

    test('pointOnSegment는 매번 새 object를 반환한다', () => {
      const seg = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
      const r1 = pointOnSegment(seg, () => 0.5);
      const r2 = pointOnSegment(seg, () => 0.5);
      expect(r1).not.toBe(r2);
    });
  });

  describe('pointInRect', () => {
    test('pointInRect는 degenerate rect(width=0)에서 undefined를 반환한다', () => {
      const result = pointInRect({ x: 0, y: 0, width: 0, height: 10 }, sequence([0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInRect는 degenerate rect(height<0)에서 undefined를 반환한다', () => {
      const result = pointInRect({ x: 0, y: 0, width: 10, height: -1 }, sequence([0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInRect는 valid rect에서 { x, y } 형태를 반환한다', () => {
      // x=10, y=20, w=100, h=50, rng=[0.25, 0.5] → (35, 45)
      const result = pointInRect({ x: 10, y: 20, width: 100, height: 50 }, sequence([0.25, 0.5]));
      expect(result).toBeDefined();
      if (result !== undefined) {
        expect(result).toEqual({ x: 35, y: 45 });
      }
    });
  });

  describe('pointInRectOutside', () => {
    const outer = { x: 0, y: 0, width: 100, height: 80 };
    const inner = { x: 25, y: 20, width: 50, height: 30 };

    test('pointInRectOutside는 inner가 outer를 덮으면 undefined를 반환한다', () => {
      const result = pointInRectOutside(outer, { x: 0, y: 0, width: 100, height: 80 }, sequence([0, 0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInRectOutside는 inner가 outer 밖으로 삐져나가면 undefined를 반환한다', () => {
      const result = pointInRectOutside(outer, { x: 25, y: 20, width: 90, height: 30 }, sequence([0, 0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInRectOutside는 valid 입력에서 { x, y } 형태를 반환하고 Into와 동일 좌표다', () => {
      const result = pointInRectOutside(outer, inner, sequence([0.8, 0.5, 0.5]));
      expect(result).toBeDefined();
      if (result !== undefined) {
        const out = { x: 0, y: 0 };
        pointInRectOutsideInto(out, outer, inner, sequence([0.8, 0.5, 0.5]));
        expect(result).toEqual(out);
      }
    });

    test('pointInRectOutside는 매번 새 object를 반환한다', () => {
      const r1 = pointInRectOutside(outer, inner, sequence([0, 0.5, 0.5]));
      const r2 = pointInRectOutside(outer, inner, sequence([0, 0.5, 0.5]));
      expect(r1).not.toBe(r2);
    });
  });

  describe('pointInBounds', () => {
    test('pointInBounds는 inverted bounds(max.x < min.x)에서 undefined를 반환한다', () => {
      const result = pointInBounds({ min: { x: 5, y: 0 }, max: { x: 3, y: 10 } }, sequence([0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInBounds는 inverted bounds(max.y < min.y)에서 undefined를 반환한다', () => {
      const result = pointInBounds({ min: { x: 0, y: 5 }, max: { x: 10, y: 3 } }, sequence([0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInBounds는 valid bounds에서 { x, y } 형태를 반환한다', () => {
      // min=(0,0), max=(10,20), rng=[0.5, 0.25] → (5, 5)
      const result = pointInBounds({ min: { x: 0, y: 0 }, max: { x: 10, y: 20 } }, sequence([0.5, 0.25]));
      expect(result).toBeDefined();
      if (result !== undefined) {
        expect(result).toEqual({ x: 5, y: 5 });
      }
    });
  });

  describe('pointInCircle', () => {
    test('pointInCircle는 radius=0인 circle에서 undefined를 반환한다', () => {
      const result = pointInCircle({ center: { x: 0, y: 0 }, radius: 0 }, sequence([0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInCircle는 radius<0인 circle에서 undefined를 반환한다', () => {
      const result = pointInCircle({ center: { x: 0, y: 0 }, radius: -1 }, sequence([0.5, 0.5]));
      expect(result).toBeUndefined();
    });

    test('pointInCircle는 valid circle에서 { x, y } 형태를 반환한다', () => {
      // center=(1,2), radius=4, rng=[0.5, 0.5] → theta=PI, r=sqrt(0.5)*4
      const result = pointInCircle({ center: { x: 1, y: 2 }, radius: 4 }, sequence([0.5, 0.5]));
      expect(result).toBeDefined();
      if (result !== undefined) {
        const expectedR = Math.sqrt(0.5) * 4;
        expect(result.x).toBeCloseTo(1 + expectedR * Math.cos(Math.PI));
        expect(result.y).toBeCloseTo(2 + expectedR * Math.sin(Math.PI));
      }
    });
  });

  describe('pointOnCircle', () => {
    test('pointOnCircle는 radius<=0인 circle에서 undefined를 반환한다', () => {
      const result = pointOnCircle({ center: { x: 0, y: 0 }, radius: -1 }, () => 0.5);
      expect(result).toBeUndefined();
    });

    test('pointOnCircle는 valid circle에서 { x, y } 형태를 반환한다', () => {
      // center=(0,0), radius=5, rng=0 → theta=0 → (5, 0)
      const result = pointOnCircle({ center: { x: 0, y: 0 }, radius: 5 }, () => 0);
      expect(result).toBeDefined();
      if (result !== undefined) {
        expect(result.x).toBeCloseTo(5);
        expect(result.y).toBeCloseTo(0);
      }
    });
  });

  describe('pointInEllipse', () => {
    test('radiusX<=0 → undefined', () => {
      const result = pointInEllipse({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 5 }, () => 0.5);
      expect(result).toBeUndefined();
    });

    test('radiusY<=0 → undefined', () => {
      const result = pointInEllipse({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 0 }, () => 0.5);
      expect(result).toBeUndefined();
    });

    test('valid ellipse → { x, y } 반환, Into와 동일 좌표', () => {
      let call = 0;
      const rng = () => (call++ % 2 === 0 ? 0.5 : 0.25);
      const ellipse = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 5 };
      const result = pointInEllipse(ellipse, rng);
      expect(result).toBeDefined();
      if (result !== undefined) {
        // Into로 동일 rng 상태에서 계산한 값과 비교
        let call2 = 0;
        const rng2 = () => (call2++ % 2 === 0 ? 0.5 : 0.25);
        const out = { x: 0, y: 0 };
        pointInEllipseInto(out, ellipse, rng2);
        expect(result.x).toBeCloseTo(out.x);
        expect(result.y).toBeCloseTo(out.y);
      }
    });

    test('매번 새 object 반환', () => {
      const ellipse = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 5 };
      let call = 0;
      // rng cycles [0.5, 0.25] so both calls receive same values → same x/y but distinct references
      const rng = () => (call++ % 2 === 0 ? 0.5 : 0.25);
      const r1 = pointInEllipse(ellipse, rng);
      const r2 = pointInEllipse(ellipse, rng);
      // identity check: each call creates a fresh { x, y } object
      expect(r1).not.toBe(r2);
    });
  });

  describe('pointOnPath', () => {
    test('정상 path → { x, y } 반환, Into와 동일 결과', () => {
      // 교차 검증 패턴: companion이 Into와 동일한 결과를 반환하는지 검증
      const commands = [
        { kind: 'move' as const, x: 0, y: 0 },
        { kind: 'line' as const, x: 10, y: 0 },
      ];
      const result = pointOnPath(commands, () => 0.5);
      expect(result).toBeDefined();
      if (result !== undefined) {
        const out = { x: 0, y: 0 };
        pointOnPathInto(out, commands, () => 0.5);
        expect(result.x).toBeCloseTo(out.x);
        expect(result.y).toBeCloseTo(out.y);
      }
    });

    test('empty commands → undefined 반환', () => {
      const result = pointOnPath([], () => 0.5);
      expect(result).toBeUndefined();
    });

    test('move-only path → undefined 반환', () => {
      const result = pointOnPath([{ kind: 'move', x: 0, y: 0 }], () => 0.5);
      expect(result).toBeUndefined();
    });

    test('totalLength===0(동일 좌표 line segment) → undefined 반환', () => {
      const result = pointOnPath(
        [
          { kind: 'move', x: 3, y: 3 },
          { kind: 'line', x: 3, y: 3 },
        ],
        () => 0.5
      );
      expect(result).toBeUndefined();
    });

    test('매번 새 object 반환', () => {
      const commands = [
        { kind: 'move' as const, x: 0, y: 0 },
        { kind: 'line' as const, x: 10, y: 0 },
      ];
      const r1 = pointOnPath(commands, () => 0.5);
      const r2 = pointOnPath(commands, () => 0.5);
      expect(r1).not.toBe(r2);
    });
  });

  describe('pointOnPolyline', () => {
    test('정상 polyline → { x, y } 반환, Into와 동일 결과', () => {
      const polyline = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const result = pointOnPolyline(polyline, () => 0.5);
      expect(result).toBeDefined();
      if (result !== undefined) {
        const out = { x: 0, y: 0 };
        pointOnPolylineInto(out, polyline, () => 0.5);
        expect(result.x).toBeCloseTo(out.x);
        expect(result.y).toBeCloseTo(out.y);
      }
    });

    test('degenerate(empty polyline) → undefined 반환', () => {
      const result = pointOnPolyline([], () => 0.5);
      expect(result).toBeUndefined();
    });

    test('pointOnPolyline은 single-point polyline에서 undefined를 반환한다', () => {
      const result = pointOnPolyline([{ x: 3, y: 4 }], () => 0.5);
      expect(result).toBeUndefined();
    });

    test('PolylineObjectLike({ points }) 형태 입력을 지원한다', () => {
      // { points: [...] } 형태의 PolylineObjectLike 입력 검증
      const result = pointOnPolyline(
        {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
          ],
        },
        () => 0.5
      );
      expect(result).toBeDefined();
      if (result !== undefined) {
        expect(result.x).toBeCloseTo(5);
        expect(result.y).toBeCloseTo(0);
      }
    });

    test('매번 새 object 반환', () => {
      const polyline = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const r1 = pointOnPolyline(polyline, () => 0.5);
      const r2 = pointOnPolyline(polyline, () => 0.5);
      expect(r1).not.toBe(r2);
    });
  });

  describe('pointInPolygon', () => {
    /** 단위 정사각형 polygon (0~1 범위) */
    const unitSquare = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];

    test('빈 polygon → undefined', () => {
      const result = pointInPolygon([], () => 0.5);
      expect(result).toBeUndefined();
    });

    test('vertex 2개(point-count < 3) → undefined', () => {
      const result = pointInPolygon(
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        () => 0.5
      );
      expect(result).toBeUndefined();
    });

    test('valid polygon → { x, y } 반환, Into와 동일 좌표', () => {
      const rng = () => 0.5;
      const result = pointInPolygon(unitSquare, rng);
      expect(result).toBeDefined();
      if (result !== undefined) {
        const rng2 = () => 0.5;
        const out = { x: 0, y: 0 };
        pointInPolygonInto(out, unitSquare, rng2);
        expect(result.x).toBeCloseTo(out.x);
        expect(result.y).toBeCloseTo(out.y);
      }
    });

    test('degenerate polygon(NaN vertex) → undefined', () => {
      const result = pointInPolygon(
        [
          { x: 0, y: 0 },
          { x: NaN, y: 0 },
          { x: 1, y: 1 },
        ],
        () => 0.5
      );
      expect(result).toBeUndefined();
    });

    test('degenerate polygon(signedArea === 0) → undefined', () => {
      let calls = 0;
      const result = pointInPolygon(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        () => {
          calls++;
          return 0.5;
        }
      );
      expect(result).toBeUndefined();
      expect(calls).toBe(0);
    });

    test('매번 새 object 반환', () => {
      let call = 0;
      const rng = () => {
        call++;
        return 0.5;
      };
      const r1 = pointInPolygon(unitSquare, rng);
      const r2 = pointInPolygon(unitSquare, rng);
      expect(r1).not.toBe(r2);
    });
  });

  describe('pointInTriangle', () => {
    test('pointInTriangle는 { x, y } 형태를 반환한다', () => {
      // a=(0,0), b=(4,0), c=(0,4), r=0.2, s=0.3 → (0.8, 1.2)
      const result = pointInTriangle({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }, sequence([0.2, 0.3]));
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result.x).toBeCloseTo(0.8);
      expect(result.y).toBeCloseTo(1.2);
    });

    test('pointInTriangle는 barycentric reflection case를 올바르게 처리한다', () => {
      // r=0.7, s=0.6 → r+s=1.3>1 → r=0.3, s=0.4 → (1.2, 1.6)
      const result = pointInTriangle({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }, sequence([0.7, 0.6]));
      expect(result.x).toBeCloseTo(1.2);
      expect(result.y).toBeCloseTo(1.6);
    });

    test('pointInTriangle는 매번 새 object를 반환한다', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 1, y: 0 };
      const c = { x: 0, y: 1 };
      const r1 = pointInTriangle(a, b, c, sequence([0.2, 0.3]));
      const r2 = pointInTriangle(a, b, c, sequence([0.2, 0.3]));
      expect(r1).not.toBe(r2);
    });
  });
});
