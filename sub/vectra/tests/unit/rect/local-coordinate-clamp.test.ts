/**
 * normalizePointInto / normalizePoint / denormalizePointInto / denormalizePoint /
 * clampPointInto / clampPoint / aspectRatio 통합 테스트.
 *
 * 테스트 커버리지:
 *  - world ↔ rect-local 좌표 raw affine 변환 (clamp 없음)
 *  - rect 밖 point의 normalization / extrapolation
 *  - out/input aliasing 안전성
 *  - zero/negative dimension rect의 raw division/multiplication 결과
 *  - rect closed boundary clamp와 empty rect top-left fallback
 *  - aspect ratio scalar query와 empty rect NaN
 *  - NaN / Infinity / -Infinity 전파 또는 boundary clamp 결과
 */

import { describe, expect, test } from 'vitest';
import { aspectRatio } from '../../../src/rect/aspect-ratio';
import { clampPoint } from '../../../src/rect/clamp-point';
import { clampPointInto } from '../../../src/rect/clamp-point-into';
import { denormalizePoint } from '../../../src/rect/denormalize-point';
import { denormalizePointInto } from '../../../src/rect/denormalize-point-into';
import { normalizePoint } from '../../../src/rect/normalize-point';
import { normalizePointInto } from '../../../src/rect/normalize-point-into';

// --------------------------------------------------------------------------
// normalizePointInto

describe('normalizePointInto', () => {
  test('object rect + object point를 local coordinate로 변환한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5 });
    expect(out).toEqual({ x: 0.5, y: 0.5 });
  });

  test('offset rect를 raw affine으로 변환한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 5, y: 3, width: 10, height: 20 }, { x: 10, y: 13 });
    expect(out.x).toBeCloseTo(0.5);
    expect(out.y).toBeCloseTo(0.5);
  });

  test('tuple rect + tuple point를 변환한다', () => {
    const out: [number, number] = [0, 0];
    normalizePointInto(out, [0, 0, 10, 10], [2, 8]);
    expect(out[0]).toBeCloseTo(0.2);
    expect(out[1]).toBeCloseTo(0.8);
  });

  test('rect 밖 point를 clamp하지 않고 <0 / >1 값으로 기록한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: -5, y: 15 });
    expect(out.x).toBeCloseTo(-0.5);
    expect(out.y).toBeCloseTo(1.5);
  });

  test('out === point aliasing 호출도 정의대로 동작한다', () => {
    const shared = { x: 10, y: 13 };
    const ret = normalizePointInto(shared, { x: 5, y: 3, width: 10, height: 20 }, shared);
    expect(ret).toBe(shared);
    expect(shared.x).toBeCloseTo(0.5);
    expect(shared.y).toBeCloseTo(0.5);
  });

  test('반환값이 out과 동일 reference이다', () => {
    const out = { x: 0, y: 0 };
    expect(normalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5 })).toBe(out);
  });

  test('zero width division 결과(Infinity)를 기록한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: 0, height: 10 }, { x: 5, y: 5 });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBeCloseTo(0.5);
  });

  test('zero width + on-origin point division 결과(NaN)를 기록한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: 0, height: 10 }, { x: 0, y: 5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBeCloseTo(0.5);
  });

  test('zero height division 결과(-Infinity)를 기록한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: 10, height: 0 }, { x: 5, y: -5 });
    expect(out.x).toBeCloseTo(0.5);
    expect(out.y).toBe(-Infinity);
  });

  test('negative dimension rect에서 raw division 결과를 기록한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: -10, height: 10 }, { x: 5, y: 5 });
    expect(out.x).toBeCloseTo(-0.5);
    expect(out.y).toBeCloseTo(0.5);
  });

  test('NaN point component를 전파한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: Number.NaN, y: 5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBeCloseTo(0.5);
  });

  test('Infinity / -Infinity point component를 finite denominator로 전파한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: Infinity, y: -Infinity });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(-Infinity);
  });

  test('NaN width rect는 empty가 아니라 raw division 경로로 NaN을 전파한다', () => {
    const out = { x: 0, y: 0 };
    normalizePointInto(out, { x: 0, y: 0, width: Number.NaN, height: 10 }, { x: 5, y: 5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBeCloseTo(0.5);
  });
});

// --------------------------------------------------------------------------
// normalizePoint companion

describe('normalizePoint', () => {
  test('plain { x, y } object를 반환한다', () => {
    const result = normalizePoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5 });
    expect(result).toEqual({ x: 0.5, y: 0.5 });
  });

  test('normalizePointInto와 동일한 결과를 반환한다', () => {
    const rect = { x: 5, y: 3, width: 10, height: 20 };
    const point = { x: -2, y: 50 };
    const out = { x: 0, y: 0 };
    normalizePointInto(out, rect, point);
    expect(normalizePoint(rect, point)).toEqual(out);
  });

  test('새 object를 반환한다', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    const point = { x: 5, y: 5 };
    expect(normalizePoint(rect, point)).not.toBe(normalizePoint(rect, point));
  });

  test('input point가 mutation되지 않는다', () => {
    const point = { x: 5, y: 5 };
    normalizePoint({ x: 0, y: 0, width: 10, height: 10 }, point);
    expect(point).toEqual({ x: 5, y: 5 });
  });
});

// --------------------------------------------------------------------------
// denormalizePointInto

describe('denormalizePointInto', () => {
  test('object rect + object local point를 world coordinate로 변환한다', () => {
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 0.5, y: 0.5 });
    expect(out).toEqual({ x: 5, y: 5 });
  });

  test('offset rect를 raw affine으로 변환한다', () => {
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, { x: 5, y: 3, width: 10, height: 20 }, { x: 0.5, y: 0.5 });
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(13);
  });

  test('tuple rect + tuple local point를 변환한다', () => {
    const out: [number, number] = [0, 0];
    denormalizePointInto(out, [0, 0, 10, 10], [0.2, 0.8]);
    expect(out[0]).toBeCloseTo(2);
    expect(out[1]).toBeCloseTo(8);
  });

  test('0..1 밖 local coordinate를 clamp하지 않고 extrapolate한다', () => {
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: -0.5, y: 1.5 });
    expect(out.x).toBeCloseTo(-5);
    expect(out.y).toBeCloseTo(15);
  });

  test('out === localPoint aliasing 호출도 정의대로 동작한다', () => {
    const shared = { x: 0.5, y: 0.5 };
    const ret = denormalizePointInto(shared, { x: 5, y: 3, width: 10, height: 20 }, shared);
    expect(ret).toBe(shared);
    expect(shared.x).toBeCloseTo(10);
    expect(shared.y).toBeCloseTo(13);
  });

  test('zero dimension rect에서 raw multiplication/addition 결과를 기록한다', () => {
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, { x: 7, y: 4, width: 0, height: 0 }, { x: 0.5, y: 0.5 });
    expect(out).toEqual({ x: 7, y: 4 });
  });

  test('negative dimension rect에서 raw 결과를 기록한다', () => {
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, { x: 0, y: 0, width: -10, height: 10 }, { x: 0.5, y: 0.5 });
    expect(out.x).toBeCloseTo(-5);
    expect(out.y).toBeCloseTo(5);
  });

  test('NaN local component를 전파한다', () => {
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: Number.NaN, y: 0.5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBeCloseTo(5);
  });

  test('Infinity / -Infinity local component를 전파한다', () => {
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: Infinity, y: -Infinity });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(-Infinity);
  });

  test('normalize → denormalize round-trip이 원본 point를 복원한다', () => {
    const rect = { x: 5, y: 3, width: 10, height: 20 };
    const point = { x: 8, y: 17 };
    const local = normalizePoint(rect, point);
    const restored = denormalizePoint(rect, local);
    expect(restored.x).toBeCloseTo(point.x);
    expect(restored.y).toBeCloseTo(point.y);
  });
});

// --------------------------------------------------------------------------
// denormalizePoint companion

describe('denormalizePoint', () => {
  test('plain { x, y } object를 반환한다', () => {
    const result = denormalizePoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 0.5, y: 0.5 });
    expect(result).toEqual({ x: 5, y: 5 });
  });

  test('denormalizePointInto와 동일한 결과를 반환한다', () => {
    const rect = { x: 5, y: 3, width: 10, height: 20 };
    const local = { x: 1.5, y: -0.5 };
    const out = { x: 0, y: 0 };
    denormalizePointInto(out, rect, local);
    expect(denormalizePoint(rect, local)).toEqual(out);
  });

  test('새 object를 반환한다', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    const local = { x: 0.5, y: 0.5 };
    expect(denormalizePoint(rect, local)).not.toBe(denormalizePoint(rect, local));
  });

  test('input local point가 mutation되지 않는다', () => {
    const local = { x: 0.5, y: 0.5 };
    denormalizePoint({ x: 0, y: 0, width: 10, height: 10 }, local);
    expect(local).toEqual({ x: 0.5, y: 0.5 });
  });
});

// --------------------------------------------------------------------------
// clampPointInto

describe('clampPointInto', () => {
  test('rect 내부 point는 그대로 기록한다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 3, y: 7 });
    expect(out).toEqual({ x: 3, y: 7 });
  });

  test('rect 밖 point의 각 component를 closed boundary로 clamp한다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: -5, y: 15 });
    expect(out).toEqual({ x: 0, y: 10 });
  });

  test('한 축만 밖이면 해당 축만 clamp한다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 4 });
    expect(out).toEqual({ x: 10, y: 4 });
  });

  test('min edge 위 point는 그대로 유지한다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 5, y: 3, width: 10, height: 10 }, { x: 5, y: 3 });
    expect(out).toEqual({ x: 5, y: 3 });
  });

  test('max edge 위 point는 그대로 유지한다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 5, y: 3, width: 10, height: 10 }, { x: 15, y: 13 });
    expect(out).toEqual({ x: 15, y: 13 });
  });

  test('tuple rect + tuple point + tuple out을 지원한다', () => {
    const out: [number, number] = [0, 0];
    clampPointInto(out, [0, 0, 10, 10], [-5, 20]);
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(10);
  });

  test('out === point aliasing 호출도 정의대로 동작한다', () => {
    const shared = { x: -5, y: 15 };
    const ret = clampPointInto(shared, { x: 0, y: 0, width: 10, height: 10 }, shared);
    expect(ret).toBe(shared);
    expect(shared).toEqual({ x: 0, y: 10 });
  });

  test('반환값이 out과 동일 reference이다', () => {
    const out = { x: 0, y: 0 };
    expect(clampPointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: 3, y: 3 })).toBe(out);
  });

  test('zero width rect는 top-left raw 좌표를 기록한다', () => {
    const out = { x: 99, y: 99 };
    clampPointInto(out, { x: 2, y: 7, width: 0, height: 4 }, { x: 50, y: 50 });
    expect(out).toEqual({ x: 2, y: 7 });
  });

  test('zero height rect는 top-left raw 좌표를 기록한다', () => {
    const out = { x: 99, y: 99 };
    clampPointInto(out, { x: 2, y: 7, width: 4, height: 0 }, { x: 50, y: 50 });
    expect(out).toEqual({ x: 2, y: 7 });
  });

  test('negative dimension rect는 top-left raw 좌표를 기록한다', () => {
    const out = { x: 99, y: 99 };
    clampPointInto(out, { x: 1, y: 2, width: -5, height: 3 }, { x: 50, y: 50 });
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('NaN component는 NaN으로 전파한다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: Number.NaN, y: 5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(5);
  });

  test('Infinity component는 max boundary에 붙는다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: Infinity, y: 5 });
    expect(out.x).toBe(10);
    expect(out.y).toBe(5);
  });

  test('-Infinity component는 min boundary에 붙는다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 0, y: 0, width: 10, height: 10 }, { x: -Infinity, y: 5 });
    expect(out.x).toBe(0);
    expect(out.y).toBe(5);
  });

  test('NaN width rect는 empty가 아니라 clamp 경로로 NaN을 전파한다', () => {
    const out = { x: 0, y: 0 };
    clampPointInto(out, { x: 0, y: 0, width: Number.NaN, height: 10 }, { x: 5, y: 5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(5);
  });
});

// --------------------------------------------------------------------------
// clampPoint companion

describe('clampPoint', () => {
  test('plain { x, y } object를 반환한다', () => {
    const result = clampPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: -5, y: 15 });
    expect(result).toEqual({ x: 0, y: 10 });
  });

  test('clampPointInto와 동일한 결과를 반환한다', () => {
    const rect = { x: 5, y: 3, width: 10, height: 10 };
    const point = { x: 50, y: -50 };
    const out = { x: 0, y: 0 };
    clampPointInto(out, rect, point);
    expect(clampPoint(rect, point)).toEqual(out);
  });

  test('새 object를 반환한다', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    const point = { x: 3, y: 3 };
    expect(clampPoint(rect, point)).not.toBe(clampPoint(rect, point));
  });

  test('empty rect: top-left raw 좌표를 담은 object 반환', () => {
    expect(clampPoint({ x: 2, y: 7, width: 0, height: 4 }, { x: 50, y: 50 })).toEqual({ x: 2, y: 7 });
  });

  test('input point가 mutation되지 않는다', () => {
    const point = { x: -5, y: 15 };
    clampPoint({ x: 0, y: 0, width: 10, height: 10 }, point);
    expect(point).toEqual({ x: -5, y: 15 });
  });
});

// --------------------------------------------------------------------------
// aspectRatio

describe('aspectRatio', () => {
  test('non-empty rect에서 width / height를 반환한다', () => {
    expect(aspectRatio({ x: 0, y: 0, width: 20, height: 10 })).toBe(2);
  });

  test('정사각형은 1을 반환한다', () => {
    expect(aspectRatio({ x: 5, y: 3, width: 10, height: 10 })).toBe(1);
  });

  test('tuple rect를 지원한다', () => {
    expect(aspectRatio([0, 0, 30, 10])).toBe(3);
  });

  test('zero width는 NaN을 반환한다', () => {
    expect(Number.isNaN(aspectRatio({ x: 0, y: 0, width: 0, height: 10 }))).toBe(true);
  });

  test('zero height는 NaN을 반환한다', () => {
    expect(Number.isNaN(aspectRatio({ x: 0, y: 0, width: 10, height: 0 }))).toBe(true);
  });

  test('negative width는 NaN을 반환한다', () => {
    expect(Number.isNaN(aspectRatio({ x: 0, y: 0, width: -10, height: 10 }))).toBe(true);
  });

  test('negative height는 NaN을 반환한다', () => {
    expect(Number.isNaN(aspectRatio({ x: 0, y: 0, width: 10, height: -10 }))).toBe(true);
  });

  test('NaN width rect는 NaN을 반환한다', () => {
    expect(Number.isNaN(aspectRatio({ x: 0, y: 0, width: Number.NaN, height: 10 }))).toBe(true);
  });
});
