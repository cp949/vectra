import { describe, expect, test } from 'vitest';
import { cornersInto } from '../../../src/rect/corners-into';
import { fromCenterInto } from '../../../src/rect/from-center-into';
import { sameDimensions } from '../../../src/rect/same-dimensions';
import { sidesInto } from '../../../src/rect/sides-into';

// ────────────────────────────────────────────────────────────
// cornersInto
// ────────────────────────────────────────────────────────────

describe('cornersInto', () => {
  describe('object input', () => {
    test('4개 corner를 topLeft, topRight, bottomRight, bottomLeft 순서로 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { x: 10, y: 20, width: 30, height: 40 });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 10, y: 20 }); // topLeft
      expect(out[1]).toEqual({ x: 40, y: 20 }); // topRight
      expect(out[2]).toEqual({ x: 40, y: 60 }); // bottomRight
      expect(out[3]).toEqual({ x: 10, y: 60 }); // bottomLeft
    });

    test('호출 전 배열에 기존 값이 있어도 out.length = 0 후 새 object를 push한다', () => {
      const out: { x: number; y: number }[] = [
        { x: 999, y: 999 },
        { x: 888, y: 888 },
        { x: 777, y: 777 },
      ];
      cornersInto(out, { x: 1, y: 2, width: 3, height: 4 });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 1, y: 2 });
    });

    test('push된 object는 새 인스턴스이다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { x: 0, y: 0, width: 10, height: 10 });
      cornersInto(out, { x: 5, y: 5, width: 20, height: 20 });
      // 두 번째 호출 결과가 올바르게 반영된다
      expect(out[0]).toEqual({ x: 5, y: 5 });
    });
  });

  describe('tuple input', () => {
    test('tuple rect로부터 4개 corner를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, [0, 0, 100, 50] as const);
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 0, y: 0 }); // topLeft
      expect(out[1]).toEqual({ x: 100, y: 0 }); // topRight
      expect(out[2]).toEqual({ x: 100, y: 50 }); // bottomRight
      expect(out[3]).toEqual({ x: 0, y: 50 }); // bottomLeft
    });
  });

  describe('degenerate / empty rect', () => {
    test('zero width rect에서도 raw 좌표로 4개 point를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { x: 5, y: 5, width: 0, height: 10 });
      expect(out).toHaveLength(4);
      // topLeft = (5,5), topRight = (5,5), bottomRight = (5,15), bottomLeft = (5,15)
      expect(out[0]).toEqual({ x: 5, y: 5 });
      expect(out[1]).toEqual({ x: 5, y: 5 });
    });

    test('negative width rect에서도 raw 좌표로 4개 point를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { x: 10, y: 10, width: -5, height: 10 });
      expect(out).toHaveLength(4);
      // topLeft = (10,10), topRight = (5,10), bottomRight = (5,20), bottomLeft = (10,20)
      expect(out[0]).toEqual({ x: 10, y: 10 });
      expect(out[1]).toEqual({ x: 5, y: 10 });
      expect(out[2]).toEqual({ x: 5, y: 20 });
      expect(out[3]).toEqual({ x: 10, y: 20 });
    });

    test('zero size rect에서도 4개 point를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { x: 3, y: 7, width: 0, height: 0 });
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ x: 3, y: 7 });
      expect(out[1]).toEqual({ x: 3, y: 7 });
      expect(out[2]).toEqual({ x: 3, y: 7 });
      expect(out[3]).toEqual({ x: 3, y: 7 });
    });
  });

  describe('origin rect', () => {
    test('(0,0,0,0) rect에서 4개 모두 origin point를 push한다', () => {
      const out: { x: number; y: number }[] = [];
      cornersInto(out, { x: 0, y: 0, width: 0, height: 0 });
      expect(out).toHaveLength(4);
      for (const p of out) {
        expect(p).toEqual({ x: 0, y: 0 });
      }
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
      sidesInto(out, { x: 0, y: 0, width: 10, height: 5 });
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
      sidesInto(out, { x: 1, y: 2, width: 3, height: 4 });
      expect(out).toHaveLength(4);
      // 기존 object가 아닌 새 object가 push되었다
      expect(out[0]).not.toBe(prev);
    });

    test('push된 object는 새 SegmentWritable 인스턴스이다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, { x: 0, y: 0, width: 10, height: 10 });
      const first = out[0];
      sidesInto(out, { x: 5, y: 5, width: 20, height: 20 });
      // 두 번째 호출로 새 object가 push된다
      expect(out[0]).not.toBe(first);
    });
  });

  describe('tuple input', () => {
    test('tuple rect로부터 4개 변을 push한다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, [0, 0, 10, 5] as const);
      expect(out).toHaveLength(4);
      expect(out[0]).toEqual({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } }); // top
      expect(out[3]).toEqual({ a: { x: 0, y: 5 }, b: { x: 0, y: 0 } }); // left
    });
  });

  describe('degenerate / empty rect', () => {
    test('empty rect에서도 raw 좌표로 4개 변을 push한다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, { x: 0, y: 0, width: 0, height: 0 });
      expect(out).toHaveLength(4);
      // zero-length side도 그대로 push한다
      for (const side of out) {
        expect(side.a).toEqual({ x: 0, y: 0 });
        expect(side.b).toEqual({ x: 0, y: 0 });
      }
    });

    test('negative dimension rect에서도 raw 좌표로 4개 변을 push한다', () => {
      const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
      sidesInto(out, { x: 10, y: 10, width: -4, height: -2 });
      expect(out).toHaveLength(4);
      // topRight = (6,10), bottomRight = (6,8), bottomLeft = (10,8)
      expect(out[0]).toEqual({ a: { x: 10, y: 10 }, b: { x: 6, y: 10 } }); // top
      expect(out[1]).toEqual({ a: { x: 6, y: 10 }, b: { x: 6, y: 8 } }); // right
      expect(out[2]).toEqual({ a: { x: 6, y: 8 }, b: { x: 10, y: 8 } }); // bottom
      expect(out[3]).toEqual({ a: { x: 10, y: 8 }, b: { x: 10, y: 10 } }); // left
    });
  });
});

// ────────────────────────────────────────────────────────────
// fromCenterInto
// ────────────────────────────────────────────────────────────

describe('fromCenterInto', () => {
  describe('object input', () => {
    test('center와 size로 rect를 구성하여 out에 기록한다', () => {
      const out = { x: 0, y: 0, width: 0, height: 0 };
      const result = fromCenterInto(out, { x: 10, y: 20 }, { x: 6, y: 4 });
      // x = center.x - width/2, y = center.y - height/2
      expect(result).toBe(out);
      expect(out).toEqual({ x: 7, y: 18, width: 6, height: 4 });
    });

    test('out을 반환한다', () => {
      const out = { x: 0, y: 0, width: 0, height: 0 };
      const result = fromCenterInto(out, { x: 0, y: 0 }, { x: 10, y: 10 });
      expect(result).toBe(out);
    });
  });

  describe('tuple input', () => {
    test('tuple center와 tuple size로 rect를 구성한다', () => {
      const out = { x: 0, y: 0, width: 0, height: 0 };
      fromCenterInto(out, [5, 10] as const, [8, 6] as const);
      // x = 5 - 4 = 1, y = 10 - 3 = 7
      expect(out).toEqual({ x: 1, y: 7, width: 8, height: 6 });
    });
  });

  describe('origin / degenerate', () => {
    test('center (0,0), size (0,0)이면 (0,0,0,0) rect를 기록한다', () => {
      const out = { x: 99, y: 99, width: 99, height: 99 };
      fromCenterInto(out, { x: 0, y: 0 }, { x: 0, y: 0 });
      expect(out).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    test('홀수 size에서도 산술 그대로 기록한다', () => {
      const out = { x: 0, y: 0, width: 0, height: 0 };
      fromCenterInto(out, { x: 5, y: 5 }, { x: 3, y: 5 });
      // x = 5 - 1.5 = 3.5, y = 5 - 2.5 = 2.5
      expect(out.x).toBeCloseTo(3.5);
      expect(out.y).toBeCloseTo(2.5);
      expect(out.width).toBe(3);
      expect(out.height).toBe(5);
    });
  });
});

// ────────────────────────────────────────────────────────────
// sameDimensions
// ────────────────────────────────────────────────────────────

describe('sameDimensions', () => {
  describe('같은 width/height', () => {
    test('두 rect의 width와 height가 같으면 true를 반환한다', () => {
      expect(sameDimensions({ x: 0, y: 0, width: 5, height: 3 }, { x: 10, y: 20, width: 5, height: 3 })).toBe(true);
    });

    test('위치가 달라도 width/height가 같으면 true를 반환한다', () => {
      expect(
        sameDimensions({ x: -100, y: -50, width: 10, height: 20 }, { x: 500, y: 300, width: 10, height: 20 })
      ).toBe(true);
    });

    test('두 rect가 완전히 같으면 true를 반환한다', () => {
      expect(sameDimensions({ x: 5, y: 5, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    });
  });

  describe('다른 width/height', () => {
    test('width가 다르면 false를 반환한다', () => {
      expect(sameDimensions({ x: 0, y: 0, width: 5, height: 3 }, { x: 0, y: 0, width: 6, height: 3 })).toBe(false);
    });

    test('height가 다르면 false를 반환한다', () => {
      expect(sameDimensions({ x: 0, y: 0, width: 5, height: 3 }, { x: 0, y: 0, width: 5, height: 4 })).toBe(false);
    });

    test('width/height 모두 다르면 false를 반환한다', () => {
      expect(sameDimensions({ x: 0, y: 0, width: 5, height: 3 }, { x: 0, y: 0, width: 10, height: 6 })).toBe(false);
    });
  });

  describe('tuple input', () => {
    test('tuple input에서도 width/height를 비교한다', () => {
      expect(sameDimensions([0, 0, 5, 3] as const, [10, 20, 5, 3] as const)).toBe(true);
      expect(sameDimensions([0, 0, 5, 3] as const, [10, 20, 5, 4] as const)).toBe(false);
    });
  });

  describe('degenerate', () => {
    test('두 rect 모두 zero size이면 true를 반환한다', () => {
      expect(sameDimensions({ x: 1, y: 2, width: 0, height: 0 }, { x: 3, y: 4, width: 0, height: 0 })).toBe(true);
    });

    test('negative dimension도 raw 값으로 비교한다', () => {
      expect(sameDimensions({ x: 0, y: 0, width: -5, height: 3 }, { x: 0, y: 0, width: -5, height: 3 })).toBe(true);
      expect(sameDimensions({ x: 0, y: 0, width: -5, height: 3 }, { x: 0, y: 0, width: 5, height: 3 })).toBe(false);
    });
  });
});
