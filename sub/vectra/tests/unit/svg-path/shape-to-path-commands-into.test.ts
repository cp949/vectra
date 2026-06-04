import { describe, expect, test } from 'vitest';
import { KAPPA } from '../../../src/path/path-ellipse-arc.internal';
import { shapeToPathCommands } from '../../../src/svg-path/shape-to-path-commands';
import { shapeToPathCommandsInto } from '../../../src/svg-path/shape-to-path-commands-into';
import type {
  PathCommand,
  SvgCircleShapeLike,
  SvgEllipseShapeLike,
  SvgLineShapeLike,
  SvgPolygonShapeLike,
  SvgPolylineShapeLike,
  SvgRectShapeLike,
} from '../../../src/types/index';

// ──────────────────────────────────────────────
// shapeToPathCommandsInto
// structural SVG shape attribute object → canonical absolute PathCommand[].
// out은 매 호출마다 clear 후 push한다. DOM/element/renderer는 다루지 않는다.
// ──────────────────────────────────────────────

describe('shapeToPathCommandsInto', () => {
  describe('line', () => {
    test('line shape는 move + line 2 command를 기록한다', () => {
      const shape: SvgLineShapeLike = { kind: 'line', x1: 0, y1: 1, x2: 2, y2: 3 };
      const out: PathCommand[] = [];
      const result = shapeToPathCommandsInto(out, shape);
      expect(result).toBe(out);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 1 },
        { kind: 'line', x: 2, y: 3 },
      ]);
    });
  });

  describe('rect (sharp)', () => {
    test('rx/ry 없으면 move + 3 line + close 5 command를 기록한다', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 1, y: 2, width: 3, height: 4 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([
        { kind: 'move', x: 1, y: 2 },
        { kind: 'line', x: 4, y: 2 },
        { kind: 'line', x: 4, y: 6 },
        { kind: 'line', x: 1, y: 6 },
        { kind: 'close' },
      ]);
    });

    test('rx === 0이면 sharp rect로 fallback', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 8, rx: 0, ry: 4 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(5);
      expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
      expect(out[4]).toEqual({ kind: 'close' });
    });

    test('ry === 0이면 sharp rect로 fallback', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 8, rx: 4, ry: 0 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(5);
    });

    test('rx 음수이면 sharp rect로 fallback', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 8, rx: -1, ry: 4 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(5);
    });
  });

  describe('rect (rounded)', () => {
    test('rx만 제공하면 ry도 같은 값으로 적용한다', () => {
      const onlyRx: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 10, rx: 2 };
      const both: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 10, rx: 2, ry: 2 };
      const outA: PathCommand[] = [];
      const outB: PathCommand[] = [];
      shapeToPathCommandsInto(outA, onlyRx);
      shapeToPathCommandsInto(outB, both);
      expect(outA).toEqual(outB);
    });

    test('ry만 제공하면 rx도 같은 값으로 적용한다', () => {
      const onlyRy: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 10, ry: 3 };
      const both: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 10, rx: 3, ry: 3 };
      const outA: PathCommand[] = [];
      const outB: PathCommand[] = [];
      shapeToPathCommandsInto(outA, onlyRy);
      shapeToPathCommandsInto(outB, both);
      expect(outA).toEqual(outB);
    });

    test('uniform rounded rect는 10 command를 기록한다', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 10, rx: 2, ry: 2 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(10);
      expect(out[0]).toEqual({ kind: 'move', x: 2, y: 0 });
      expect(out[9]).toEqual({ kind: 'close' });
    });

    test('non-uniform rx/ry는 x/y별로 KAPPA를 곱한 cubic handle을 생성한다', () => {
      const rx = 4;
      const ry = 2;
      const w = 20;
      const h = 10;
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: w, height: h, rx, ry };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(10);

      const kx = rx * KAPPA;
      const ky = ry * KAPPA;
      // index 0: move (rx, 0)
      expect(out[0]).toEqual({ kind: 'move', x: rx, y: 0 });
      // index 1: line to (w - rx, 0)
      expect(out[1]).toEqual({ kind: 'line', x: w - rx, y: 0 });
      // index 2: right-top corner cubic (w - rx, 0) → (w, ry)
      expect(out[2]).toEqual({
        kind: 'cubic',
        x1: w - rx + kx,
        y1: 0,
        x2: w,
        y2: ry - ky,
        x: w,
        y: ry,
      });
      // index 3: line to (w, h - ry)
      expect(out[3]).toEqual({ kind: 'line', x: w, y: h - ry });
      // index 4: right-bottom corner cubic (w, h - ry) → (w - rx, h)
      expect(out[4]).toEqual({
        kind: 'cubic',
        x1: w,
        y1: h - ry + ky,
        x2: w - rx + kx,
        y2: h,
        x: w - rx,
        y: h,
      });
      // index 5: line to (rx, h)
      expect(out[5]).toEqual({ kind: 'line', x: rx, y: h });
      // index 6: left-bottom corner cubic (rx, h) → (0, h - ry)
      expect(out[6]).toEqual({
        kind: 'cubic',
        x1: rx - kx,
        y1: h,
        x2: 0,
        y2: h - ry + ky,
        x: 0,
        y: h - ry,
      });
      // index 7: line to (0, ry)
      expect(out[7]).toEqual({ kind: 'line', x: 0, y: ry });
      // index 8: left-top corner cubic (0, ry) → (rx, 0)
      expect(out[8]).toEqual({
        kind: 'cubic',
        x1: 0,
        y1: ry - ky,
        x2: rx - kx,
        y2: 0,
        x: rx,
        y: 0,
      });
      // index 9: close
      expect(out[9]).toEqual({ kind: 'close' });
    });

    test('rx가 width/2보다 크면 width/2로 clamp', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 4, height: 10, rx: 10, ry: 2 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      // rx clamp → 2
      expect(out[0]).toEqual({ kind: 'move', x: 2, y: 0 });
      // 첫 line의 x도 width - clampedRx = 2
      expect(out[1]).toEqual({ kind: 'line', x: 2, y: 0 });
    });

    test('ry가 height/2보다 크면 height/2로 clamp', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 4, rx: 2, ry: 10 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      // ry clamp → 2. 우상 corner cubic end y = clampedRy = 2
      expect(out[2]).toMatchObject({ kind: 'cubic', y: 2 });
    });
  });

  describe('circle', () => {
    test('circle은 move(cx+r, cy) + 4 cubic + close 6 command를 기록한다', () => {
      const shape: SvgCircleShapeLike = { kind: 'circle', cx: 5, cy: 7, r: 3 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(6);
      expect(out[0]).toEqual({ kind: 'move', x: 8, y: 7 });
      expect(out[5]).toEqual({ kind: 'close' });
      // 첫 cubic의 endpoint는 (cx, cy + r)
      expect(out[1]).toMatchObject({ kind: 'cubic', x: 5, y: 10 });
    });
  });

  describe('ellipse', () => {
    test('ellipse는 move(cx+rx, cy) + 4 cubic + close 6 command를 기록한다', () => {
      const shape: SvgEllipseShapeLike = { kind: 'ellipse', cx: 0, cy: 0, rx: 4, ry: 2 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(6);
      expect(out[0]).toEqual({ kind: 'move', x: 4, y: 0 });
      expect(out[5]).toEqual({ kind: 'close' });
      expect(out[1]).toMatchObject({ kind: 'cubic', x: 0, y: 2 });
    });
  });

  describe('polyline', () => {
    test('점 0개는 빈 out을 반환한다', () => {
      const shape: SvgPolylineShapeLike = { kind: 'polyline', points: [] };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([]);
    });

    test('점 1개는 move만 기록한다', () => {
      const shape: SvgPolylineShapeLike = { kind: 'polyline', points: [{ x: 1, y: 2 }] };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([{ kind: 'move', x: 1, y: 2 }]);
    });

    test('점 N개는 move + line N-1을 기록한다. object와 tuple을 혼합 허용', () => {
      const shape: SvgPolylineShapeLike = {
        kind: 'polyline',
        points: [{ x: 0, y: 0 }, [1, 2], { x: 3, y: 4 }],
      };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 1, y: 2 },
        { kind: 'line', x: 3, y: 4 },
      ]);
    });
  });

  describe('polygon', () => {
    test('점 0개는 빈 out을 반환한다 (close 없음)', () => {
      const shape: SvgPolygonShapeLike = { kind: 'polygon', points: [] };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([]);
    });

    test('점 1개는 move + close를 기록한다', () => {
      const shape: SvgPolygonShapeLike = { kind: 'polygon', points: [{ x: 1, y: 2 }] };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([{ kind: 'move', x: 1, y: 2 }, { kind: 'close' }]);
    });

    test('점 N개는 move + line N-1 + close. object와 tuple을 혼합 허용', () => {
      const shape: SvgPolygonShapeLike = {
        kind: 'polygon',
        points: [{ x: 0, y: 0 }, [10, 0], { x: 10, y: 10 }],
      };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
        { kind: 'line', x: 10, y: 10 },
        { kind: 'close' },
      ]);
    });
  });

  describe('out 재사용', () => {
    test('기존 out 내용은 clear된 뒤 새로 기록된다', () => {
      const out: PathCommand[] = [
        { kind: 'move', x: 99, y: 99 },
        { kind: 'line', x: 88, y: 88 },
      ];
      const shape: SvgLineShapeLike = { kind: 'line', x1: 0, y1: 0, x2: 1, y2: 1 };
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 1, y: 1 },
      ]);
    });

    test('polyline 0개도 기존 out 내용을 clear한다', () => {
      const out: PathCommand[] = [{ kind: 'move', x: 1, y: 2 }];
      const shape: SvgPolylineShapeLike = { kind: 'polyline', points: [] };
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([]);
    });
  });

  describe('non-finite pass-through', () => {
    test('rect.rx = NaN은 sharp rect로 fallback된다 (corner cubic에 NaN 미전파)', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 8, rx: NaN, ry: 4 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(5);
      expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
      expect(out[4]).toEqual({ kind: 'close' });
      // sharp 경로는 rx/ry를 쓰지 않으므로 NaN 좌표가 발생하지 않는다.
      for (const cmd of out) {
        if (cmd.kind === 'move' || cmd.kind === 'line') {
          expect(Number.isFinite(cmd.x)).toBe(true);
          expect(Number.isFinite(cmd.y)).toBe(true);
        }
      }
    });

    test('rect.ry = NaN도 sharp rect로 fallback된다', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 0, y: 0, width: 10, height: 8, rx: 4, ry: NaN };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(5);
    });

    test('rect.rx = Infinity는 width/2로 clamp되어 finite cubic을 생성한다', () => {
      const shape: SvgRectShapeLike = {
        kind: 'rect',
        x: 0,
        y: 0,
        width: 10,
        height: 8,
        rx: Number.POSITIVE_INFINITY,
        ry: 2,
      };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(10);
      // 시작점 = (rx clamp = 5, 0)
      expect(out[0]).toEqual({ kind: 'move', x: 5, y: 0 });
    });

    test('line shape의 NaN 필드는 그대로 전파된다', () => {
      const shape: SvgLineShapeLike = { kind: 'line', x1: NaN, y1: 0, x2: 1, y2: 1 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(2);
      const first = out[0] as { kind: string; x: number; y: number };
      expect(first.kind).toBe('move');
      expect(Number.isNaN(first.x)).toBe(true);
    });

    test('circle.r = NaN은 cubic 좌표에 NaN을 전파한다', () => {
      const shape: SvgCircleShapeLike = { kind: 'circle', cx: 0, cy: 0, r: NaN };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(6);
      const first = out[0] as { kind: string; x: number; y: number };
      expect(Number.isNaN(first.x)).toBe(true);
    });

    test('ellipse.rx = Infinity, ry = -Infinity도 그대로 전파된다', () => {
      const shape: SvgEllipseShapeLike = {
        kind: 'ellipse',
        cx: 0,
        cy: 0,
        rx: Number.POSITIVE_INFINITY,
        ry: Number.NEGATIVE_INFINITY,
      };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(6);
      const first = out[0] as { kind: string; x: number; y: number };
      expect(first.x).toBe(Number.POSITIVE_INFINITY);
    });

    test('polyline points의 NaN x/y는 그대로 전파된다', () => {
      const shape: SvgPolylineShapeLike = {
        kind: 'polyline',
        points: [
          { x: 0, y: 0 },
          { x: NaN, y: 1 },
        ],
      };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(2);
      const second = out[1] as { kind: string; x: number; y: number };
      expect(Number.isNaN(second.x)).toBe(true);
    });
  });

  describe('degenerate width/height/r', () => {
    test('width = 0, height = 0, rx/ry 미지정은 sharp degenerate rect', () => {
      const shape: SvgRectShapeLike = { kind: 'rect', x: 1, y: 2, width: 0, height: 0 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toEqual([
        { kind: 'move', x: 1, y: 2 },
        { kind: 'line', x: 1, y: 2 },
        { kind: 'line', x: 1, y: 2 },
        { kind: 'line', x: 1, y: 2 },
        { kind: 'close' },
      ]);
    });

    test('circle.r = 0은 (cx, cy) 4개 cubic + close 6 command', () => {
      const shape: SvgCircleShapeLike = { kind: 'circle', cx: 3, cy: 4, r: 0 };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(out).toHaveLength(6);
      expect(out[0]).toEqual({ kind: 'move', x: 3, y: 4 });
      expect(out[5]).toEqual({ kind: 'close' });
    });
  });

  describe('input mutation 금지', () => {
    test('polyline points 배열을 mutate하지 않는다', () => {
      const points: { x: number; y: number }[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ];
      const snapshot = JSON.parse(JSON.stringify(points));
      const shape: SvgPolylineShapeLike = { kind: 'polyline', points };
      const out: PathCommand[] = [];
      shapeToPathCommandsInto(out, shape);
      expect(points).toEqual(snapshot);
    });
  });
});

describe('shapeToPathCommands', () => {
  test('새 PathCommand[]를 반환하고 Into 결과와 일치한다', () => {
    const shape: SvgPolylineShapeLike = {
      kind: 'polyline',
      points: [{ x: 0, y: 0 }, [1, 2], { x: 3, y: 4 }],
    };
    const intoOut: PathCommand[] = [];

    const result = shapeToPathCommands(shape);
    shapeToPathCommandsInto(intoOut, shape);

    expect(result).toEqual(intoOut);
    expect(result).not.toBe(intoOut);
  });
});
