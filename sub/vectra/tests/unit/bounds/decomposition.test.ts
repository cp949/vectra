import { describe, expect, test } from 'vitest';
import { cornersInto } from '../../../src/bounds/corners-into';
import { sidesInto } from '../../../src/bounds/sides-into';

// ────────────────────────────────────────────────────────────
// cornersInto
// ────────────────────────────────────────────────────────────

describe('cornersInto', () => {
  describe('object input', () => {
    test('4개 corner를 topLeft, topRight, bottomRight, bottomLeft 순서로 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { min: { x: 10, y: 20 }, max: { x: 40, y: 60 } });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 10, y: 20 }); // topLeft = (min.x, min.y)
      expect(out[1]).toEqual({ x: 40, y: 20 }); // topRight = (max.x, min.y)
      expect(out[2]).toEqual({ x: 40, y: 60 }); // bottomRight = (max.x, max.y)
      expect(out[3]).toEqual({ x: 10, y: 60 }); // bottomLeft = (min.x, max.y)
    });

    test('호출 전 배열에 기존 값이 있어도 out.length = 0 후 새 object를 push한다', () => {
      const out: { x: number; y: number }[] = [
        { x: 999, y: 999 },
        { x: 888, y: 888 },
      ];
      cornersInto(out, { min: { x: 1, y: 2 }, max: { x: 3, y: 4 } });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 1, y: 2 });
    });

    test('push된 object는 새 인스턴스이다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } });
      cornersInto(out, { min: { x: 5, y: 5 }, max: { x: 25, y: 25 } });
      expect(out[0]).toEqual({ x: 5, y: 5 });
    });
  });

  describe('tuple input', () => {
    test('tuple bounds로부터 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, [
        [0, 0],
        [100, 50],
      ] as const);
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 0, y: 0 }); // topLeft
      expect(out[1]).toEqual({ x: 100, y: 0 }); // topRight
      expect(out[2]).toEqual({ x: 100, y: 50 }); // bottomRight
      expect(out[3]).toEqual({ x: 0, y: 50 }); // bottomLeft
    });

    test('tuple point를 포함한 tuple bounds', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, [
        [5, 10],
        [20, 30],
      ] as const);
      expect(out[0]).toEqual({ x: 5, y: 10 });
      expect(out[1]).toEqual({ x: 20, y: 10 });
      expect(out[2]).toEqual({ x: 20, y: 30 });
      expect(out[3]).toEqual({ x: 5, y: 30 });
    });
  });

  describe('empty / inverted bounds', () => {
    test('inverted bounds에서도 raw 좌표로 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      // inverted: max.x < min.x
      cornersInto(out, { min: { x: 20, y: 0 }, max: { x: 5, y: 10 } });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 20, y: 0 }); // min.x, min.y
      expect(out[1]).toEqual({ x: 5, y: 0 }); // max.x, min.y
      expect(out[2]).toEqual({ x: 5, y: 10 }); // max.x, max.y
      expect(out[3]).toEqual({ x: 20, y: 10 }); // min.x, max.y
    });

    test('sentinel bounds에서도 raw Infinity 좌표로 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: Infinity, y: Infinity });
      expect(out[1]).toEqual({ x: -Infinity, y: Infinity });
      expect(out[2]).toEqual({ x: -Infinity, y: -Infinity });
      expect(out[3]).toEqual({ x: Infinity, y: -Infinity });
    });

    test('degenerate point bounds에서도 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { min: { x: 5, y: 5 }, max: { x: 5, y: 5 } });
      expect(out).toHaveLength(4);
      for (const p of out) {
        expect(p).toEqual({ x: 5, y: 5 });
      }
    });
  });

  describe('line bounds', () => {
    test('수평선 bounds에서도 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { min: { x: 0, y: 5 }, max: { x: 10, y: 5 } });
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
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 5 } });
      expect(out).toHaveLength(4);
      // top: topLeft → topRight
      expect(out[0]).toEqual({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } });
      // right: topRight → bottomRight
      expect(out[1]).toEqual({ a: { x: 10, y: 0 }, b: { x: 10, y: 5 } });
      // bottom: bottomRight → bottomLeft
      expect(out[2]).toEqual({ a: { x: 10, y: 5 }, b: { x: 0, y: 5 } });
      // left: bottomLeft → topLeft
      expect(out[3]).toEqual({ a: { x: 0, y: 5 }, b: { x: 0, y: 0 } });
    });

    test('호출 전 배열에 기존 값이 있어도 out.length = 0 후 새 object를 push한다', () => {
      const prev = { a: { x: 999, y: 999 }, b: { x: 999, y: 999 } };
      const out = [prev, prev, prev];
      sidesInto(out, { min: { x: 1, y: 2 }, max: { x: 4, y: 6 } });
      expect(out).toHaveLength(4);
      expect(out[0]).not.toBe(prev);
    });

    test('push된 object는 새 SegmentWritable 인스턴스이다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } });
      const first = out[0];
      sidesInto(out, { min: { x: 5, y: 5 }, max: { x: 25, y: 25 } });
      expect(out[0]).not.toBe(first);
    });
  });

  describe('tuple input', () => {
    test('tuple bounds로부터 4개 변을 push한다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, [
        [0, 0],
        [10, 5],
      ] as const);
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } }); // top
      expect(out[3]).toEqual({ a: { x: 0, y: 5 }, b: { x: 0, y: 0 } }); // left
    });
  });

  describe('empty / inverted bounds', () => {
    test('inverted bounds에서도 raw 좌표로 4개 변을 push한다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, { min: { x: 20, y: 0 }, max: { x: 5, y: 10 } });
      expect(out).toHaveLength(4);
      // topLeft=(20,0), topRight=(5,0), bottomRight=(5,10), bottomLeft=(20,10)
      expect(out[0]).toEqual({ a: { x: 20, y: 0 }, b: { x: 5, y: 0 } }); // top
      expect(out[1]).toEqual({ a: { x: 5, y: 0 }, b: { x: 5, y: 10 } }); // right
      expect(out[2]).toEqual({ a: { x: 5, y: 10 }, b: { x: 20, y: 10 } }); // bottom
      expect(out[3]).toEqual({ a: { x: 20, y: 10 }, b: { x: 20, y: 0 } }); // left
    });

    test('sentinel bounds에서도 raw Infinity 좌표로 4개 변을 push한다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } });
      expect(out).toHaveLength(4);
      // topLeft=(Inf,Inf), topRight=(-Inf,Inf), bottomRight=(-Inf,-Inf), bottomLeft=(Inf,-Inf)
      expect(out[0].a).toEqual({ x: Infinity, y: Infinity });
      expect(out[0].b).toEqual({ x: -Infinity, y: Infinity });
    });
  });
});
