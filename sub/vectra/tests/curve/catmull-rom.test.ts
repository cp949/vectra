/**
 * catmull-rom.test.ts
 *
 * catmullRomPointAtTInto, catmullRomPointAtT, catmullRomPolylineInto,
 * catmullRomPathInto 함수 테스트.
 * open/closed curve, alpha=0(uniform)/alpha=0.5(centripetal), degenerate 케이스를 검증한다.
 * pointAtT, polylineInto, catmullRomPathInto 계열.
 */
import { describe, expect, it } from 'vitest';
import { catmullRomPathInto } from '../../src/curve/catmull-rom-path-into';
import { catmullRomPointAtT } from '../../src/curve/catmull-rom-point-at-t';
import { catmullRomPointAtTInto } from '../../src/curve/catmull-rom-point-at-t-into';
import { catmullRomPolylineInto } from '../../src/curve/catmull-rom-polyline-into';
import type { CubicCommand, MoveCommand, PathCommand } from '../../src/types';

// ──────────────────────────────────────────────────────────────
/** 절대 오차로 두 좌표가 tolerance 이내인지 확인하는 helper */
function expectXY(result: { x: number; y: number }, expected: { x: number; y: number }, tolerance: number) {
  expect(Math.abs(result.x - expected.x)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(result.y - expected.y)).toBeLessThanOrEqual(tolerance);
}
// ──────────────────────────────────────────────────────────────

describe('catmullRomPointAtTInto', () => {
  it('t=0이면 첫 번째 점을 반환한다 (open)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    const out = { x: 0, y: 0 };
    catmullRomPointAtTInto(out, points, 0, { alpha: 0 });
    expectXY(out, { x: 0, y: 0 }, 1e-10);
  });

  it('t=1이면 마지막 점을 반환한다 (open)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    const out = { x: 0, y: 0 };
    catmullRomPointAtTInto(out, points, 1, { alpha: 0 });
    expectXY(out, { x: 3, y: 0 }, 1e-10);
  });

  it('t=0.5이면 직선 중간점을 반환한다 (alpha=0, uniform)', () => {
    // 균등 간격 직선에서 uniform Catmull-Rom은 선형 보간과 동일하다
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    const out = { x: 0, y: 0 };
    catmullRomPointAtTInto(out, points, 0.5, { alpha: 0 });
    expectXY(out, { x: 1.5, y: 0 }, 1e-6);
  });

  it('degenerate: points.length === 0이면 {x:0, y:0}을 기록한다', () => {
    const out = { x: 9, y: 9 };
    catmullRomPointAtTInto(out, [], 0.5);
    expectXY(out, { x: 0, y: 0 }, 0);
  });

  it('degenerate: points.length === 1이면 해당 점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    catmullRomPointAtTInto(out, [{ x: 5, y: 3 }], 0.5);
    expectXY(out, { x: 5, y: 3 }, 0);
  });

  it('degenerate: points.length === 2이면 선형 보간을 반환한다 (alpha=0, t=0.5)', () => {
    // 2점 phantom 처리로 중간값이 선형 보간과 일치해야 한다
    const out = { x: 0, y: 0 };
    catmullRomPointAtTInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ],
      0.5,
      { alpha: 0 }
    );
    expectXY(out, { x: 1, y: 0 }, 1e-6);
  });

  it('closed=true일 때 t=0과 t=1 결과가 동일하다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    const out0 = { x: 0, y: 0 };
    const out1 = { x: 0, y: 0 };
    catmullRomPointAtTInto(out0, points, 0, { closed: true });
    catmullRomPointAtTInto(out1, points, 1, { closed: true });
    expectXY(out0, out1, 1e-10);
  });

  it('closed=true와 open에서 t=0.25 결과가 다르다 (wrap-around 동작)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    const outClosed = { x: 0, y: 0 };
    const outOpen = { x: 0, y: 0 };
    catmullRomPointAtTInto(outClosed, points, 0.25, { closed: true });
    catmullRomPointAtTInto(outOpen, points, 0.25, { closed: false });
    // wrap-around로 인해 두 결과는 달라야 한다
    const dx = Math.abs(outClosed.x - outOpen.x);
    const dy = Math.abs(outClosed.y - outOpen.y);
    expect(dx + dy).toBeGreaterThan(1e-6);
  });

  it('alpha=0과 alpha=0.5에서 불균등 간격 curve의 t=0.4 결과가 다르다', () => {
    // 인접 점 간격이 다르면 alpha에 따라 knot 간격도 달라져 보간 결과가 달라진다.
    // 모든 인접 점 거리가 동일하면 alpha가 달라도 결과가 같으므로 의도적으로 불균등 간격을 사용한다.
    const points = [
      { x: 0, y: 0 },
      { x: 0.1, y: 0 }, // 짧은 간격
      { x: 5, y: 0 }, // 긴 간격
      { x: 6, y: 0 }, // 짧은 간격
    ];
    const outUniform = { x: 0, y: 0 };
    const outCentripetal = { x: 0, y: 0 };
    catmullRomPointAtTInto(outUniform, points, 0.4, { alpha: 0 });
    catmullRomPointAtTInto(outCentripetal, points, 0.4, { alpha: 0.5 });
    const dx = Math.abs(outUniform.x - outCentripetal.x);
    const dy = Math.abs(outUniform.y - outCentripetal.y);
    expect(dx + dy).toBeGreaterThan(1e-6);
  });
});

describe('catmullRomPointAtT', () => {
  it('catmullRomPointAtTInto와 동일한 결과를 반환한다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 3 },
    ];
    const t = 0.5;
    const opts = { alpha: 0.5 };

    const out = { x: 0, y: 0 };
    catmullRomPointAtTInto(out, points, t, opts);
    const result = catmullRomPointAtT(points, t, opts);

    expectXY(result, out, 1e-14);
  });
});

describe('catmullRomPolylineInto', () => {
  const basePoints = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 3, y: 1 },
    { x: 4, y: 3 },
  ];

  it('steps=5, open curve: 5개 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    catmullRomPolylineInto(out, basePoints, 5);
    expect(out.length).toBe(5);
  });

  it('steps=4, closed curve: 4개 점을 반환하고 t=0,1/4,1/2,3/4에 대응한다', () => {
    const out: { x: number; y: number }[] = [];
    catmullRomPolylineInto(out, basePoints, { steps: 4, closed: true });
    expect(out.length).toBe(4);

    // 각 점이 catmullRomPointAtTInto의 t=0,0.25,0.5,0.75 결과와 일치해야 한다
    const opts = { alpha: 0.5, closed: true };
    for (let i = 0; i < 4; i++) {
      const expected = { x: 0, y: 0 };
      catmullRomPointAtTInto(expected, basePoints, i / 4, opts);
      expectXY(out[i], expected, 1e-10);
    }
  });

  it('degenerate: points.length < 2이면 out.length === 0', () => {
    const out: { x: number; y: number }[] = [{ x: 1, y: 1 }];
    catmullRomPolylineInto(out, [{ x: 0, y: 0 }], 10);
    expect(out.length).toBe(0);
  });

  it('degenerate: steps <= 0이면 out.length === 0', () => {
    const out: { x: number; y: number }[] = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    catmullRomPolylineInto(out, basePoints, 0);
    expect(out.length).toBe(0);
  });

  it('steps=-1이면 out을 비운다', () => {
    const out: { x: number; y: number }[] = [];
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    catmullRomPolylineInto(out, pts, -1);
    expect(out.length).toBe(0);
  });

  it('degenerate: steps === 1이면 t=0 단일 점만 push한다', () => {
    const out: { x: number; y: number }[] = [];
    catmullRomPolylineInto(out, basePoints, 1);
    expect(out.length).toBe(1);

    const expected = { x: 0, y: 0 };
    catmullRomPointAtTInto(expected, basePoints, 0);
    expectXY(out[0], expected, 1e-10);
  });

  it('기존 내용 지우기: out에 미리 2개 원소가 있어도 호출 후 steps 개수로 교체된다', () => {
    const out: { x: number; y: number }[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
    ];
    catmullRomPolylineInto(out, basePoints, 3);
    expect(out.length).toBe(3);
  });

  it('steps 미지정 시 기본값 32: out.length === 32', () => {
    const out: { x: number; y: number }[] = [];
    catmullRomPolylineInto(out, basePoints);
    expect(out.length).toBe(32);
  });

  it('points.length === 2: phantom 처리로 steps개 점을 반환한다', () => {
    // 2점 phantom 처리 시 1 segment로 동작해 정상 샘플링이 이루어져야 한다
    const out: { x: number; y: number }[] = [];
    const twoPoints = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ];
    catmullRomPolylineInto(out, twoPoints, 3);
    expect(out.length).toBe(3);
    // t=0은 첫 점, t=2/3은 중간 부근이어야 한다
    expectXY(out[0], { x: 0, y: 0 }, 1e-6);
  });
});

// ──────────────────────────────────────────────────────────────
const TOL = 1e-10;

/** cubic Bezier 위의 점을 계산하는 helper (t ∈ [0,1]) */
function evalBezier(
  c0x: number,
  c0y: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  c3x: number,
  c3y: number,
  t: number
) {
  const u = 1 - t;
  return {
    x: u * u * u * c0x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * c3x,
    y: u * u * u * c0y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * c3y,
  };
}
// ──────────────────────────────────────────────────────────────

describe('catmullRomPathInto', () => {
  it('degenerate: n=0 → out.length === 0', () => {
    const out: PathCommand[] = [];
    catmullRomPathInto(out, []);
    expect(out.length).toBe(0);
  });

  it('degenerate: n=1 → out.length === 0', () => {
    const out: PathCommand[] = [];
    catmullRomPathInto(out, [{ x: 1, y: 2 }]);
    expect(out.length).toBe(0);
  });

  it('open n=2: move 1개 + cubic 1개 = 2개', () => {
    const out: PathCommand[] = [];
    catmullRomPathInto(out, [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
    expect(out.length).toBe(2);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('cubic');
  });

  it('open n=4 구조 확인: move 1개 + cubic 3개 = 4개', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 0 },
    ];
    const out: PathCommand[] = [];
    catmullRomPathInto(out, pts);
    expect(out.length).toBe(4);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('cubic');
    expect(out[2].kind).toBe('cubic');
    expect(out[3].kind).toBe('cubic');
  });

  it('Catmull-Rom 보간 확인: move point == pts[0], 각 cubic endpoint == pts[si+1]', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 0 },
    ];
    const out: PathCommand[] = [];
    catmullRomPathInto(out, pts);

    const move = out[0] as MoveCommand;
    expect(Math.abs(move.x - pts[0].x)).toBeLessThan(TOL);
    expect(Math.abs(move.y - pts[0].y)).toBeLessThan(TOL);

    for (let si = 0; si < 3; si++) {
      const cmd = out[si + 1] as CubicCommand;
      expect(Math.abs(cmd.x - pts[si + 1].x)).toBeLessThan(TOL);
      expect(Math.abs(cmd.y - pts[si + 1].y)).toBeLessThan(TOL);
    }
  });

  it('closed n=4 구조: move 1개 + cubic 4개 + close 1개 = 6개', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ];
    const out: PathCommand[] = [];
    catmullRomPathInto(out, pts, { closed: true });
    expect(out.length).toBe(6);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('cubic');
    expect(out[2].kind).toBe('cubic');
    expect(out[3].kind).toBe('cubic');
    expect(out[4].kind).toBe('cubic');
    expect(out[5].kind).toBe('close');
  });

  it('수치 일치: segment 0 midpoint가 catmullRomPointAtTInto와 1e-10 이내', () => {
    // open n=4, segCount=3. segment 0 midpoint: globalT=1/6 → raw=0.5 → seg0, localU=0.5
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 0 },
    ];
    const out: PathCommand[] = [];
    catmullRomPathInto(out, pts, { alpha: 0.5 });

    const move = out[0] as MoveCommand;
    const cubic = out[1] as CubicCommand;
    const bezMid = evalBezier(move.x, move.y, cubic.x1, cubic.y1, cubic.x2, cubic.y2, cubic.x, cubic.y, 0.5);

    const ref = { x: 0, y: 0 };
    catmullRomPointAtTInto(ref, pts, 1 / 6, { alpha: 0.5 });

    expect(Math.abs(bezMid.x - ref.x)).toBeLessThan(TOL);
    expect(Math.abs(bezMid.y - ref.y)).toBeLessThan(TOL);
  });

  it('closed curve: 마지막 cubic endpoint가 move point와 일치한다', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ];
    const out: PathCommand[] = [];
    catmullRomPathInto(out, pts, { closed: true });
    // out: [move, cubic, cubic, cubic, cubic, close]
    const move = out[0] as MoveCommand;
    const lastCubic = out[out.length - 2] as CubicCommand;
    expect(Math.abs(lastCubic.x - move.x)).toBeLessThan(TOL);
    expect(Math.abs(lastCubic.y - move.y)).toBeLessThan(TOL);
  });

  it('closed non-uniform: 각 segment midpoint가 catmullRomPointAtTInto와 1e-10 이내 일치', () => {
    // 변 길이가 서로 다른 비균일 사각형 (alpha=0.5 centripetal)
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 1 },
      { x: 0, y: 1 },
    ];
    const out: PathCommand[] = [];
    catmullRomPathInto(out, pts, { alpha: 0.5, closed: true });
    // move + 4 cubic + close = 6
    expect(out.length).toBe(6);

    // closed n=4: globalT = (si + 0.5) / 4 로 segment si의 midpoint를 참조한다
    const n = pts.length;
    const moveCmd = out[0] as MoveCommand;
    for (let si = 0; si < n; si++) {
      const cubic = out[si + 1] as CubicCommand;
      // si=0이면 시작점은 moveCmd, si>0이면 앞 cubic의 endpoint
      const c0x = si === 0 ? moveCmd.x : (out[si] as CubicCommand).x;
      const c0y = si === 0 ? moveCmd.y : (out[si] as CubicCommand).y;

      const bezMid = evalBezier(c0x, c0y, cubic.x1, cubic.y1, cubic.x2, cubic.y2, cubic.x, cubic.y, 0.5);

      const globalT = (si + 0.5) / n;
      const ref = { x: 0, y: 0 };
      catmullRomPointAtTInto(ref, pts, globalT, { alpha: 0.5, closed: true });

      expect(Math.abs(bezMid.x - ref.x)).toBeLessThan(TOL);
      expect(Math.abs(bezMid.y - ref.y)).toBeLessThan(TOL);
    }
  });
});
