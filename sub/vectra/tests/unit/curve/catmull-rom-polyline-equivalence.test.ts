/**
 * catmullRomPolylineInto / catmullRomPointAtTInto — knot 표를 한 번만 만드는 구현이
 * 이전 구현과 비트 단위로 같은지 고정한다.
 *
 * 검증: 객체·tuple·class instance 점이 섞인 control point 0~30개, 중복 점·collinear·정수·실수·큰 값·
 * ±0·NaN·±Infinity 좌표, alpha(0, 0.5, 1, 음수, NaN 포함), closed 여부, steps(0, 1, 2, 비정수, 음수, NaN,
 * 큰 값)와 숫자 인자·옵션 인자에서 결과 점 목록이 이전 구현과 `Object.is` 수준으로 같다.
 */
import { describe, expect, test } from 'vitest';
import { catmullRomPointAtTInto } from '../../../src/curve/catmull-rom-point-at-t-into';
import { catmullRomPolylineInto } from '../../../src/curve/catmull-rom-polyline-into';
import {
  catmullRomGetPoints,
  catmullRomKnotsFromPoints,
  catmullRomSegmentAt,
  catmullRomSegmentCount,
} from '../../../src/curve/catmull-rom.internal';
import { readX, readY, writeXY } from '../../../src/internal/xy';
import { createRng } from '../../../src/random/create-rng';
import type {
  CatmullRomOptions,
  CatmullRomPolylineOptions,
  XYInput,
  XYObjectWritable,
  XYWritable,
} from '../../../src/types';

// 이전 구현. 점을 샘플할 때마다 knot 표를 새로 만든다. 새 구현의 비교 기준으로만 쓴다.
function referencePointAtTInto<Out extends XYWritable>(
  out: Out,
  points: readonly XYInput[],
  t: number,
  options?: CatmullRomOptions
): Out {
  const n = points.length;

  if (n === 0) return writeXY(out, 0, 0);
  if (n === 1) return writeXY(out, readX(points[0]), readY(points[0]));

  const alpha = options?.alpha ?? 0.5;
  const closed = options?.closed ?? false;
  const segCount = catmullRomSegmentCount(n, closed);

  let segIndex: number;
  let localU: number;
  if (closed) {
    const raw = t * n;
    segIndex = Math.max(0, Math.min(Math.floor(raw), segCount - 1));
    localU = raw - segIndex;
  } else {
    const raw = t * (n - 1);
    segIndex = Math.max(0, Math.min(Math.floor(raw), n - 2));
    localU = raw - segIndex;
  }

  const knots = catmullRomKnotsFromPoints(points, alpha, closed);
  const safeKnot = (i: number): number => {
    if (i <= n + 1) return knots[i];
    const step = knots[2] - knots[1];
    return knots[n + 1] + step * (i - (n + 1));
  };

  const t1 = safeKnot(segIndex + 1);
  const t2 = safeKnot(segIndex + 2);
  const u = t1 + localU * (t2 - t1);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = catmullRomGetPoints(points, segIndex, closed);
  const t0 = safeKnot(segIndex);
  const t3 = safeKnot(segIndex + 3);
  return catmullRomSegmentAt(out, x0, y0, x1, y1, x2, y2, x3, y3, u, t0, t1, t2, t3);
}

function referencePolylineInto(
  out: XYObjectWritable[],
  points: readonly XYInput[],
  stepsOrOptions?: number | CatmullRomPolylineOptions
): XYObjectWritable[] {
  let steps = 32;
  let alpha = 0.5;
  let closed = false;

  if (typeof stepsOrOptions === 'number') {
    steps = stepsOrOptions;
  } else if (stepsOrOptions != null) {
    if (stepsOrOptions.steps != null) steps = stepsOrOptions.steps;
    if (stepsOrOptions.alpha != null) alpha = stepsOrOptions.alpha;
    if (stepsOrOptions.closed != null) closed = stepsOrOptions.closed;
  }

  if (points.length < 2) {
    out.length = 0;
    return out;
  }
  if (steps <= 0) {
    out.length = 0;
    return out;
  }
  if (steps === 1) {
    const pt = { x: 0, y: 0 };
    referencePointAtTInto(pt, points, 0, { alpha, closed });
    out.length = 0;
    out.push(pt);
    return out;
  }

  out.length = 0;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const pt = { x: 0, y: 0 };
    referencePointAtTInto(pt, points, t, { alpha, closed });
    out.push(pt);
  }
  return out;
}

class Point2 {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}
}

type Rng = () => number;

const SPECIAL = [0, -0, 1, -1, 0.5, 1e-300, 1e150, -1e150, 1e308, -1e308, Number.MAX_VALUE, NaN, Infinity, -Infinity];

function coord(rng: Rng, kind: number, special: number): number {
  const r = rng();
  if (r < special) return SPECIAL[Math.floor(rng() * SPECIAL.length)];
  if (kind === 0) return Math.floor(rng() * 21) - 10;
  if (kind === 1) return (rng() - 0.5) * 200;
  if (kind === 2) return (rng() - 0.5) * 2e154;
  return 1e6 + rng() * 1e-3;
}

function makePoint(x: number, y: number, form: number): XYInput {
  if (form === 0) return { x, y };
  if (form === 1) return [x, y];
  return new Point2(x, y);
}

function makePoints(rng: Rng): XYInput[] {
  const kind = Math.floor(rng() * 4);
  const special = rng() < 0.6 ? 0 : 0.05;
  // 점 수 0~30. 0, 1, 2, 3, 4개 경계를 자주 만든다.
  const n = rng() < 0.4 ? Math.floor(rng() * 6) : Math.floor(rng() * 31);
  const mode = rng();
  const baseForm = Math.floor(rng() * 3);
  const xy: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    if (mode < 0.15 && i > 0) xy.push(xy[i - 1]); // 중복 점
    else if (mode < 0.25) xy.push([i, 2 * i + 1]); // collinear
    else if (mode < 0.3) xy.push([3, 4]); // 모든 점이 같다
    else xy.push([coord(rng, kind, special), coord(rng, kind, special)]);
  }
  return xy.map(([x, y]) => makePoint(x, y, rng() < 0.3 ? Math.floor(rng() * 3) : baseForm));
}

const ALPHAS = [0, 0.5, 1, 0.25, 2, -1, NaN, Infinity];

function makeSteps(rng: Rng): number {
  const r = rng();
  if (r < 0.04) return [0, 1, 2, -3, 2.5, 7.25, NaN][Math.floor(rng() * 7)];
  if (r < 0.9) return 2 + Math.floor(rng() * 40);
  return 2 + Math.floor(rng() * 300);
}

function makeArg(rng: Rng): number | CatmullRomPolylineOptions | undefined {
  const r = rng();
  if (r < 0.1) return undefined;
  if (r < 0.3) return makeSteps(rng);
  const opts: CatmullRomPolylineOptions = {};
  if (rng() < 0.8) opts.steps = makeSteps(rng);
  if (rng() < 0.6) opts.alpha = ALPHAS[Math.floor(rng() * ALPHAS.length)];
  if (rng() < 0.5) opts.closed = rng() < 0.6;
  return opts;
}

/** 함수를 실행해 결과 또는 던진 오류 종류를 돌려준다. t가 NaN이면 두 구현이 같은 TypeError를 던진다. */
function run<T>(fn: () => T): { value?: T; error?: string } {
  try {
    return { value: fn() };
  } catch (error) {
    return { error: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
  }
}

function sameRun(a: { value?: XYObjectWritable[]; error?: string }, b: { value?: XYObjectWritable[]; error?: string }) {
  if (a.error !== undefined || b.error !== undefined) return a.error === b.error;
  return same(a.value as XYObjectWritable[], b.value as XYObjectWritable[]);
}

function same(a: readonly XYObjectWritable[], b: readonly XYObjectWritable[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i].x, b[i].x) || !Object.is(a[i].y, b[i].y)) return false;
  }
  return true;
}

describe('catmullRomPolylineInto — 이전 구현과 출력 동일성', () => {
  test('무작위 control point 1.5만 개: catmullRomPolylineInto 결과가 이전 구현과 비트 단위로 같다', () => {
    const rng = createRng('catmull-rom-polyline-equivalence');
    let mismatch = '';
    for (let i = 0; i < 15_000 && mismatch === ''; i++) {
      const points = makePoints(rng);
      const arg = makeArg(rng);
      const actual = catmullRomPolylineInto([{ x: 9, y: 9 }], points, arg);
      const expected = referencePolylineInto([{ x: 9, y: 9 }], points, arg);
      if (!same(actual, expected)) mismatch = `#${i} n=${points.length} arg=${JSON.stringify(arg)}`;
    }

    expect(mismatch).toBe('');
  });

  test('무작위 control point 1.5만 개와 t: catmullRomPointAtTInto가 이전 구현과 비트 단위로 같다', () => {
    const rng = createRng('catmull-rom-point-at-t-equivalence');
    let mismatch = '';
    for (let i = 0; i < 15_000 && mismatch === ''; i++) {
      const points = makePoints(rng);
      const options: CatmullRomOptions = {};
      if (rng() < 0.6) options.alpha = ALPHAS[Math.floor(rng() * ALPHAS.length)];
      if (rng() < 0.5) options.closed = rng() < 0.6;
      const r = rng();
      const t = r < 0.1 ? [-1, 0, 1, 2, NaN, Infinity, -0][Math.floor(rng() * 7)] : rng() * 1.2 - 0.1;
      const passed = rng() < 0.2 ? undefined : options;
      const actual = run(() => [catmullRomPointAtTInto({ x: 9, y: 9 }, points, t, passed)]);
      const expected = run(() => [referencePointAtTInto({ x: 9, y: 9 }, points, t, passed)]);
      if (!sameRun(actual, expected)) mismatch = `#${i} n=${points.length} t=${t}`;
    }

    expect(mismatch).toBe('');
  });

  test('점이 2개 미만이거나 steps가 0 이하이면 이전처럼 out을 비운다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    expect(catmullRomPolylineInto(out, [{ x: 0, y: 0 }], 8)).toEqual([]);

    const out2: XYObjectWritable[] = [{ x: 1, y: 1 }];
    expect(
      catmullRomPolylineInto(
        out2,
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        0
      )
    ).toEqual([]);
  });

  test('고정 입력: 열린 곡선은 첫 점에서 시작하고 control point를 지난다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ];
    const out = catmullRomPolylineInto([], points, 4);

    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[2].x).toBeCloseTo(10, 9);
    expect(out[2].y).toBeCloseTo(0, 9);
  });
});
