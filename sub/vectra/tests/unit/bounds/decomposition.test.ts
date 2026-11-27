/** 경계 상자의 꼭짓점과 변을 추출하는 정책을 시험한다. */

import { describe, expect, test } from 'vitest';
import { cornersInto } from '../../../src/bounds/corners-into';
import { sidesInto } from '../../../src/bounds/sides-into';
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';

// ────────────────────────────────────────────────────────────
// cornersInto
// ────────────────────────────────────────────────────────────

describe('cornersInto', () => {
  describe('object input', () => {
    test('4개 corner를 topLeft, topRight, bottomRight, bottomLeft 순서로 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { minX: 10, minY: 20, maxX: 40, maxY: 60 });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 10, y: 20 }); // topLeft = (minX, minY)
      expect(out[1]).toEqual({ x: 40, y: 20 }); // topRight = (maxX, minY)
      expect(out[2]).toEqual({ x: 40, y: 60 }); // bottomRight = (maxX, maxY)
      expect(out[3]).toEqual({ x: 10, y: 60 }); // bottomLeft = (minX, maxY)
    });

    test('호출 전 배열에 기존 값이 있어도 out.length = 0 후 새 object를 push한다', () => {
      const out: { x: number; y: number }[] = [
        { x: 999, y: 999 },
        { x: 888, y: 888 },
      ];
      cornersInto(out, { minX: 1, minY: 2, maxX: 3, maxY: 4 });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 1, y: 2 });
    });

    test('push된 object는 새 인스턴스이다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { minX: 0, minY: 0, maxX: 10, maxY: 10 });
      cornersInto(out, { minX: 5, minY: 5, maxX: 25, maxY: 25 });
      expect(out[0]).toEqual({ x: 5, y: 5 });
    });
  });

  describe('empty / inverted bounds', () => {
    test('inverted bounds에서도 raw 좌표로 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      // inverted: maxX < minX
      cornersInto(out, { minX: 20, minY: 0, maxX: 5, maxY: 10 });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 20, y: 0 }); // minX, minY
      expect(out[1]).toEqual({ x: 5, y: 0 }); // maxX, minY
      expect(out[2]).toEqual({ x: 5, y: 10 }); // maxX, maxY
      expect(out[3]).toEqual({ x: 20, y: 10 }); // minX, maxY
    });

    test('sentinel bounds에서도 raw Infinity 좌표로 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: Infinity, y: Infinity });
      expect(out[1]).toEqual({ x: -Infinity, y: Infinity });
      expect(out[2]).toEqual({ x: -Infinity, y: -Infinity });
      expect(out[3]).toEqual({ x: Infinity, y: -Infinity });
    });

    test('degenerate point bounds에서도 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { minX: 5, minY: 5, maxX: 5, maxY: 5 });
      expect(out).toHaveLength(4);
      for (const p of out) {
        expect(p).toEqual({ x: 5, y: 5 });
      }
    });
  });

  describe('line bounds', () => {
    test('수평선 bounds에서도 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { minX: 0, minY: 5, maxX: 10, maxY: 5 });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 0, y: 5 });
      expect(out[1]).toEqual({ x: 10, y: 5 });
      expect(out[2]).toEqual({ x: 10, y: 5 });
      expect(out[3]).toEqual({ x: 0, y: 5 });
    });
  });
});

// ────────────────────────────────────────────────────────────
// sidesInto
// ────────────────────────────────────────────────────────────

describe('sidesInto', () => {
  describe('object input', () => {
    test('4개 변을 top, right, bottom, left 순서로 push한다', () => {
      const out: SegmentWritable[] = [];
      sidesInto(out, { minX: 0, minY: 0, maxX: 10, maxY: 5 });
      expect(out).toHaveLength(4);
      // top: topLeft → topRight
      expect(out[0]).toEqual({ x1: 0, y1: 0, x2: 10, y2: 0 });
      // right: topRight → bottomRight
      expect(out[1]).toEqual({ x1: 10, y1: 0, x2: 10, y2: 5 });
      // bottom: bottomRight → bottomLeft
      expect(out[2]).toEqual({ x1: 10, y1: 5, x2: 0, y2: 5 });
      // left: bottomLeft → topLeft
      expect(out[3]).toEqual({ x1: 0, y1: 5, x2: 0, y2: 0 });
    });

    test('호출 전 배열에 기존 값이 있어도 out.length = 0 후 새 object를 push한다', () => {
      const prev = { x1: 999, y1: 999, x2: 999, y2: 999 };
      const out = [prev, prev, prev];
      sidesInto(out, { minX: 1, minY: 2, maxX: 4, maxY: 6 });
      expect(out).toHaveLength(4);
      expect(out[0]).not.toBe(prev);
    });

    test('push된 object는 새 SegmentWritable 인스턴스이다', () => {
      const out: SegmentWritable[] = [];
      sidesInto(out, { minX: 0, minY: 0, maxX: 10, maxY: 10 });
      const first = out[0];
      sidesInto(out, { minX: 5, minY: 5, maxX: 25, maxY: 25 });
      expect(out[0]).not.toBe(first);
    });
  });

  describe('empty / inverted bounds', () => {
    test('inverted bounds에서도 raw 좌표로 4개 변을 push한다', () => {
      const out: SegmentWritable[] = [];
      sidesInto(out, { minX: 20, minY: 0, maxX: 5, maxY: 10 });
      expect(out).toHaveLength(4);
      // topLeft=(20,0), topRight=(5,0), bottomRight=(5,10), bottomLeft=(20,10)
      expect(out[0]).toEqual({ x1: 20, y1: 0, x2: 5, y2: 0 }); // top
      expect(out[1]).toEqual({ x1: 5, y1: 0, x2: 5, y2: 10 }); // right
      expect(out[2]).toEqual({ x1: 5, y1: 10, x2: 20, y2: 10 }); // bottom
      expect(out[3]).toEqual({ x1: 20, y1: 10, x2: 20, y2: 0 }); // left
    });

    test('sentinel bounds에서도 raw Infinity 좌표로 4개 변을 push한다', () => {
      const out: SegmentWritable[] = [];
      sidesInto(out, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
      expect(out).toHaveLength(4);
      // topLeft=(Inf,Inf), topRight=(-Inf,Inf), bottomRight=(-Inf,-Inf), bottomLeft=(Inf,-Inf)
      expect(out[0]).toEqual({ x1: Infinity, y1: Infinity, x2: -Infinity, y2: Infinity });
    });
  });
});
