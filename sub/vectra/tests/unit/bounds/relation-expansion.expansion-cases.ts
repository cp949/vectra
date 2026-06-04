import { describe, expect, test } from 'vitest';
import { expandByInto } from '../../../src/bounds/expand-by-into';
import { expandToIncludeBoundsInto } from '../../../src/bounds/expand-to-include-bounds-into';
import { expandToIncludePointInto } from '../../../src/bounds/expand-to-include-point-into';
import { translateInto } from '../../../src/bounds/translate-into';
import { unionInto } from '../../../src/bounds/union-into';
import type { BoundsWritable } from '../../../src/types';
import { makeBounds, sentinel } from './relation-expansion.helpers';

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
    const out = makeBounds();
    const result = expandByInto(out, { min: { x: 1, y: 2 }, max: { x: 7, y: 8 } }, 2);
    expect(out.min).toEqual({ x: -1, y: 0 });
    expect(out.max).toEqual({ x: 9, y: 10 });
    expect(result).toBe(out);
  });

  test('음수 amount(deflate)를 정규화 없이 적용한다', () => {
    const out = makeBounds();
    expandByInto(out, { min: { x: 0, y: 0 }, max: { x: 6, y: 6 } }, -2);
    expect(out.min).toEqual({ x: 2, y: 2 });
    expect(out.max).toEqual({ x: 4, y: 4 });
  });

  test('deflate가 너무 크면 inverted(empty) bounds가 된다', () => {
    const out = makeBounds();
    expandByInto(out, { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } }, -5);
    // max.x < min.x 이므로 isEmpty가 true여야 한다
    expect(out.max.x).toBeLessThan(out.min.x);
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: BoundsWritable = { min: { x: 1, y: 2 }, max: { x: 7, y: 8 } };
    expandByInto(bounds, bounds, 2);
    expect(bounds.min).toEqual({ x: -1, y: 0 });
    expect(bounds.max).toEqual({ x: 9, y: 10 });
  });

  test('tuple min/max 입력도 처리한다', () => {
    const out = makeBounds();
    expandByInto(out, { min: [1, 2], max: [7, 8] }, 1);
    expect(out.min).toEqual({ x: 0, y: 1 });
    expect(out.max).toEqual({ x: 8, y: 9 });
  });
});

// ---------------------------------------------------------------------------
// expandToIncludePointInto
// ---------------------------------------------------------------------------
describe('bounds - expandToIncludePointInto', () => {
  test('내부 점은 bounds를 변경하지 않는다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const result = expandToIncludePointInto(out, bounds, { x: 3, y: 3 });
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 5, y: 5 });
    expect(result).toBe(out);
  });

  test('외부 점은 bounds를 확장한다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    expandToIncludePointInto(out, bounds, { x: 8, y: 7 });
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 8, y: 7 });
  });

  test('x만 밖에 있는 점', () => {
    const out = makeBounds();
    const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    expandToIncludePointInto(out, bounds, { x: -2, y: 3 });
    expect(out.min).toEqual({ x: -2, y: 0 });
    expect(out.max).toEqual({ x: 5, y: 5 });
  });

  test('sentinel bounds + 점 → point bounds', () => {
    const out = makeBounds();
    expandToIncludePointInto(out, sentinel(), { x: 3, y: 7 });
    expect(out.min).toEqual({ x: 3, y: 7 });
    expect(out.max).toEqual({ x: 3, y: 7 });
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    expandToIncludePointInto(bounds, bounds, { x: 8, y: 7 });
    expect(bounds.min).toEqual({ x: 0, y: 0 });
    expect(bounds.max).toEqual({ x: 8, y: 7 });
  });

  test('tuple point 입력도 처리한다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    expandToIncludePointInto(out, bounds, [8, 3]);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 8, y: 5 });
  });
});

// ---------------------------------------------------------------------------
// expandToIncludeBoundsInto
// ---------------------------------------------------------------------------
describe('bounds - expandToIncludeBoundsInto', () => {
  test('포함된 other는 bounds를 변경하지 않는다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
    const other = { min: { x: 2, y: 2 }, max: { x: 8, y: 8 } };
    const result = expandToIncludeBoundsInto(out, bounds, other);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 10, y: 10 });
    expect(result).toBe(out);
  });

  test('외부 other는 bounds를 확장한다', () => {
    const out = makeBounds();
    const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const other = { min: { x: 3, y: 3 }, max: { x: 9, y: 9 } };
    expandToIncludeBoundsInto(out, bounds, other);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 9, y: 9 });
  });

  test('sentinel bounds + non-empty other → other의 endpoint 복사', () => {
    const out = makeBounds();
    const other = { min: { x: 2, y: 3 }, max: { x: 7, y: 8 } };
    expandToIncludeBoundsInto(out, sentinel(), other);
    expect(out.min).toEqual({ x: 2, y: 3 });
    expect(out.max).toEqual({ x: 7, y: 8 });
  });

  test('inverted other는 raw min/max를 그대로 적용한다', () => {
    // docs: expandToIncludeBoundsInto는 raw 자연식을 적용 - inverted b.min은 결과에 반영 안됨
    const out = makeBounds();
    const bounds = { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } };
    const other = { min: { x: 20, y: 20 }, max: { x: 15, y: 15 } };
    expandToIncludeBoundsInto(out, bounds, other);
    // new_min = min(0,20)=0, new_max = max(2,15)=15
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 15, y: 15 });
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    const other = { min: { x: 3, y: 3 }, max: { x: 9, y: 9 } };
    expandToIncludeBoundsInto(bounds, bounds, other);
    expect(bounds.min).toEqual({ x: 0, y: 0 });
    expect(bounds.max).toEqual({ x: 9, y: 9 });
  });

  test('tuple min/max 입력도 처리한다', () => {
    const out = makeBounds();
    const bounds = { min: [0, 0] as const, max: [5, 5] as const };
    const other = { min: [3, 3] as const, max: [9, 9] as const };
    expandToIncludeBoundsInto(out, bounds, other);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 9, y: 9 });
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
