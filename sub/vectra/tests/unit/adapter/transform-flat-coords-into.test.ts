import { describe, expect, it } from 'vitest';
import { transformFlatCoordsInto } from '../../../src/adapter/flat/transform-flat-coords-into';
import type { MatrixLike } from '../../../src/types/index';

describe('transformFlatCoordsInto', () => {
  describe('빈 배열 입력', () => {
    it('out을 그대로 유지한다', () => {
      const out: number[] = [];
      const identity: MatrixLike = [1, 0, 0, 1, 0, 0];
      transformFlatCoordsInto(out, [], identity);
      expect(out).toEqual([]);
    });
  });

  describe('identity matrix', () => {
    it('object identity matrix — 좌표가 변하지 않는다', () => {
      const out = new Array<number>(4);
      const identity: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      transformFlatCoordsInto(out, [3, 4, -1, 2], identity);
      expect(out[0]).toBe(3);
      expect(out[1]).toBe(4);
      expect(out[2]).toBe(-1);
      expect(out[3]).toBe(2);
    });

    it('tuple identity matrix — 좌표가 변하지 않는다', () => {
      const out = new Array<number>(4);
      const identity: MatrixLike = [1, 0, 0, 1, 0, 0];
      transformFlatCoordsInto(out, [3, 4, -1, 2], identity);
      expect(out[0]).toBe(3);
      expect(out[1]).toBe(4);
      expect(out[2]).toBe(-1);
      expect(out[3]).toBe(2);
    });
  });

  describe('이동(translate) matrix', () => {
    it('tx=10, ty=20 이동이 적용된다 (object)', () => {
      const out = new Array<number>(4);
      const translate: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
      transformFlatCoordsInto(out, [0, 0, 5, 5], translate);
      expect(out[0]).toBe(10);
      expect(out[1]).toBe(20);
      expect(out[2]).toBe(15);
      expect(out[3]).toBe(25);
    });

    it('tx=10, ty=20 이동이 적용된다 (tuple)', () => {
      const out = new Array<number>(4);
      const translate: MatrixLike = [1, 0, 0, 1, 10, 20];
      transformFlatCoordsInto(out, [0, 0, 5, 5], translate);
      expect(out[0]).toBe(10);
      expect(out[1]).toBe(20);
      expect(out[2]).toBe(15);
      expect(out[3]).toBe(25);
    });
  });

  describe('scale matrix', () => {
    it('2배 scale이 적용된다', () => {
      const out = new Array<number>(4);
      const scale: MatrixLike = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
      transformFlatCoordsInto(out, [3, 4, -1, 2], scale);
      expect(out[0]).toBe(6);
      expect(out[1]).toBe(8);
      expect(out[2]).toBe(-2);
      expect(out[3]).toBe(4);
    });
  });

  describe('aliasing — out === flat', () => {
    it('in-place 변환이 올바르게 동작한다 (identity)', () => {
      const buf = [1, 2, 3, 4];
      const identity: MatrixLike = [1, 0, 0, 1, 0, 0];
      transformFlatCoordsInto(buf, buf, identity);
      expect(buf).toEqual([1, 2, 3, 4]);
    });

    it('in-place 이동 변환이 올바르게 동작한다', () => {
      const buf = [0, 0, 5, 5];
      const translate: MatrixLike = [1, 0, 0, 1, 10, 20];
      transformFlatCoordsInto(buf, buf, translate);
      expect(buf[0]).toBe(10);
      expect(buf[1]).toBe(20);
      expect(buf[2]).toBe(15);
      expect(buf[3]).toBe(25);
    });

    it('in-place 2배 scale 변환이 올바르게 동작한다', () => {
      const buf = [1, 2, 3, 4];
      const scale: MatrixLike = [2, 0, 0, 2, 0, 0];
      transformFlatCoordsInto(buf, buf, scale);
      expect(buf).toEqual([2, 4, 6, 8]);
    });
  });

  describe('홀수 길이 입력 — 마지막 x 무시', () => {
    it('길이 3이면 첫 쌍만 변환한다', () => {
      const out = new Array<number>(2);
      const translate: MatrixLike = [1, 0, 0, 1, 5, 10];
      transformFlatCoordsInto(out, [1, 2, 99], translate);
      expect(out[0]).toBe(6);
      expect(out[1]).toBe(12);
    });
  });

  describe('affine transform (회전 포함)', () => {
    it('90도 회전 matrix — x→y, y→-x', () => {
      const out = new Array<number>(4);
      // 90도 회전: a=0, b=1, c=-1, d=0, tx=0, ty=0
      // [x, y] → [0*x + (-1)*y, 1*x + 0*y] = [-y, x]
      const rotate90: MatrixLike = { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 };
      transformFlatCoordsInto(out, [1, 0, 0, 1], rotate90);
      // [1, 0] → [0*1 + -1*0, 1*1 + 0*0] = [0, 1]
      expect(out[0]).toBeCloseTo(0);
      expect(out[1]).toBeCloseTo(1);
      // [0, 1] → [0*0 + -1*1, 1*0 + 0*1] = [-1, 0]
      expect(out[2]).toBeCloseTo(-1);
      expect(out[3]).toBeCloseTo(0);
    });
  });
});
