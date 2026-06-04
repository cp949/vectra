import { describe, expect, it } from 'vitest';
import { decodeFlatCoordsInto } from '../../../src/adapter/flat/decode-flat-coords-into';

describe('decodeFlatCoordsInto', () => {
  describe('빈 배열 입력', () => {
    it('out을 그대로 유지한다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, []);
      expect(out).toEqual([]);
    });
  });

  describe('짝수 길이 정상 입력', () => {
    it('단일 포인트를 out에 추가한다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, [1, 2]);
      expect(out).toHaveLength(1);
      expect(out[0]).toEqual({ x: 1, y: 2 });
    });

    it('두 포인트를 out에 추가한다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, [1, 2, 3, 4]);
      expect(out).toHaveLength(2);
      expect(out[0]).toEqual({ x: 1, y: 2 });
      expect(out[1]).toEqual({ x: 3, y: 4 });
    });

    it('세 포인트를 out에 추가한다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, [10, 20, 30, 40, 50, 60]);
      expect(out).toHaveLength(3);
      expect(out[0]).toEqual({ x: 10, y: 20 });
      expect(out[1]).toEqual({ x: 30, y: 40 });
      expect(out[2]).toEqual({ x: 50, y: 60 });
    });
  });

  describe('홀수 길이 입력 — 마지막 x 무시', () => {
    it('길이 1이면 완전한 쌍이 없으므로 out은 비어 있다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, [1]);
      expect(out).toHaveLength(0);
    });

    it('길이 3이면 첫 쌍만 처리하고 마지막 x를 무시한다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, [1, 2, 3]);
      expect(out).toHaveLength(1);
      expect(out[0]).toEqual({ x: 1, y: 2 });
    });

    it('길이 5이면 두 쌍만 처리하고 마지막 x를 무시한다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, [1, 2, 3, 4, 5]);
      expect(out).toHaveLength(2);
      expect(out[0]).toEqual({ x: 1, y: 2 });
      expect(out[1]).toEqual({ x: 3, y: 4 });
    });
  });

  describe('기존 out 요소 재사용', () => {
    it('out에 이미 객체가 있으면 x/y를 덮어쓴다', () => {
      const existing = { x: 99, y: 99 };
      const out = [existing];
      decodeFlatCoordsInto(out, [1, 2]);
      expect(out[0]).toBe(existing); // 동일 객체
      expect(out[0].x).toBe(1);
      expect(out[0].y).toBe(2);
    });
  });

  describe('음수 좌표', () => {
    it('음수 좌표를 올바르게 파싱한다', () => {
      const out: { x: number; y: number }[] = [];
      decodeFlatCoordsInto(out, [-5, -10, 3, -7]);
      expect(out[0]).toEqual({ x: -5, y: -10 });
      expect(out[1]).toEqual({ x: 3, y: -7 });
    });
  });
});
