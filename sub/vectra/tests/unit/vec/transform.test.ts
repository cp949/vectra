/** 평평한 행렬로 점을 변환할 때 이동, 회전, 크기 조절과 제자리 기록을 검증한다. */
import { describe, expect, test } from 'vitest';
import { transform } from '../../../src/vec/transform';
import { transformInto } from '../../../src/vec/transform-into';

// identity matrix: [a=1, b=0, c=0, d=1, tx=0, ty=0]
const IDENTITY = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

describe('transformInto — matrix point 변환 후 out에 기록', () => {
  test('identity matrix는 input 좌표를 유지한다', () => {
    const out = { x: 0, y: 0 };
    const result = transformInto(out, { x: 3, y: 4 }, IDENTITY);
    expect(out.x).toBe(3);
    expect(out.y).toBe(4);
    expect(result).toBe(out); // out reference 반환
  });

  test('translation matrix는 tx/ty를 포함한다', () => {
    const m = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: -3 };
    const out = { x: 0, y: 0 };
    transformInto(out, { x: 1, y: 2 }, m);
    expect(out.x).toBe(6);
    expect(out.y).toBe(-1);
  });

  test('scale matrix가 올바르게 동작한다', () => {
    const m = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    const out = { x: 0, y: 0 };
    transformInto(out, { x: 4, y: 5 }, m);
    expect(out.x).toBe(8);
    expect(out.y).toBe(15);
  });

  test('rotation matrix가 올바르게 동작한다 (약 90도)', () => {
    // 90도 회전: a=0, b=1, c=-1, d=0
    const m = { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 };
    const out = { x: 0, y: 0 };
    transformInto(out, { x: 1, y: 0 }, m);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(1);
  });

  test('배율과 이동을 함께 적용한다', () => {
    const m = { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 };
    const out = { x: 0, y: 0 };
    transformInto(out, { x: 3, y: 4 }, m);
    expect(out.x).toBe(7);
    expect(out.y).toBe(9);
  });

  test('object self-aliasing: transformInto(pt, pt, m)이 안전하다', () => {
    const pt = { x: 3, y: 4 };
    const m = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    expect(transformInto(pt, pt, m)).toBe(pt);
    expect(pt.x).toBe(13);
    expect(pt.y).toBe(24);
  });
});

describe('transform — 새 object 반환', () => {
  test('transform companion은 새 object를 반환한다', () => {
    const m = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 5 };
    const result = transform({ x: 1, y: 2 }, m);
    expect(result.x).toBe(6);
    expect(result.y).toBe(7);
  });
});
