import { describe, expect, test } from 'vitest';
import { flattenInto } from '../../../src/path/flatten-into';
import type { PathCommand, XYObjectWritable, XYTupleWritable } from '../../../src/types/index';

// ──────────────────────────────────────────────
// 공통 helper
// ──────────────────────────────────────────────

/** XYObjectWritable 배열을 새로 생성하여 반환한다. */
function makeOut(): XYObjectWritable[] {
  return [];
}

/** {x, y} point를 구성한다. */
function pt(x: number, y: number): XYObjectWritable {
  return { x, y };
}

const assertFlattenIntoRejectsTupleOutput = (): void => {
  const tupleOut: XYTupleWritable[] = [];
  // @ts-expect-error flattenInto는 새 object point를 push하므로 tuple point 배열 output을 허용하지 않는다.
  flattenInto(tupleOut, [{ kind: 'line', x: 1, y: 2 }]);
};

void assertFlattenIntoRejectsTupleOutput;

// ──────────────────────────────────────────────
// flattenInto
// ──────────────────────────────────────────────

describe('flattenInto', () => {
  test('empty path → out.length === 0', () => {
    const out = makeOut();
    const result = flattenInto(out, []);
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });

  test('기존 out 내용이 있어도 clear 후 채워진다', () => {
    const out: XYObjectWritable[] = [pt(99, 99), pt(88, 88)];
    flattenInto(out, []);
    expect(out).toHaveLength(0);
  });

  test('첫 command가 line이면 implicit origin (0,0)을 시작점으로 사용한다', () => {
    const cmds: PathCommand[] = [{ kind: 'line', x: 10, y: 0 }];
    const out = makeOut();
    flattenInto(out, cmds);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(pt(0, 0));
    expect(out[1]).toEqual(pt(10, 0));
  });

  test('move-only path → drawing segment 없음 → out.length === 0', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 5, y: 5 }];
    const out = makeOut();
    flattenInto(out, cmds);
    expect(out).toHaveLength(0);
  });

  test('consecutive move → 마지막 move 위치가 subpath start로 사용된다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 1, y: 1 },
      { kind: 'move', x: 10, y: 20 },
      { kind: 'line', x: 30, y: 40 },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(pt(10, 20));
    expect(out[1]).toEqual(pt(30, 40));
  });

  test('다중 subpath flatten은 각 subpath 시작점을 보존한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 100, y: 0 },
      { kind: 'line', x: 110, y: 0 },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    expect(out).toEqual([pt(0, 0), pt(10, 0), pt(100, 0), pt(110, 0)]);
  });

  test('단순 line path → [start, end] 2점', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(pt(0, 0));
    expect(out[1]).toEqual(pt(100, 0));
  });

  test('close command → subpath start로 돌아가는 point가 추가된다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }];
    const out = makeOut();
    flattenInto(out, cmds);
    // (0,0) → (10,0) → (0,0) = 3점
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual(pt(0, 0));
    expect(out[1]).toEqual(pt(10, 0));
    expect(out[2]).toEqual(pt(0, 0));
  });

  test('close 직전이 move이면 zero-length no-op → point 추가 없음', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 5, y: 5 }, { kind: 'close' }];
    const out = makeOut();
    flattenInto(out, cmds);
    // drawing segment 없음 (move→close는 drawing 미기여)
    expect(out).toHaveLength(0);
  });

  test('close 직후 draw command → subpath start를 current point로 재사용한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'close' },
      { kind: 'line', x: 10, y: 10 },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    // (0,0)→(10,0)→(0,0) 그리고 close 후 (0,0)→(10,10)
    // close 직후 current = (0,0) = subpath start이므로 이미 출력에 있음
    // (10,10)만 추가
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual(pt(0, 0));
    expect(out[1]).toEqual(pt(10, 0));
    expect(out[2]).toEqual(pt(0, 0));
    expect(out[3]).toEqual(pt(10, 10));
  });

  test('quadratic command → intermediate + endpoint 포함', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    // 기본 flatness로 최소 2점 (시작+끝), 중간점 있을 경우 그 이상
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out[0]).toEqual(pt(0, 0));
    expect(out[out.length - 1]).toEqual(pt(100, 0));
  });

  test('cubic command → intermediate + endpoint 포함', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out[0]).toEqual(pt(0, 0));
    expect(out[out.length - 1]).toEqual(pt(100, 0));
  });

  test('arc command → endpoint arc→center 변환 후 flatten, endpoint 포함됨', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      {
        kind: 'arc',
        rx: 50,
        ry: 50,
        xRotation: 0,
        largeArc: false,
        sweep: true,
        x: 100,
        y: 0,
      },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out[0]).toEqual(pt(0, 0));
    // arc flatten은 부동소수점 오차를 포함할 수 있으므로 근사 비교
    expect(out[out.length - 1].x).toBeCloseTo(100, 10);
    expect(out[out.length - 1].y).toBeCloseTo(0, 10);
  });

  test('flatness가 작을수록 curved path output point 수가 많거나 같다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];

    const outDefault = makeOut();
    flattenInto(outDefault, cmds); // flatness = 0.5

    const outFine = makeOut();
    flattenInto(outFine, cmds, { flatness: 0.01 });

    expect(outFine.length).toBeGreaterThanOrEqual(outDefault.length);
  });

  test('invalid numeric (NaN) → throw 없이 NaN 전파', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: Number.NaN, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out = makeOut();
    expect(() => flattenInto(out, cmds)).not.toThrow();
    // NaN이 전파되어 출력 점에 포함
    expect(Number.isNaN(out[0]?.x)).toBe(true);
  });

  test('연속 close command → 두 번째 close는 no-op (subpath 없음)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'close' },
      { kind: 'close' },
    ];
    const out = makeOut();
    flattenInto(out, cmds);
    // (0,0) → (10,0) → (0,0), 두 번째 close는 subpathOpen=false → no-op
    expect(out).toHaveLength(3);
    expect(out[2]).toEqual(pt(0, 0));
  });

  test('반환값이 out과 동일한 reference이다', () => {
    const out = makeOut();
    const result = flattenInto(out, [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 1 },
    ]);
    expect(result).toBe(out);
  });

  test('출력 배열에는 새 object point를 push한다', () => {
    const out: XYObjectWritable[] = [];
    flattenInto(out, [{ kind: 'line', x: 1, y: 2 }]);
    expect(Array.isArray(out[0])).toBe(false);
    expect(out[0]).toEqual(pt(0, 0));
  });
});
