/**
 * S3-RM-046 TASK-04 path.fromEllipse(Into) 단위 테스트.
 *
 * angle-uniform polygonal approximation: Move + (segments-1) Line + Close.
 * ellipseCommandsInto(4-cubic 근사)와는 별도 함수다.
 */
import { describe, expect, test } from 'vitest';
import { fromEllipse } from '../../../src/path/from-ellipse';
import { fromEllipseInto } from '../../../src/path/from-ellipse-into';
import type { EllipseLike, PathCommand } from '../../../src/types/index';

const unitEllipse: EllipseLike = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 };

describe('fromEllipseInto', () => {
  test('기본 segments=64: 1 Move + 63 Line + 1 Close', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse);
    expect(out).toHaveLength(65);
    expect(out[0].kind).toBe('move');
    for (let i = 1; i < 64; i++) {
      expect(out[i].kind).toBe('line');
    }
    expect(out[64].kind).toBe('close');
  });

  test('기본 startAngle=0이면 첫 점은 (cx+rx, cy)', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse);
    expect(out[0]).toEqual({ kind: 'move', x: 1, y: 0 });
  });

  test('segments=4: 4 commands + close', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse, { segments: 4 });
    expect(out).toHaveLength(5);
    expect(out[0]).toEqual({ kind: 'move', x: 1, y: 0 });
    // clockwise=true, step=2π/4=π/2 (positive direction for SVG y-down)
    // i=1 → angle=π/2 → (cos π/2, sin π/2)=(0,1)
    expect(out[1].kind).toBe('line');
    const cmd1 = out[1] as { x: number; y: number };
    expect(cmd1.x).toBeCloseTo(0, 10);
    expect(cmd1.y).toBeCloseTo(1, 10);
    // i=2 → angle=π → (-1, 0)
    const cmd2 = out[2] as { x: number; y: number };
    expect(cmd2.x).toBeCloseTo(-1, 10);
    expect(cmd2.y).toBeCloseTo(0, 10);
    expect(out[4]).toEqual({ kind: 'close' });
  });

  test('clockwise=false: sweep 방향 반전', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse, { segments: 4, clockwise: false });
    // step=-π/2. i=1 → angle=-π/2 → (0, -1)
    const cmd1 = out[1] as { x: number; y: number };
    expect(cmd1.x).toBeCloseTo(0, 10);
    expect(cmd1.y).toBeCloseTo(-1, 10);
  });

  test('startAngle 적용', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse, { segments: 4, startAngle: Math.PI / 2 });
    // 첫 점 = (cos π/2, sin π/2) = (0, 1)
    const m = out[0] as { x: number; y: number };
    expect(m.x).toBeCloseTo(0, 10);
    expect(m.y).toBeCloseTo(1, 10);
  });

  test('radii 비대칭 ellipse', () => {
    const ellipse: EllipseLike = { center: { x: 10, y: 20 }, radiusX: 5, radiusY: 3 };
    const out: PathCommand[] = [];
    fromEllipseInto(out, ellipse, { segments: 4 });
    // 첫 점 (10+5, 20) = (15, 20)
    expect(out[0]).toEqual({ kind: 'move', x: 15, y: 20 });
    const cmd1 = out[1] as { x: number; y: number };
    expect(cmd1.x).toBeCloseTo(10, 10);
    expect(cmd1.y).toBeCloseTo(23, 10);
  });

  test('empty ellipse (rx <= 0) → empty path', () => {
    const ellipse: EllipseLike = { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 1 };
    const out: PathCommand[] = [{ kind: 'close' }];
    fromEllipseInto(out, ellipse);
    expect(out).toEqual([]);
  });

  test('empty ellipse (ry <= 0) → empty path', () => {
    const ellipse: EllipseLike = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: -0.5 };
    const out: PathCommand[] = [];
    fromEllipseInto(out, ellipse);
    expect(out).toEqual([]);
  });

  test('segments=1: Move + Close (degenerate)', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse, { segments: 1 });
    expect(out).toEqual([{ kind: 'move', x: 1, y: 0 }, { kind: 'close' }]);
  });

  test('segments=2: Move + 1 Line + Close', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse, { segments: 2 });
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ kind: 'move', x: 1, y: 0 });
    expect(out[1].kind).toBe('line');
    expect(out[2]).toEqual({ kind: 'close' });
  });

  test('segments validation: 0이면 RangeError, out 미수정', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    expect(() => fromEllipseInto(out, unitEllipse, { segments: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ kind: 'close' }]);
  });

  test('segments validation: 음수면 RangeError', () => {
    const out: PathCommand[] = [];
    expect(() => fromEllipseInto(out, unitEllipse, { segments: -3 })).toThrow(RangeError);
  });

  test('segments validation: non-integer면 RangeError', () => {
    const out: PathCommand[] = [];
    expect(() => fromEllipseInto(out, unitEllipse, { segments: 3.5 })).toThrow(RangeError);
  });

  test('segments validation: NaN/Infinity면 RangeError', () => {
    const out: PathCommand[] = [];
    expect(() => fromEllipseInto(out, unitEllipse, { segments: Number.NaN })).toThrow(RangeError);
    expect(() => fromEllipseInto(out, unitEllipse, { segments: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('tuple ellipse 입력 지원', () => {
    const ellipse: EllipseLike = [{ x: 0, y: 0 }, 1, 1];
    const out: PathCommand[] = [];
    fromEllipseInto(out, ellipse, { segments: 4 });
    expect(out[0]).toEqual({ kind: 'move', x: 1, y: 0 });
  });

  test('returns out reference', () => {
    const out: PathCommand[] = [];
    const result = fromEllipseInto(out, unitEllipse, { segments: 4 });
    expect(result).toBe(out);
  });

  test('non-finite center: NaN/Infinity 좌표가 그대로 전파된다', () => {
    const nanCenter: EllipseLike = { center: { x: Number.NaN, y: 0 }, radiusX: 1, radiusY: 1 };
    const out: PathCommand[] = [];
    fromEllipseInto(out, nanCenter, { segments: 4 });
    expect(out).toHaveLength(5);
    expect(Number.isNaN((out[0] as { x: number }).x)).toBe(true);

    const infCenter: EllipseLike = { center: { x: 0, y: Number.POSITIVE_INFINITY }, radiusX: 1, radiusY: 1 };
    const out2: PathCommand[] = [];
    fromEllipseInto(out2, infCenter, { segments: 4 });
    expect((out2[0] as { y: number }).y).toBe(Number.POSITIVE_INFINITY);

    const negInfCenter: EllipseLike = { center: { x: Number.NEGATIVE_INFINITY, y: 0 }, radiusX: 1, radiusY: 1 };
    const out3: PathCommand[] = [];
    fromEllipseInto(out3, negInfCenter, { segments: 4 });
    expect((out3[0] as { x: number }).x).toBe(Number.NEGATIVE_INFINITY);
  });

  test('non-finite radii: NaN rx → 좌표 NaN으로 전파', () => {
    // empty ellipse 분기는 `rx <= 0 || ry <= 0`이다. NaN <= 0은 false라 분기가 발동하지 않고
    // 산술 경로로 흘러 첫 점 좌표 (cx + cos(0) * NaN) 등이 NaN으로 기록된다.
    const nanRx: EllipseLike = { center: { x: 0, y: 0 }, radiusX: Number.NaN, radiusY: 1 };
    const out: PathCommand[] = [];
    fromEllipseInto(out, nanRx, { segments: 4 });
    expect(out).toHaveLength(5);
    expect(Number.isNaN((out[0] as { x: number }).x)).toBe(true);
  });

  test('non-finite startAngle: Infinity → trig NaN → 좌표 NaN', () => {
    const out: PathCommand[] = [];
    fromEllipseInto(out, unitEllipse, { segments: 4, startAngle: Number.POSITIVE_INFINITY });
    expect(Number.isNaN((out[0] as { x: number }).x)).toBe(true);
  });
});

describe('fromEllipse companion', () => {
  test('새 PathCommand 배열을 반환한다', () => {
    const result = fromEllipse(unitEllipse, { segments: 4 });
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ kind: 'move', x: 1, y: 0 });
    expect(result[4]).toEqual({ kind: 'close' });
  });

  test('empty ellipse → 새 빈 배열', () => {
    const result = fromEllipse({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 1 });
    expect(result).toEqual([]);
  });

  test('invalid segments → RangeError', () => {
    expect(() => fromEllipse(unitEllipse, { segments: 0 })).toThrow(RangeError);
  });
});
