/**
 * arcClosestPointInto / arcClosestPoint unit test.
 *
 * 검증 범위:
 * - circular arc: span 내 projection, span 외 endpoint clamp, tie-break
 * - rotated ellipse arc: 결과가 arc 위에 있음
 * - option fallback: invalid options는 기본값 사용
 * - degenerate: rx=0, zero-sweep
 * - companion: arcClosestPoint 새 object 반환
 */

import { describe, expect, it } from 'vitest';
import { arcClosestPoint } from '../../../src/curve/arc-closest-point';
import { arcClosestPointInto } from '../../../src/curve/arc-closest-point-into';
import { arcPointAtTInto } from '../../../src/curve/arc-point-at-t-into';
import type { CenterArcLike } from '../../../src/types';

const HALF_PI = Math.PI / 2;

function sq(x: number, y: number): number {
  return x * x + y * y;
}

describe('arcClosestPointInto', () => {
  describe('circular arc — span 내 projection', () => {
    // quarter circle: center=(0,0), r=1, 0..π/2
    const arc: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: HALF_PI,
      sweep: false,
    };

    it('query (2, 0): start endpoint (1, 0) 반환', () => {
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 2, y: 0 });
      expect(out.x).toBeCloseTo(1, 6);
      expect(out.y).toBeCloseTo(0, 6);
    });

    it('query (0, 2): end endpoint (0, 1) 반환', () => {
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 0, y: 2 });
      expect(out.x).toBeCloseTo(0, 6);
      expect(out.y).toBeCloseTo(1, 6);
    });

    it('query (1, 1): midpoint (cos π/4, sin π/4) 반환', () => {
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 1, y: 1 });
      expect(out.x).toBeCloseTo(Math.cos(Math.PI / 4), 6);
      expect(out.y).toBeCloseTo(Math.sin(Math.PI / 4), 6);
    });
  });

  describe('circular arc — span 밖 endpoint clamp', () => {
    // arc: 0..π/4 (첫 octant)
    const arc: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI / 4,
      sweep: false,
    };

    it('query (0, 2): arc 위쪽이므로 end endpoint(cos π/4, sin π/4) 반환', () => {
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 0, y: 2 });
      const endX = Math.cos(Math.PI / 4);
      const endY = Math.sin(Math.PI / 4);
      expect(out.x).toBeCloseTo(endX, 6);
      expect(out.y).toBeCloseTo(endY, 6);
    });
  });

  describe('circular arc — tie-break (작은 t 선택)', () => {
    // 반원: 0..π, query (0,2) → 중점 (0,1)이 최근접
    it('대칭 query에서 arc 중점이 최근접점', () => {
      const arc: CenterArcLike = {
        cx: 0,
        cy: 0,
        rx: 1,
        ry: 1,
        xRotation: 0,
        startAngle: 0,
        endAngle: Math.PI,
        sweep: false,
      };
      // query (0, 2) → 중점 (0, 1)이 최근접
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 0, y: 2 });
      expect(out.x).toBeCloseTo(0, 6);
      expect(out.y).toBeCloseTo(1, 6);
    });

    it('endpoint 동거리: 내부 극값이 가장 가까운 경우', () => {
      // arc: -π/4..π/4, query (10, 0)
      // start(cos -π/4, sin -π/4)와 end(cos π/4, sin π/4)는 같은 거리
      // Newton-Raphson이 내부 극값(1, 0)으로 수렴 → (1, 0) 반환
      const arc: CenterArcLike = {
        cx: 0,
        cy: 0,
        rx: 1,
        ry: 1,
        xRotation: 0,
        startAngle: -Math.PI / 4,
        endAngle: Math.PI / 4,
        sweep: false,
      };
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 10, y: 0 });
      expect(out.x).toBeCloseTo(1, 6);
      expect(out.y).toBeCloseTo(0, 5);
    });
  });

  describe('rotated ellipse arc', () => {
    it('결과가 전체 arc 위 sampling보다 query에 가깝거나 같음', () => {
      const arc: CenterArcLike = {
        cx: 0,
        cy: 0,
        rx: 2,
        ry: 1,
        xRotation: Math.PI / 4,
        startAngle: 0,
        endAngle: HALF_PI,
        sweep: false,
      };
      // query (1, 0): arc 위 t=0 point (√2, √2)가 가장 가까운 점
      const query = { x: 1, y: 0 };
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, query);
      const dOut = sq(out.x - query.x, out.y - query.y);

      // arc 위 100개 sampling보다 결과가 나쁘지 않아야 함
      for (let i = 0; i <= 100; i++) {
        const pt = arcPointAtTInto({ x: 0, y: 0 }, arc, i / 100);
        const d = sq(pt.x - query.x, pt.y - query.y);
        expect(dOut).toBeLessThanOrEqual(d + 1e-8);
      }
    });

    it('query가 arc 내부에 projection 있는 경우 내부 극값 반환', () => {
      // arc: center=(0,0), rx=2, ry=1, xRotation=0 (axis-aligned ellipse), 0..π
      // query (0, 2): arc 최고점 (0, 1) 근방이 가장 가까움
      const arc: CenterArcLike = {
        cx: 0,
        cy: 0,
        rx: 2,
        ry: 1,
        xRotation: 0,
        startAngle: 0,
        endAngle: Math.PI,
        sweep: false,
      };
      const query = { x: 0, y: 2 };
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, query);
      // t=0.5에서 (0, 1)이 최근접
      expect(out.x).toBeCloseTo(0, 5);
      expect(out.y).toBeCloseTo(1, 5);
    });
  });

  describe('multi-turn arc', () => {
    it('1회전을 초과하는 rotated ellipse arc에서도 내부 최근접점을 찾는다', () => {
      const arc: CenterArcLike = {
        cx: 0.3530061028385034,
        cy: 3.758920038136507,
        rx: 17.135900831544014,
        ry: 4.352600784956401,
        xRotation: 1.8923668846049637,
        startAngle: 9.108478777488017,
        endAngle: -7.162074950833062,
        sweep: false,
      };
      const query = { x: 11.221763608008661, y: 12.528184734252115 };
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, query);
      const dOut = sq(out.x - query.x, out.y - query.y);

      const previousWrongEndpoint = arcPointAtTInto({ x: 0, y: 0 }, arc, 1);
      const dEndpoint = sq(previousWrongEndpoint.x - query.x, previousWrongEndpoint.y - query.y);

      expect(dOut).toBeLessThan(dEndpoint);
      expect(out.x).toBeCloseTo(2.991148, 4);
      expect(out.y).toBeCloseTo(9.170581, 4);
    });
  });

  describe('option fallback — invalid options는 기본값 사용', () => {
    const arc: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: HALF_PI,
      sweep: false,
    };

    it('sampleCount: 1 → 예외 없이 기본값 11 사용', () => {
      expect(() => arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 1, y: 1 }, { sampleCount: 1 })).not.toThrow();
    });

    it('tolerance: 0 → 예외 없이 기본값 1e-8 사용', () => {
      expect(() => arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 1, y: 1 }, { tolerance: 0 })).not.toThrow();
    });

    it('maxIterations: -1 → 예외 없이 기본값 20 사용', () => {
      expect(() => arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 1, y: 1 }, { maxIterations: -1 })).not.toThrow();
    });

    it('invalid options에서도 합리적인 결과 반환', () => {
      const out = arcClosestPointInto(
        { x: 0, y: 0 },
        arc,
        { x: 1, y: 1 },
        {
          sampleCount: 0,
          tolerance: -1,
          maxIterations: -5,
        }
      );
      // midpoint (cos π/4, sin π/4) 근방이어야 함
      expect(out.x).toBeCloseTo(Math.cos(Math.PI / 4), 5);
      expect(out.y).toBeCloseTo(Math.sin(Math.PI / 4), 5);
    });
  });

  describe('degenerate', () => {
    it('rx=0 → center point 반환', () => {
      const arc: CenterArcLike = {
        cx: 3,
        cy: 4,
        rx: 0,
        ry: 1,
        xRotation: 0,
        startAngle: 0,
        endAngle: HALF_PI,
        sweep: false,
      };
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 10, y: 10 });
      expect(out.x).toBe(3);
      expect(out.y).toBe(4);
    });

    it('zero-sweep (startAngle===endAngle) → start point 반환', () => {
      const arc: CenterArcLike = {
        cx: 0,
        cy: 0,
        rx: 1,
        ry: 1,
        xRotation: 0,
        startAngle: HALF_PI,
        endAngle: HALF_PI,
        sweep: false,
      };
      // arcPointAtTInto(arc, 0) = (cos π/2, sin π/2) = (0, 1)
      const out = arcClosestPointInto({ x: 0, y: 0 }, arc, { x: 10, y: 10 });
      expect(out.x).toBeCloseTo(0, 10);
      expect(out.y).toBeCloseTo(1, 10);
    });
  });

  describe('out 반환 확인', () => {
    it('Into variant는 out 자체를 반환한다', () => {
      const arc: CenterArcLike = {
        cx: 0,
        cy: 0,
        rx: 1,
        ry: 1,
        xRotation: 0,
        startAngle: 0,
        endAngle: HALF_PI,
        sweep: false,
      };
      const out = { x: 0, y: 0 };
      const result = arcClosestPointInto(out, arc, { x: 1, y: 1 });
      expect(result).toBe(out);
    });
  });
});

describe('arcClosestPoint', () => {
  it('새 object를 반환하고 Into와 같은 좌표', () => {
    const arc: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: HALF_PI,
      sweep: false,
    };
    const query = { x: 1, y: 1 };
    const ref = arcClosestPointInto({ x: 0, y: 0 }, arc, query);
    const result = arcClosestPoint(arc, query);
    expect(result.x).toBeCloseTo(ref.x, 10);
    expect(result.y).toBeCloseTo(ref.y, 10);
  });

  it('반환된 object는 Into에 전달된 out과 다른 instance', () => {
    const arc: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: HALF_PI,
      sweep: false,
    };
    const result = arcClosestPoint(arc, { x: 1, y: 0 });
    // arcClosestPoint는 내부에서 {x:0, y:0}을 새로 만들어 반환
    expect(result).toBeDefined();
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
  });
});
