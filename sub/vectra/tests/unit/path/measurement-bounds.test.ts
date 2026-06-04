import { describe, expect, test } from 'vitest';
import { boundsInto } from '../../../src/path/bounds-into';
import type { BoundsWritable, PathCommand, XYTupleWritable } from '../../../src/types/index';

// ──────────────────────────────────────────────
// boundsInto
// ──────────────────────────────────────────────

/** object bounds output을 생성한다. */
function makeBoundsOut(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

describe('boundsInto', () => {
  test('빈 path → sentinel bounds (min: Infinity, max: -Infinity)', () => {
    const out = makeBoundsOut();
    boundsInto(out, []);
    expect(out.min.x).toBe(Infinity);
    expect(out.min.y).toBe(Infinity);
    expect(out.max.x).toBe(-Infinity);
    expect(out.max.y).toBe(-Infinity);
  });

  test('move만 있는 path → sentinel bounds (drawing segment 없음)', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [{ kind: 'move', x: 10, y: 20 }];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(Infinity);
    expect(out.min.y).toBe(Infinity);
    expect(out.max.x).toBe(-Infinity);
    expect(out.max.y).toBe(-Infinity);
  });

  test('close만 있는 path → sentinel bounds (drawing segment 없음)', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [{ kind: 'close' }];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(Infinity);
    expect(out.min.y).toBe(Infinity);
    expect(out.max.x).toBe(-Infinity);
    expect(out.max.y).toBe(-Infinity);
  });

  test('첫 command가 move가 아니면 implicit origin을 bounds에 포함한다', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [{ kind: 'line', x: 5, y: -2 }];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(0);
    expect(out.min.y).toBe(-2);
    expect(out.max.x).toBe(5);
    expect(out.max.y).toBe(0);
  });

  test('단순 line path bounds — move(0,0), line(100,0) → min(0,0), max(100,0)', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(0);
    expect(out.min.y).toBe(0);
    expect(out.max.x).toBe(100);
    expect(out.max.y).toBe(0);
  });

  test('다중 subpath bounds — 두 subpath가 합쳐진 전체 bounds', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 50, y: 20 },
      { kind: 'line', x: 60, y: 30 },
    ];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(0);
    expect(out.min.y).toBe(0);
    expect(out.max.x).toBe(60);
    expect(out.max.y).toBe(30);
  });

  test('close command가 bounds를 확장하는 사례 — 삼각형 닫기', () => {
    const out = makeBoundsOut();
    // 삼각형: (0,0) → (10,0) → (5,10) → close
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 5, y: 10 },
      { kind: 'close' },
    ];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(0);
    expect(out.min.y).toBe(0);
    expect(out.max.x).toBe(10);
    expect(out.max.y).toBe(10);
  });

  test('close 후 draw command는 subpath start 위치에서 새 segment를 시작한다', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [
      { kind: 'move', x: 2, y: 3 },
      { kind: 'line', x: 8, y: 3 },
      { kind: 'close' },
      { kind: 'line', x: -4, y: 9 },
    ];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(-4);
    expect(out.min.y).toBe(3);
    expect(out.max.x).toBe(8);
    expect(out.max.y).toBe(9);
  });

  test('quadratic interior extrema — 제어점이 endpoint 밖에 있어 extrema가 bounds 확장', () => {
    const out = makeBoundsOut();
    // move(0,0), quadratic(cx=0, cy=100, x=100, y=0)
    // 두 endpoint의 y는 모두 0이지만, 제어점(0,100)으로 인해 extrema가 y > 0이어야 함
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 0, y1: 100, x: 100, y: 0 },
    ];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(0);
    expect(out.max.x).toBe(100);
    // y(t)=200t(1-t), t=0.5에서 정확한 max y는 50이다.
    expect(out.max.y).toBeCloseTo(50, 12);
    expect(out.min.y).toBe(0);
  });

  test('cubic interior extrema — cubic curve의 extrema가 bounds 확장', () => {
    const out = makeBoundsOut();
    // S자형 cubic: (0,0) → ctrl1(0,100) → ctrl2(100,100) → (100,0)
    // endpoints의 y는 0이지만 curve는 y > 0 구간을 가진다
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
    ];
    boundsInto(out, cmds);
    expect(out.min.x).toBe(0);
    expect(out.max.x).toBe(100);
    // y(t)=300t(1-t), t=0.5에서 정확한 max y는 75이다.
    expect(out.max.y).toBeCloseTo(75, 12);
    expect(out.min.y).toBe(0);
  });

  test('arc bounds — endpoint만으로는 잡히지 않는 extrema (반원)', () => {
    const out = makeBoundsOut();
    // 반원: (0,0) → (100,0), rx=ry=50, sweep=true, largeArc=false
    // center=(50,0), startAngle=π, endAngle=2π
    // SVG sweep=true는 시계 방향 → 호가 아래(y음수 방향)로 볼록
    // 두 endpoint의 y는 0이지만 호의 최저점(y extremum)이 y=-50
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'arc', rx: 50, ry: 50, xRotation: 0, largeArc: false, sweep: true, x: 100, y: 0 },
    ];
    boundsInto(out, cmds);
    expect(out.min.x).toBeCloseTo(0, 5);
    expect(out.max.x).toBeCloseTo(100, 5);
    // sweep=true(시계 방향)이므로 호가 아래로 볼록 → y min < 0
    expect(out.min.y).toBeCloseTo(-50, 10);
    expect(out.max.y).toBeCloseTo(0, 5);
  });

  test('invalid numeric line endpoint → throw 없이 NaN bounds를 전파한다', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [
      { kind: 'move', x: Number.NaN, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    expect(() => boundsInto(out, cmds)).not.toThrow();
    expect(Number.isNaN(out.min.x)).toBe(true);
    expect(Number.isNaN(out.max.x)).toBe(true);
    expect(out.min.y).toBe(0);
    expect(out.max.y).toBe(0);
  });

  test('tuple output — out이 { min:[x,y], max:[x,y] } 형태여도 기록됨', () => {
    const out: BoundsWritable<XYTupleWritable, XYTupleWritable> = {
      min: [0, 0] as XYTupleWritable,
      max: [0, 0] as XYTupleWritable,
    };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 5, y: 10 },
      { kind: 'line', x: 15, y: 20 },
    ];
    boundsInto(out, cmds);
    expect((out.min as XYTupleWritable)[0]).toBe(5);
    expect((out.min as XYTupleWritable)[1]).toBe(10);
    expect((out.max as XYTupleWritable)[0]).toBe(15);
    expect((out.max as XYTupleWritable)[1]).toBe(20);
  });

  test('반환값이 out과 동일한 reference이다', () => {
    const out = makeBoundsOut();
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 1 },
    ];
    const result = boundsInto(out, cmds);
    expect(result).toBe(out);
  });
});
