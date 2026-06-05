import { describe, expect, it } from 'vitest';
import { fromFloat32Array } from '../../../src/adapter/flat/from-float32-array';
import { fromFloat32ArrayInto } from '../../../src/adapter/flat/from-float32-array-into';

// ─────────────────────────────────────────────────────────────────────────────
// fromFloat32Array — companion 기본 동작
// ─────────────────────────────────────────────────────────────────────────────

describe('fromFloat32Array — 새 배열 반환', () => {
  it('빈 Float32Array이면 빈 배열을 반환한다', () => {
    expect(fromFloat32Array(new Float32Array(0))).toEqual([]);
  });

  it('두 포인트를 새 배열로 반환한다', () => {
    const result = fromFloat32Array(new Float32Array([1, 2, 3, 4]));
    expect(result).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it('세 포인트를 새 배열로 반환한다', () => {
    const result = fromFloat32Array(new Float32Array([10, 20, 30, 40, 50, 60]));
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ x: 10, y: 20 });
    expect(result[1]).toEqual({ x: 30, y: 40 });
    expect(result[2]).toEqual({ x: 50, y: 60 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fromFloat32Array — Into 결과와 동등
// ─────────────────────────────────────────────────────────────────────────────

describe('fromFloat32Array — fromFloat32ArrayInto 결과와 동등', () => {
  it('단일 포인트 결과가 Into와 deep equal이다', () => {
    const flat = new Float32Array([5, 10]);
    const out: { x: number; y: number }[] = [];
    fromFloat32ArrayInto(out, flat);
    expect(fromFloat32Array(flat)).toEqual(out);
  });

  it('세 포인트 결과가 Into와 deep equal이다', () => {
    const flat = new Float32Array([1, 2, 3, 4, 5, 6]);
    const out: { x: number; y: number }[] = [];
    fromFloat32ArrayInto(out, flat);
    expect(fromFloat32Array(flat)).toEqual(out);
  });

  it('홀수 길이 Float32Array는 Into 결과와 동등하다', () => {
    const flat = new Float32Array([1, 2, 3]);
    const out: { x: number; y: number }[] = [];
    fromFloat32ArrayInto(out, flat);
    expect(fromFloat32Array(flat)).toEqual(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fromFloat32Array — float32 precision
// ─────────────────────────────────────────────────────────────────────────────

describe('fromFloat32Array — float32 precision 유지', () => {
  it('float32 → float64 변환으로 precision 손실이 발생할 수 있다', () => {
    const x = Math.fround(1 / 3);
    const y = Math.fround(2 / 3);
    const result = fromFloat32Array(new Float32Array([x, y]));
    expect(result[0].x).toBe(x);
    expect(result[0].y).toBe(y);
  });

  it('float32 범위 내 정수는 손실 없다', () => {
    const result = fromFloat32Array(new Float32Array([100, 200, -50, 75]));
    expect(result[0]).toEqual({ x: 100, y: 200 });
    expect(result[1]).toEqual({ x: -50, y: 75 });
  });
});
