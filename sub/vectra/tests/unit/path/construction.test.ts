/**
 * S3-RM-011 TASK-05 construction builder unit test.
 *
 * lineCommandsInto / rectCommandsInto / polylineCommandsInto / polygonCommandsInto /
 * circleCommandsInto / ellipseCommandsInto의 command 구성, clockwise 방향, degenerate
 * 입력 처리, circle/ellipse cubic 근사 정확도를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { circleCommandsInto } from '../../../src/path/circle-commands-into';
import { ellipseCommandsInto } from '../../../src/path/ellipse-commands-into';
import { lineCommandsInto } from '../../../src/path/line-commands-into';
import { polygonCommandsInto } from '../../../src/path/polygon-commands-into';
import { polylineCommandsInto } from '../../../src/path/polyline-commands-into';
import { rectCommandsInto } from '../../../src/path/rect-commands-into';
import type { CubicCommand, PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// lineCommandsInto
// ──────────────────────────────────────────────
describe('lineCommandsInto', () => {
  test('두 점을 move + line 2 command로 기록한다', () => {
    const out: PathCommand[] = [];
    const result = lineCommandsInto(out, { x: 1, y: 2 }, { x: 3, y: 4 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
    ]);
  });

  test('tuple XYInput을 읽는다', () => {
    const out: PathCommand[] = [];
    lineCommandsInto(out, [5, 6], [7, 8]);
    expect(out).toEqual([
      { kind: 'move', x: 5, y: 6 },
      { kind: 'line', x: 7, y: 8 },
    ]);
  });

  test('기존 out content를 clear 후 기록한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }, { kind: 'close' }];
    lineCommandsInto(out, [0, 0], [1, 1]);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
  });
});

// ──────────────────────────────────────────────
// rectCommandsInto
// ──────────────────────────────────────────────
describe('rectCommandsInto', () => {
  test('rect를 5 command(move + 3 line + close)로 clockwise 기록한다', () => {
    const out: PathCommand[] = [];
    const result = rectCommandsInto(out, { x: 10, y: 20, width: 30, height: 40 });
    expect(result).toBe(out);
    // SVG y-down 좌표계: left-top → right-top → right-bottom → left-bottom → close
    expect(out).toEqual([
      { kind: 'move', x: 10, y: 20 },
      { kind: 'line', x: 40, y: 20 },
      { kind: 'line', x: 40, y: 60 },
      { kind: 'line', x: 10, y: 60 },
      { kind: 'close' },
    ]);
  });

  test('tuple rect input을 읽는다', () => {
    const out: PathCommand[] = [];
    rectCommandsInto(out, [0, 0, 2, 2]);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'line', x: 2, y: 2 },
      { kind: 'line', x: 0, y: 2 },
      { kind: 'close' },
    ]);
  });

  test('음수 width/height도 validation 없이 그대로 사용한다', () => {
    const out: PathCommand[] = [];
    rectCommandsInto(out, { x: 0, y: 0, width: -4, height: -2 });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: -4, y: 0 },
      { kind: 'line', x: -4, y: -2 },
      { kind: 'line', x: 0, y: -2 },
      { kind: 'close' },
    ]);
  });
});

// ──────────────────────────────────────────────
// polylineCommandsInto
// ──────────────────────────────────────────────
describe('polylineCommandsInto', () => {
  test('N점을 move + (N-1) line, 총 N command로 기록한다', () => {
    const out: PathCommand[] = [];
    const result = polylineCommandsInto(out, [
      [0, 0],
      [1, 0],
      [1, 1],
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
      { kind: 'line', x: 1, y: 1 },
    ]);
  });

  test('point object form { points }를 읽는다', () => {
    const out: PathCommand[] = [];
    polylineCommandsInto(out, {
      points: [
        { x: 2, y: 3 },
        { x: 4, y: 5 },
      ],
    });
    expect(out).toEqual([
      { kind: 'move', x: 2, y: 3 },
      { kind: 'line', x: 4, y: 5 },
    ]);
  });

  test('점 0개면 out을 clear만 한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    const result = polylineCommandsInto(out, []);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('점 1개면 move만 기록한다', () => {
    const out: PathCommand[] = [];
    polylineCommandsInto(out, [[9, 9]]);
    expect(out).toEqual([{ kind: 'move', x: 9, y: 9 }]);
  });
});

// ──────────────────────────────────────────────
// polygonCommandsInto
// ──────────────────────────────────────────────
describe('polygonCommandsInto', () => {
  test('N점을 move + (N-1) line + close, 총 N+1 command로 기록한다', () => {
    const out: PathCommand[] = [];
    const result = polygonCommandsInto(out, [
      [0, 0],
      [4, 0],
      [4, 4],
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 4, y: 0 },
      { kind: 'line', x: 4, y: 4 },
      { kind: 'close' },
    ]);
  });

  test('점 0개면 out을 clear만 한다 (close 없음)', () => {
    const out: PathCommand[] = [{ kind: 'move', x: 1, y: 1 }];
    polygonCommandsInto(out, []);
    expect(out).toHaveLength(0);
  });

  test('점 1개여도 throw 없이 move + close를 기록한다', () => {
    const out: PathCommand[] = [];
    polygonCommandsInto(out, [[3, 3]]);
    expect(out).toEqual([{ kind: 'move', x: 3, y: 3 }, { kind: 'close' }]);
  });
});

// 단위원 clockwise(y-down) 진행 시 각 cubic의 endpoint.
// 시작점 (1,0)은 move. 이후 4개 cubic endpoint가 4등분 점을 시계방향으로 지난다.
const QUARTER_POINTS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
];

// ──────────────────────────────────────────────
// circleCommandsInto
// ──────────────────────────────────────────────
describe('circleCommandsInto', () => {
  test('move + 4 cubic + close, 총 6 command로 기록한다', () => {
    const out: PathCommand[] = [];
    const result = circleCommandsInto(out, { center: { x: 0, y: 0 }, radius: 1 });
    expect(result).toBe(out);
    expect(out).toHaveLength(6);
    expect(out[0]).toEqual({ kind: 'move', x: 1, y: 0 });
    expect(out.slice(1, 5).every((c) => c.kind === 'cubic')).toBe(true);
    expect(out[5]).toEqual({ kind: 'close' });
  });

  test('시작점은 right-most point (cx + r, cy)', () => {
    const out: PathCommand[] = [];
    circleCommandsInto(out, { center: [10, 20], radius: 5 });
    expect(out[0]).toEqual({ kind: 'move', x: 15, y: 20 });
  });

  test('clockwise(default): cubic endpoint가 4등분 점에 가깝다', () => {
    const out: PathCommand[] = [];
    circleCommandsInto(out, { center: { x: 0, y: 0 }, radius: 1 });
    const cubics = out.slice(1, 5) as CubicCommand[];
    // y-down clockwise: (1,0) → (0,1) → (-1,0) → (0,-1)
    for (let i = 0; i < 4; i++) {
      const [ex, ey] = QUARTER_POINTS[i];
      expect(cubics[i].x).toBeCloseTo(ex, 12);
      expect(cubics[i].y).toBeCloseTo(ey, 12);
    }
  });

  test('clockwise:false는 counter-clockwise 방향으로 기록한다', () => {
    const out: PathCommand[] = [];
    circleCommandsInto(out, { center: { x: 0, y: 0 }, radius: 1 }, { clockwise: false });
    const cubics = out.slice(1, 5) as CubicCommand[];
    // counter-clockwise: (1,0) → (0,-1) → (-1,0) → (0,1)
    const ccw: ReadonlyArray<readonly [number, number]> = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];
    for (let i = 0; i < 4; i++) {
      expect(cubics[i].x).toBeCloseTo(ccw[i][0], 12);
      expect(cubics[i].y).toBeCloseTo(ccw[i][1], 12);
    }
  });

  test('cubic 곡선 bounds가 circle bounds와 거의 같다', () => {
    const out: PathCommand[] = [];
    circleCommandsInto(out, { center: { x: 3, y: 7 }, radius: 2 });
    // cubic 곡선을 sampling해 bbox를 측정. kappa 근사 오차는 매우 작다 (< 2e-4).
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let px = 3 + 2;
    let py = 7;
    for (const cmd of out) {
      if (cmd.kind !== 'cubic') continue;
      for (let t = 0; t <= 1; t += 1 / 64) {
        const u = 1 - t;
        const bx = u * u * u * px + 3 * u * u * t * cmd.x1 + 3 * u * t * t * cmd.x2 + t * t * t * cmd.x;
        const by = u * u * u * py + 3 * u * u * t * cmd.y1 + 3 * u * t * t * cmd.y2 + t * t * t * cmd.y;
        minX = Math.min(minX, bx);
        minY = Math.min(minY, by);
        maxX = Math.max(maxX, bx);
        maxY = Math.max(maxY, by);
      }
      px = cmd.x;
      py = cmd.y;
    }
    expect(minX).toBeCloseTo(1, 3);
    expect(maxX).toBeCloseTo(5, 3);
    expect(minY).toBeCloseTo(5, 3);
    expect(maxY).toBeCloseTo(9, 3);
  });
});

// ──────────────────────────────────────────────
// ellipseCommandsInto
// ──────────────────────────────────────────────
describe('ellipseCommandsInto', () => {
  test('rx != ry 기본 동작: move + 4 cubic + close', () => {
    const out: PathCommand[] = [];
    const result = ellipseCommandsInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 1 });
    expect(result).toBe(out);
    expect(out).toHaveLength(6);
    expect(out[0]).toEqual({ kind: 'move', x: 3, y: 0 });
    const cubics = out.slice(1, 5) as CubicCommand[];
    expect(cubics[0].x).toBeCloseTo(0, 12);
    expect(cubics[0].y).toBeCloseTo(1, 12);
    expect(cubics[1].x).toBeCloseTo(-3, 12);
    expect(cubics[1].y).toBeCloseTo(0, 12);
  });

  test('rx == ry이면 동일 center/radius circle과 결과가 같다', () => {
    const ellipseOut: PathCommand[] = [];
    ellipseCommandsInto(ellipseOut, { center: { x: 2, y: 5 }, radiusX: 4, radiusY: 4 });
    const circleOut: PathCommand[] = [];
    circleCommandsInto(circleOut, { center: { x: 2, y: 5 }, radius: 4 });
    expect(ellipseOut).toEqual(circleOut);
  });

  test('tuple ellipse input과 clockwise:false 옵션을 읽는다', () => {
    const out: PathCommand[] = [];
    ellipseCommandsInto(out, [[0, 0], 2, 1], { clockwise: false });
    expect(out[0]).toEqual({ kind: 'move', x: 2, y: 0 });
    const cubics = out.slice(1, 5) as CubicCommand[];
    // counter-clockwise 첫 endpoint: (0, -ry)
    expect(cubics[0].x).toBeCloseTo(0, 12);
    expect(cubics[0].y).toBeCloseTo(-1, 12);
  });

  test('점이 없는 입력 개념 없음 — degenerate radius 0도 throw 없이 기록한다', () => {
    const out: PathCommand[] = [];
    ellipseCommandsInto(out, { center: [0, 0], radiusX: 0, radiusY: 0 });
    expect(out).toHaveLength(6);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
  });
});
