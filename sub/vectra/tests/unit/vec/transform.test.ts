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

  test('tuple input을 받는다', () => {
    const out = { x: 0, y: 0 };
    transformInto(out, [2, 3] as const, IDENTITY);
    expect(out.x).toBe(2);
    expect(out.y).toBe(3);
  });

  test('tuple output에 기록한다', () => {
    const out: [number, number] = [0, 0];
    const result = transformInto(out, { x: 2, y: 3 }, IDENTITY);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
    expect(result).toBe(out);
  });

  test('tuple matrix input을 받는다', () => {
    const m: [number, number, number, number, number, number] = [2, 0, 0, 2, 1, 1];
    const out = { x: 0, y: 0 };
    transformInto(out, { x: 3, y: 4 }, m);
    expect(out.x).toBe(7);
    expect(out.y).toBe(9);
  });

  test('object self-aliasing: transformInto(pt, pt, m)이 안전하다', () => {
    const pt = { x: 3, y: 4 };
    const m = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    transformInto(pt, pt, m);
    expect(pt.x).toBe(13);
    expect(pt.y).toBe(24);
  });

  test('tuple self-aliasing: transformInto(tup, tup, m)이 안전하다', () => {
    const tup: [number, number] = [3, 4];
    const m = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const result = transformInto(tup, tup, m);
    expect(tup[0]).toBe(13);
    expect(tup[1]).toBe(24);
    expect(result).toBe(tup);
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
