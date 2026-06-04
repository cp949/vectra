/**
 * bspline.test.ts
 *
 * Uniform cubic B-Spline 내부 커널 및 public API 테스트.
 * bsplineSegmentCount, bsplineGetPoints, bsplineSegmentAt 커널.
 * bsplinePointAtTInto / bsplinePointAtT.
 * bsplinePolylineInto.
 * bsplinePathInto.
 */
import { describe, expect, it } from 'vitest';
import { bsplineGetPoints, bsplineSegmentAt, bsplineSegmentCount } from '../../src/curve/bspline.internal';
import { bsplinePointAtT } from '../../src/curve/bspline-point-at-t';
import { bsplinePointAtTInto } from '../../src/curve/bspline-point-at-t-into';
import { bsplinePolylineInto } from '../../src/curve/bspline-polyline-into';

const TOL = 1e-10;

const pts5 = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 3, y: 3 },
  { x: 5, y: 1 },
  { x: 6, y: 4 },
];

const pts3 = [
  { x: 0, y: 0 },
  { x: 2, y: 4 },
  { x: 4, y: 0 },
];

describe('bsplineSegmentCount', () => {
  it('open n=4 → 1', () => expect(bsplineSegmentCount(4, false)).toBe(1));
  it('open n=5 → 2', () => expect(bsplineSegmentCount(5, false)).toBe(2));
  it('open n=3 → 0', () => expect(bsplineSegmentCount(3, false)).toBe(0));
  it('open n=2 → 0', () => expect(bsplineSegmentCount(2, false)).toBe(0));
  it('open n=1 → 0', () => expect(bsplineSegmentCount(1, false)).toBe(0));
  it('closed n=3 → 3', () => expect(bsplineSegmentCount(3, true)).toBe(3));
  it('closed n=4 → 4', () => expect(bsplineSegmentCount(4, true)).toBe(4));
  it('closed n=1 → 1', () => expect(bsplineSegmentCount(1, true)).toBe(1));
});

describe('bsplineGetPoints', () => {
  it('open 5점 span=0: index 0,1,2,3 좌표 반환', () => {
    const r = bsplineGetPoints(pts5, 0, false);
    expect(r).toEqual([0, 0, 1, 2, 3, 3, 5, 1]);
  });

  it('open 5점 span=1: index 1,2,3,4 좌표 반환', () => {
    const r = bsplineGetPoints(pts5, 1, false);
    expect(r).toEqual([1, 2, 3, 3, 5, 1, 6, 4]);
  });

  it('closed 3점 span=2: wrap-around index 2,0,1,2 좌표 반환', () => {
    const r = bsplineGetPoints(pts3, 2, true);
    expect(r).toEqual([4, 0, 0, 0, 2, 4, 4, 0]);
  });
});

describe('bsplineSegmentAt', () => {
  // 직선 위 등간격 4점: p0=(0,0), p1=(6,0), p2=(12,0), p3=(18,0)
  const p0x = 0,
    p0y = 0;
  const p1x = 6,
    p1y = 0;
  const p2x = 12,
    p2y = 0;
  const p3x = 18,
    p3y = 0;

  it('t=0이면 (1/6)(p0 + 4*p1 + p2) 를 반환한다', () => {
    const out = { x: 0, y: 0 };
    bsplineSegmentAt(out, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, 0);
    const expected = (1 / 6) * (0 + 4 * 6 + 12); // 6
    expect(Math.abs(out.x - expected)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 0)).toBeLessThan(TOL);
  });

  it('t=1이면 (1/6)(p1 + 4*p2 + p3) 를 반환한다', () => {
    const out = { x: 0, y: 0 };
    bsplineSegmentAt(out, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, 1);
    const expected = (1 / 6) * (6 + 4 * 12 + 18); // 12
    expect(Math.abs(out.x - expected)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 0)).toBeLessThan(TOL);
  });

  it('t=0.5이면 basis 가중합 중간값을 반환한다', () => {
    const out = { x: 0, y: 0 };
    bsplineSegmentAt(out, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, 0.5);
    const t = 0.5;
    const t2 = t * t;
    const t3 = t2 * t;
    const n0 = (1 / 6) * (1 - t) ** 3;
    const n1 = (1 / 6) * (3 * t3 - 6 * t2 + 4);
    const n2 = (1 / 6) * (-3 * t3 + 3 * t2 + 3 * t + 1);
    const n3 = (1 / 6) * t3;
    const expected = n0 * 0 + n1 * 6 + n2 * 12 + n3 * 18;
    expect(Math.abs(out.x - expected)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 0)).toBeLessThan(TOL);
  });
});

// ─── bsplinePointAtTInto / bsplinePointAtT ───────────────────────────────────

describe('bsplinePointAtTInto — open curve 직선 4점', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ];

  it('t=0 → x=1, y=0', () => {
    const out = { x: 0, y: 0 };
    bsplinePointAtTInto(out, points, 0);
    expect(Math.abs(out.x - 1)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 0)).toBeLessThan(TOL);
  });

  it('t=1 → x=2, y=0', () => {
    const out = { x: 0, y: 0 };
    bsplinePointAtTInto(out, points, 1);
    expect(Math.abs(out.x - 2)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 0)).toBeLessThan(TOL);
  });
});

describe('bsplinePointAtTInto — open curve x·y 모두 변화하는 4점', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 0 },
  ];

  it('t=0 → x=1, y=10/6', () => {
    const out = { x: 0, y: 0 };
    bsplinePointAtTInto(out, points, 0);
    expect(Math.abs(out.x - 1)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 10 / 6)).toBeLessThan(TOL);
  });

  it('t=1 → x=2, y=10/6', () => {
    const out = { x: 0, y: 0 };
    bsplinePointAtTInto(out, points, 1);
    expect(Math.abs(out.x - 2)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 10 / 6)).toBeLessThan(TOL);
  });
});

describe('bsplinePointAtTInto — C0 연속성 span 경계', () => {
  // 5점 open: spanCount=2, t=0.5가 span 경계
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 3, y: 3 },
    { x: 5, y: 1 },
    { x: 6, y: 4 },
  ];

  it('t=0.5 직전과 직후가 같은 점을 반환한다', () => {
    const eps = 1e-9;
    const outBefore = { x: 0, y: 0 };
    const outAfter = { x: 0, y: 0 };
    bsplinePointAtTInto(outBefore, points, 0.5 - eps);
    bsplinePointAtTInto(outAfter, points, 0.5 + eps);
    // C0 연속이면 두 결과가 매우 가까워야 한다
    expect(Math.abs(outBefore.x - outAfter.x)).toBeLessThan(1e-6);
    expect(Math.abs(outBefore.y - outAfter.y)).toBeLessThan(1e-6);
  });

  it('t=0.5 정확한 경계값: span0 localT=1 결과와 동일', () => {
    // span0의 localT=1: bsplineSegmentAt(p0,p1,p2,p3, 1) = (1/6)(p1 + 4*p2 + p3)
    // p0=(0,0), p1=(1,2), p2=(3,3), p3=(5,1)
    const expectedX = (1 / 6) * (1 + 4 * 3 + 5);
    const expectedY = (1 / 6) * (2 + 4 * 3 + 1);
    const out = { x: 0, y: 0 };
    bsplinePointAtTInto(out, points, 0.5);
    expect(Math.abs(out.x - expectedX)).toBeLessThan(TOL);
    expect(Math.abs(out.y - expectedY)).toBeLessThan(TOL);
  });
});

describe('bsplinePointAtTInto — closed curve', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 0 },
    { x: 1, y: -2 },
  ];

  it('t=0과 t=1이 동일 결과 (loop 연속성)', () => {
    const outStart = { x: 0, y: 0 };
    const outEnd = { x: 0, y: 0 };
    bsplinePointAtTInto(outStart, points, 0, { closed: true });
    bsplinePointAtTInto(outEnd, points, 1, { closed: true });
    expect(Math.abs(outStart.x - outEnd.x)).toBeLessThan(TOL);
    expect(Math.abs(outStart.y - outEnd.y)).toBeLessThan(TOL);
  });
});

describe('bsplinePointAtTInto — degenerate 처리', () => {
  it('n=0 → {x:0, y:0}', () => {
    const out = { x: 99, y: 99 };
    bsplinePointAtTInto(out, [], 0.5);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('n=1 → 해당 점', () => {
    const out = { x: 0, y: 0 };
    bsplinePointAtTInto(out, [{ x: 7, y: 3 }], 0.5);
    expect(Math.abs(out.x - 7)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 3)).toBeLessThan(TOL);
  });

  it('open n=3 (spanCount=0) → points[0] 반환', () => {
    const pts = [
      { x: 1, y: 5 },
      { x: 2, y: 6 },
      { x: 3, y: 7 },
    ];
    const out = { x: 0, y: 0 };
    bsplinePointAtTInto(out, pts, 0.5);
    expect(Math.abs(out.x - 1)).toBeLessThan(TOL);
    expect(Math.abs(out.y - 5)).toBeLessThan(TOL);
  });
});

describe('bsplinePointAtT — allocating companion', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ];

  it('bsplinePointAtTInto와 동일 결과를 새 object로 반환한다', () => {
    const ref = { x: 0, y: 0 };
    bsplinePointAtTInto(ref, points, 0.3);
    const result = bsplinePointAtT(points, 0.3);
    expect(Math.abs(result.x - ref.x)).toBeLessThan(TOL);
    expect(Math.abs(result.y - ref.y)).toBeLessThan(TOL);
  });

  it('새 object를 반환한다 (동일 참조 아님)', () => {
    const result1 = bsplinePointAtT(points, 0.5);
    const result2 = bsplinePointAtT(points, 0.5);
    expect(result1).not.toBe(result2);
  });
});

// ─── bsplinePolylineInto ─────────────────────────────────────────────────────

describe('bsplinePolylineInto — 기본 동작', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 3, y: 3 },
    { x: 5, y: 1 },
    { x: 6, y: 4 },
  ];

  it('open 5점 기본 steps=32 → out.length === 32', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, points);
    expect(out.length).toBe(32);
  });

  it('steps 숫자 옵션: steps=8 → out.length === 8', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, points, 8);
    expect(out.length).toBe(8);
  });

  it('steps 객체 옵션: steps=16 → out.length === 16', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, points, { steps: 16 });
    expect(out.length).toBe(16);
  });

  it('steps=1 → out.length === 1 (t=0 단일 점)', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, points, 1);
    expect(out.length).toBe(1);
    // t=0 점과 bsplinePointAtTInto(t=0) 결과 비교
    const ref = { x: 0, y: 0 };
    bsplinePointAtTInto(ref, points, 0);
    expect(Math.abs(out[0].x - ref.x)).toBeLessThan(TOL);
    expect(Math.abs(out[0].y - ref.y)).toBeLessThan(TOL);
  });

  it('out 재사용: 기존 내용 있어도 length=0으로 초기화됨', () => {
    const out: { x: number; y: number }[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    bsplinePolylineInto(out, points, 4);
    expect(out.length).toBe(4);
  });
});

describe('bsplinePolylineInto — closed curve', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 0 },
    { x: 1, y: -2 },
  ];

  it('closed steps=16 → out.length === 16', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, points, { closed: true, steps: 16 });
    expect(out.length).toBe(16);
  });

  it('closed loop 연속성: t=0 점이 t=15/16 다음 이어짐 (첫/끝 좌표가 가까움)', () => {
    const steps = 16;
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, points, { closed: true, steps });
    // t=0 점과 t=1 (= closed loop) 결과를 bsplinePointAtTInto로 확인
    const atZero = { x: 0, y: 0 };
    const atOne = { x: 0, y: 0 };
    bsplinePointAtTInto(atZero, points, 0, { closed: true });
    bsplinePointAtTInto(atOne, points, 1, { closed: true });
    // t=0과 t=1은 같은 점 (loop 연속성)
    expect(Math.abs(atZero.x - atOne.x)).toBeLessThan(TOL);
    expect(Math.abs(atZero.y - atOne.y)).toBeLessThan(TOL);
    // out[0]이 t=0 점과 일치
    expect(Math.abs(out[0].x - atZero.x)).toBeLessThan(TOL);
    expect(Math.abs(out[0].y - atZero.y)).toBeLessThan(TOL);
  });
});

describe('bsplinePolylineInto — degenerate 처리', () => {
  it('open n=3 → out.length === 0', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ]);
    expect(out.length).toBe(0);
  });

  it('open n=0 → out.length === 0', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, []);
    expect(out.length).toBe(0);
  });

  it('steps=0 → out.length === 0', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 0 },
    ];
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, pts, 0);
    expect(out.length).toBe(0);
  });

  it('steps=-1 → out.length === 0', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 0 },
    ];
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, pts, -1);
    expect(out.length).toBe(0);
  });

  it('closed n=0 → out.length === 0', () => {
    const out: { x: number; y: number }[] = [];
    bsplinePolylineInto(out, [], { closed: true });
    expect(out.length).toBe(0);
  });
});

// ─── bsplinePathInto ─────────────────────────────────────────────────────────

import { bsplinePathInto } from '../../src/curve/bspline-path-into';
import type { CubicCommand, MoveCommand, PathCommand } from '../../src/types';

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
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * u * c0x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * c3x,
    y: u * u * u * c0y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * c3y,
  };
}

describe('bsplinePathInto', () => {
  it('open n=4 (span 1개): 구조 확인', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    const out = bsplinePathInto([] as PathCommand[], pts);
    expect(out.length).toBe(2);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('cubic');
  });

  it('open n=4 직선 위 점: c0/c3 수치 확인', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    const out = bsplinePathInto([] as PathCommand[], pts);
    const move = out[0] as MoveCommand;
    const cubic = out[1] as CubicCommand;
    // c0x = (0 + 4*1 + 2) / 6 = 1
    expect(Math.abs(move.x - 1)).toBeLessThan(TOL);
    expect(Math.abs(move.y - 0)).toBeLessThan(TOL);
    // c3x = (1 + 4*2 + 3) / 6 = 2
    expect(Math.abs(cubic.x - 2)).toBeLessThan(TOL);
    expect(Math.abs(cubic.y - 0)).toBeLessThan(TOL);
  });

  it('degenerate open n=3: out.length===0', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    const out = bsplinePathInto([] as PathCommand[], pts);
    expect(out.length).toBe(0);
  });

  it('degenerate empty: out.length===0', () => {
    const out = bsplinePathInto([] as PathCommand[], []);
    expect(out.length).toBe(0);
  });

  it('open n=5 (span 2개): out.length===3', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 3 },
      { x: 5, y: 0 },
    ];
    const out = bsplinePathInto([] as PathCommand[], pts);
    expect(out.length).toBe(3);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('cubic');
    expect(out[2].kind).toBe('cubic');
  });

  it('closed n=4: out.length===6 (move + 4 cubic + close)', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 0 },
    ];
    const out = bsplinePathInto([] as PathCommand[], pts, { closed: true });
    expect(out.length).toBe(6);
    expect(out[0].kind).toBe('move');
    expect(out[out.length - 1].kind).toBe('close');
  });

  it('수치 일치: span 0 Bezier midpoint vs bsplinePointAtTInto(globalT=0.25)', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 3 },
      { x: 5, y: 0 },
    ];
    const out = bsplinePathInto([] as PathCommand[], pts);
    const move = out[0] as MoveCommand;
    const cubic = out[1] as CubicCommand;
    // span 0 Bezier를 t=0.5에서 평가
    const fromBezier = evalBezier(move.x, move.y, cubic.x1, cubic.y1, cubic.x2, cubic.y2, cubic.x, cubic.y, 0.5);
    // bsplinePointAtTInto: globalT=0.25 → span 0, localT=0.5
    const ref = { x: 0, y: 0 };
    bsplinePointAtTInto(ref, pts, 0.25);
    expect(Math.abs(fromBezier.x - ref.x)).toBeLessThan(TOL);
    expect(Math.abs(fromBezier.y - ref.y)).toBeLessThan(TOL);
  });

  it('multi-span: span 경계 C0 연속성 (span i의 c3 == span i+1의 c0)', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 3 },
      { x: 5, y: 1 },
      { x: 6, y: 4 },
    ];
    const out: PathCommand[] = [];
    bsplinePathInto(out, pts);
    // span 0 endpoint (out[1].x, out[1].y)
    const span0End = out[1] as CubicCommand;
    // span 1 c0x = (p1x + 4*p2x + p3x) / 6 = (1 + 4*3 + 5) / 6 = 3
    const span1C0x = (1 + 4 * 3 + 5) / 6;
    const span1C0y = (2 + 4 * 3 + 1) / 6;
    expect(Math.abs(span0End.x - span1C0x)).toBeLessThan(TOL);
    expect(Math.abs(span0End.y - span1C0y)).toBeLessThan(TOL);
  });

  it('closed curve: 마지막 span endpoint가 첫 move point와 일치', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ];
    const out: PathCommand[] = [];
    bsplinePathInto(out, pts, { closed: true });
    const move = out[0] as MoveCommand;
    // close 커맨드 바로 앞이 마지막 cubic
    const lastCubic = out[out.length - 2] as CubicCommand;
    expect(Math.abs(lastCubic.x - move.x)).toBeLessThan(TOL);
    expect(Math.abs(lastCubic.y - move.y)).toBeLessThan(TOL);
  });
});
