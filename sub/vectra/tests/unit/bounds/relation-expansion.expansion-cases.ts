/** 경계 상자의 합집합, 확장, 이동 시험을 relation-expansion.test.ts에 제공한다. */

import { describe, expect, test } from 'vitest';
import { createBounds } from '../../../src/bounds/create-bounds';
import { expandByInto } from '../../../src/bounds/expand-by-into';
import { expandToIncludeBoundsInto } from '../../../src/bounds/expand-to-include-bounds-into';
import { expandToIncludePointInto } from '../../../src/bounds/expand-to-include-point-into';
import { translateInto } from '../../../src/bounds/translate-into';
import { unionInto } from '../../../src/bounds/union-into';
import type { BoundsWritable } from '../../../src/types';
import type { BoundsWritable as FlatBoundsWritable } from '../../../src/types/flat-shapes.internal';
import { flatSentinel, makeBounds, sentinel } from './relation-expansion.helpers';

// ---------------------------------------------------------------------------
// unionInto
// ---------------------------------------------------------------------------
describe('bounds - unionInto', () => {
  test('두 non-empty bounds의 union은 min의 최솟값, max의 최댓값을 기록한다', () => {
    const out = makeBounds();
    const a = { min: { x: 0, y: 1 }, max: { x: 4, y: 5 } };
    const b = { min: { x: 2, y: 0 }, max: { x: 6, y: 4 } };
    const result = unionInto(out, a, b);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 6, y: 5 });
    expect(result).toBe(out);
  });

  test('b가 empty이면 a를 복사한다', () => {
    const out = makeBounds();
    const a = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    const b = sentinel();
    unionInto(out, a, b);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('a가 empty이면 b를 복사한다', () => {
    const out = makeBounds();
    const a = sentinel();
    const b = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    unionInto(out, a, b);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('둘 다 empty이면 a를 복사한다(sentinel 유지)', () => {
    const out = makeBounds();
    const a = sentinel();
    const b = sentinel();
    unionInto(out, a, b);
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('out === a aliasing: union이 정확하게 기록된다', () => {
    const a: BoundsWritable = { min: { x: 0, y: 1 }, max: { x: 4, y: 5 } };
    const b = { min: { x: 2, y: 0 }, max: { x: 6, y: 4 } };
    unionInto(a, a, b);
    expect(a.min).toEqual({ x: 0, y: 0 });
    expect(a.max).toEqual({ x: 6, y: 5 });
  });

  test('out === b aliasing: union이 정확하게 기록된다', () => {
    const a = { min: { x: 0, y: 1 }, max: { x: 4, y: 5 } };
    const b: BoundsWritable = { min: { x: 2, y: 0 }, max: { x: 6, y: 4 } };
    unionInto(b, a, b);
    expect(b.min).toEqual({ x: 0, y: 0 });
    expect(b.max).toEqual({ x: 6, y: 5 });
  });

  test('inverted b(empty)는 empty로 처리되어 a를 복사한다', () => {
    const out = makeBounds();
    const a = { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } };
    const b = { min: { x: 20, y: 20 }, max: { x: 15, y: 15 } };
    unionInto(out, a, b);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 2, y: 2 });
  });

  test('tuple min/max 입력도 처리한다', () => {
    const out = makeBounds();
    const a = { min: [0, 1] as const, max: [4, 5] as const };
    const b = { min: [2, 0] as const, max: [6, 4] as const };
    unionInto(out, a, b);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 6, y: 5 });
  });
});

// ---------------------------------------------------------------------------
// expandByInto
// ---------------------------------------------------------------------------
describe('bounds - expandByInto', () => {
  test('양수 amount로 사방을 확장한다', () => {
    const out = createBounds();
    const result = expandByInto(out, { minX: 1, minY: 2, maxX: 7, maxY: 8 }, 2);
    expect(out).toEqual({ minX: -1, minY: 0, maxX: 9, maxY: 10 });
    expect(result).toBe(out);
  });

  test('음수 amount(deflate)를 정규화 없이 적용한다', () => {
    const out = createBounds();
    expandByInto(out, { minX: 0, minY: 0, maxX: 6, maxY: 6 }, -2);
    expect(out).toEqual({ minX: 2, minY: 2, maxX: 4, maxY: 4 });
  });

  test('deflate가 너무 크면 inverted(empty) bounds가 된다', () => {
    const out = createBounds();
    expandByInto(out, { minX: 0, minY: 0, maxX: 2, maxY: 2 }, -5);
    // maxX < minX 이므로 isEmpty가 true여야 한다
    expect(out.maxX).toBeLessThan(out.minX);
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: FlatBoundsWritable = { minX: 1, minY: 2, maxX: 7, maxY: 8 };
    expandByInto(bounds, bounds, 2);
    expect(bounds).toEqual({ minX: -1, minY: 0, maxX: 9, maxY: 10 });
  });
});

// ---------------------------------------------------------------------------
// expandToIncludePointInto
// ---------------------------------------------------------------------------
describe('bounds - expandToIncludePointInto', () => {
  test('내부 점은 bounds를 변경하지 않는다', () => {
    const out = createBounds();
    const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const result = expandToIncludePointInto(out, bounds, { x: 3, y: 3 });
    expect(out).toEqual({ minX: 0, minY: 0, maxX: 5, maxY: 5 });
    expect(result).toBe(out);
  });

  test('외부 점은 bounds를 확장한다', () => {
    const out = createBounds();
    const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    expandToIncludePointInto(out, bounds, { x: 8, y: 7 });
    expect(out).toEqual({ minX: 0, minY: 0, maxX: 8, maxY: 7 });
  });

  test('x만 밖에 있는 점', () => {
    const out = createBounds();
    const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    expandToIncludePointInto(out, bounds, { x: -2, y: 3 });
    expect(out).toEqual({ minX: -2, minY: 0, maxX: 5, maxY: 5 });
  });

  test('sentinel bounds + 점 → point bounds', () => {
    const out = createBounds();
    expandToIncludePointInto(out, flatSentinel(), { x: 3, y: 7 });
    expect(out).toEqual({ minX: 3, minY: 7, maxX: 3, maxY: 7 });
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: FlatBoundsWritable = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    expandToIncludePointInto(bounds, bounds, { x: 8, y: 7 });
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 8, maxY: 7 });
  });
});

// ---------------------------------------------------------------------------
// expandToIncludeBoundsInto
// ---------------------------------------------------------------------------
describe('bounds - expandToIncludeBoundsInto', () => {
  test('포함된 other는 bounds를 변경하지 않는다', () => {
    const out = createBounds();
    const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    const other = { minX: 2, minY: 2, maxX: 8, maxY: 8 };
    const result = expandToIncludeBoundsInto(out, bounds, other);
    expect(out).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
    expect(result).toBe(out);
  });

  test('외부 other는 bounds를 확장한다', () => {
    const out = createBounds();
    const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const other = { minX: 3, minY: 3, maxX: 9, maxY: 9 };
    expandToIncludeBoundsInto(out, bounds, other);
    expect(out).toEqual({ minX: 0, minY: 0, maxX: 9, maxY: 9 });
  });

  test('sentinel bounds + non-empty other → other의 endpoint 복사', () => {
    const out = createBounds();
    const other = { minX: 2, minY: 3, maxX: 7, maxY: 8 };
    expandToIncludeBoundsInto(out, flatSentinel(), other);
    expect(out).toEqual({ minX: 2, minY: 3, maxX: 7, maxY: 8 });
  });

  test('inverted other는 raw min/max를 그대로 적용한다', () => {
    // docs: expandToIncludeBoundsInto는 raw 자연식을 적용 - inverted b.min은 결과에 반영 안됨
    const out = createBounds();
    const bounds = { minX: 0, minY: 0, maxX: 2, maxY: 2 };
    const other = { minX: 20, minY: 20, maxX: 15, maxY: 15 };
    expandToIncludeBoundsInto(out, bounds, other);
    // new_min = min(0,20)=0, new_max = max(2,15)=15
    expect(out).toEqual({ minX: 0, minY: 0, maxX: 15, maxY: 15 });
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: FlatBoundsWritable = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const other = { minX: 3, minY: 3, maxX: 9, maxY: 9 };
    expandToIncludeBoundsInto(bounds, bounds, other);
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 9, maxY: 9 });
  });
});

// ---------------------------------------------------------------------------
// translateInto
// ---------------------------------------------------------------------------
describe('bounds - translateInto', () => {
  test('offset을 더해 bounds를 이동한다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    const result = translateInto(out, bounds, { x: 3, y: -1 });
    expect(out.min).toEqual({ x: 4, y: 1 });
    expect(out.max).toEqual({ x: 8, y: 5 });
    expect(result).toBe(out);
  });

  test('zero offset은 bounds를 변경하지 않는다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    translateInto(out, bounds, { x: 0, y: 0 });
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('sentinel bounds는 translate 후에도 sentinel과 동치이다', () => {
    const out = makeBounds();
    translateInto(out, sentinel(), { x: 5, y: 5 });
    expect(out.min.x).toBe(Infinity);
    expect(out.min.y).toBe(Infinity);
    expect(out.max.x).toBe(-Infinity);
    expect(out.max.y).toBe(-Infinity);
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: BoundsWritable = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    translateInto(bounds, bounds, { x: 3, y: -1 });
    expect(bounds.min).toEqual({ x: 4, y: 1 });
    expect(bounds.max).toEqual({ x: 8, y: 5 });
  });

  test('tuple offset 입력도 처리한다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    translateInto(out, bounds, [3, -1]);
    expect(out.min).toEqual({ x: 4, y: 1 });
    expect(out.max).toEqual({ x: 8, y: 5 });
  });

  test('tuple min/max bounds와 tuple offset 입력도 처리한다', () => {
    const out = makeBounds();
    const bounds = { min: [1, 2] as const, max: [5, 6] as const };
    translateInto(out, bounds, [3, -1]);
    expect(out.min).toEqual({ x: 4, y: 1 });
    expect(out.max).toEqual({ x: 8, y: 5 });
  });
});
