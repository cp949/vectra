import { describe, expect, it } from 'vitest';
import { fromFloat32ArrayInto } from '../../../src/adapter/flat/from-float32-array-into';

describe('fromFloat32ArrayInto', () => {
  describe('빈 배열 입력', () => {
    it('out을 그대로 유지한다', () => {
      const out: { x: number; y: number }[] = [];
      fromFloat32ArrayInto(out, new Float32Array(0));
      expect(out).toHaveLength(0);
    });
  });

  describe('짝수 길이 정상 입력', () => {
    it('단일 포인트를 out에 추가한다', () => {
      const out: { x: number; y: number }[] = [];
      fromFloat32ArrayInto(out, new Float32Array([1, 2]));
      expect(out).toHaveLength(1);
      expect(out[0]).toEqual({ x: 1, y: 2 });
    });

    it('두 포인트를 out에 추가한다', () => {
      const out: { x: number; y: number }[] = [];
      fromFloat32ArrayInto(out, new Float32Array([1, 2, 3, 4]));
      expect(out).toHaveLength(2);
      expect(out[0]).toEqual({ x: 1, y: 2 });
      expect(out[1]).toEqual({ x: 3, y: 4 });
    });
  });

  describe('홀수 길이 입력 — 마지막 x 무시', () => {
    it('길이 1이면 완전한 쌍이 없으므로 out은 비어 있다', () => {
      const out: { x: number; y: number }[] = [];
      fromFloat32ArrayInto(out, new Float32Array([1]));
      expect(out).toHaveLength(0);
    });

    it('길이 3이면 첫 쌍만 처리한다', () => {
      const out: { x: number; y: number }[] = [];
      fromFloat32ArrayInto(out, new Float32Array([1, 2, 3]));
      expect(out).toHaveLength(1);
      expect(out[0]).toEqual({ x: 1, y: 2 });
    });
  });

  describe('기존 out 요소 재사용', () => {
    it('out에 이미 객체가 있으면 x/y를 덮어쓴다', () => {
      const existing = { x: 99, y: 99 };
      const out = [existing];
      fromFloat32ArrayInto(out, new Float32Array([1, 2]));
      expect(out[0]).toBe(existing);
      expect(out[0].x).toBe(1);
      expect(out[0].y).toBe(2);
    });
  });

  describe('float32 precision loss round-trip', () => {
    it('float32 precision이 유지된다 (float32로 저장된 값 그대로)', () => {
      const x = Math.fround(1 / 3);
      const y = Math.fround(2 / 3);
      const flat = new Float32Array([x, y]);
      const out: { x: number; y: number }[] = [];
      fromFloat32ArrayInto(out, flat);
      expect(out[0].x).toBe(x);
      expect(out[0].y).toBe(y);
    });

    it('toFloat32ArrayInto → fromFloat32ArrayInto round-trip: float32 범위 내 정수는 손실 없다', () => {
      const flat = new Float32Array([100, 200, -50, 75]);
      const out: { x: number; y: number }[] = [];
      fromFloat32ArrayInto(out, flat);
      expect(out[0]).toEqual({ x: 100, y: 200 });
      expect(out[1]).toEqual({ x: -50, y: 75 });
    });
  });
});
