/**
 * curve의 공개 경로로 닿는 경계·퇴화 분기 테스트.
 *
 * 검증 항목:
 *  1. monotone PCHIP의 끝 기울기 보정(부호 불일치, 3배 초과)과 helper의 빈 segment 처리.
 *  2. 극점 탐색이 (0,1) 밖 근과 중복 근을 걸러낸다.
 *  3. cubicIsLinear·cubicIsSimple의 경계 판정.
 *  4. quadraticLineIntersectionsInto의 선형·중근 경계.
 *  5. endpointArcToCenterInto의 반지름 퇴화와 수치 underflow.
 */
import { describe, expect, test } from 'vitest';
import { cubicExtrema } from '../../../src/curve/cubic-extrema';
import { cubicIsLinear } from '../../../src/curve/cubic-is-linear';
import { cubicIsSimple } from '../../../src/curve/cubic-is-simple';
import { cubicSegmentsToPathInto, cubicSegmentsToPolylineInto } from '../../../src/curve/curve-segments.internal';
import { endpointArcToCenterInto } from '../../../src/curve/endpoint-arc-to-center-into';
import { monotoneXPathInto } from '../../../src/curve/monotone-x-path-into';
import { quadraticExtrema } from '../../../src/curve/quadratic-extrema';
import { quadraticLineIntersectionsInto } from '../../../src/curve/quadratic-line-intersections-into';
import type { CenterArcWritable, IntersectionHit, PathCommand } from '../../../src/types';

/**
 * x = 0, 1, 2에 y 값을 놓은 monotoneX path를 만들고 cubic command만 돌려준다.
 * 끝 기울기 보정은 첫·마지막 cubic의 제어점 y에 드러난다.
 */
function monotoneCubics(ys: number[]): Extract<PathCommand, { kind: 'cubic' }>[] {
  const out: PathCommand[] = [];
  monotoneXPathInto(
    out,
    ys.map((y, x) => ({ x, y }))
  );
  return out.filter((c): c is Extract<PathCommand, { kind: 'cubic' }> => c.kind === 'cubic');
}

describe('monotone 끝 기울기 보정', () => {
  test('첫 기울기가 이웃 기울기와 부호가 다르면 끝 접선을 0으로 만든다', () => {
    // 비대칭 추정은 -3.5라 부호가 달라진다. 보정이 없으면 y1이 -3.5 / 3이 된다.
    const [first] = monotoneCubics([0, 1, 11]);
    expect(first.y1).toBe(0);
  });

  test('끝 기울기가 3배를 넘고 이웃과 부호가 반대면 3배로 제한한다', () => {
    // 비대칭 추정은 6.5라 첫 기울기 1의 3배(3)로 제한된다. y1 = 0 + 3 * (1 / 3).
    const [first] = monotoneCubics([0, 1, -9]);
    expect(first.y1).toBeCloseTo(1, 12);
  });

  test('마지막 기울기도 같은 규칙으로 제한한다', () => {
    const cubics = monotoneCubics([-9, 1, 0]);
    expect(cubics[1].y2).toBeCloseTo(1, 12);
  });

  test('마지막 기울기가 이웃과 부호가 다르면 0으로 만든다', () => {
    const cubics = monotoneCubics([11, 1, 0]);
    expect(cubics[1].y2).toBe(0);
  });
});

describe('curve-segments helper', () => {
  test('cubicSegmentsToPathInto는 segment가 0개면 기존 내용을 비운다', () => {
    const out: PathCommand[] = [{ kind: 'move', x: 1, y: 1 }];
    expect(cubicSegmentsToPathInto(out, [], 0)).toHaveLength(0);
  });

  test('cubicSegmentsToPolylineInto는 segment가 0개면 기존 내용을 비운다', () => {
    const out = [{ x: 1, y: 1 }];
    expect(cubicSegmentsToPolylineInto(out, [], 0, 4)).toHaveLength(0);
  });
});

describe('극점 탐색', () => {
  test('quadraticExtrema는 x 극점이 0 미만이면 제외한다', () => {
    expect(quadraticExtrema({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 2 })).toEqual([]);
  });

  test('quadraticExtrema는 x 극점이 1 초과이면 제외한다', () => {
    expect(quadraticExtrema({ x: 0, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 })).toEqual([]);
  });

  test('quadraticExtrema는 y 극점이 0 미만이면 제외한다', () => {
    expect(quadraticExtrema({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 3 })).toEqual([]);
  });

  test('quadraticExtrema는 y 극점이 1 초과이면 제외한다', () => {
    expect(quadraticExtrema({ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 3 })).toEqual([]);
  });

  test('cubicExtrema는 x와 y의 극점이 같으면 한 번만 돌려준다', () => {
    expect(cubicExtrema({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 0 })).toEqual([0.5]);
  });
});

describe('cubicIsLinear 경계', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 0 };
  const p3 = { x: 3, y: 0 };

  test('p2가 chord 밖이면 false다', () => {
    expect(cubicIsLinear(p0, p1, { x: 2, y: 1 }, p3)).toBe(false);
  });

  test('p2가 chord 위지만 2/3 위치가 아니면 false다', () => {
    expect(cubicIsLinear(p0, p1, { x: 2.5, y: 0 }, p3)).toBe(false);
  });
});

describe('cubicIsSimple 경계', () => {
  test('판별식이 허용치 이하로 살짝 음수이면 loop로 보지 않는다', () => {
    // inflection 방정식 3t² + 6t + (3 + δ), δ = 1e-11. 판별식은 -12δ로 상대 임계 3.6e-9보다 작다.
    const delta = 1e-11;
    const p1x = -delta / 3;
    const p2x = 0.5 - (2 * delta) / 3;
    const p3x = 2.5 - delta;
    expect(cubicIsSimple({ x: 0, y: 0 }, { x: p1x, y: 2 / 3 }, { x: p2x, y: 5 / 3 }, { x: p3x, y: 3 })).toBe(true);
  });
});

describe('quadraticLineIntersectionsInto 경계', () => {
  const straight = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ] as const;

  /** 점 (x, 0)을 지나는 수직선을 만든다. */
  function verticalLineAt(x: number) {
    return { origin: { x, y: 0 }, direction: { x: 0, y: 1 } };
  }

  /** 직선처럼 놓인 quadratic과 수직선의 교차를 구한다. */
  function hitsAt(x: number): IntersectionHit[] {
    return quadraticLineIntersectionsInto([], straight[0], straight[1], straight[2], verticalLineAt(x));
  }

  test('선형 방정식의 근이 시작점이면 touch로 분류한다', () => {
    const hits = hitsAt(0);
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
  });

  test('선형 방정식의 근이 끝점이면 touch로 분류한다', () => {
    const hits = hitsAt(2);
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
  });

  test('선형 방정식의 근이 내부이면 cross로 분류한다', () => {
    const hits = hitsAt(1);
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('cross');
  });

  test('선형 방정식의 근이 범위 밖이면 교차가 없다', () => {
    expect(hitsAt(5)).toEqual([]);
  });

  test('중근이 곡선 범위 밖이면 교차가 없다', () => {
    // y(t) = (t - 2)²의 중근 t = 2는 [0, 1] 밖이다.
    const hits = quadraticLineIntersectionsInto(
      [],
      { x: 0, y: 4 },
      { x: 1, y: 2 },
      { x: 2, y: 1 },
      {
        origin: { x: 0, y: 0 },
        direction: { x: 1, y: 0 },
      }
    );
    expect(hits).toEqual([]);
  });
});

describe('endpointArcToCenterInto 퇴화', () => {
  /** 값이 모두 0인 쓰기용 center arc를 만든다. 각 테스트가 덮어쓰는 필드를 구분하기 쉽다. */
  const blank = (): CenterArcWritable => ({
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    xRotation: 0,
    startAngle: 0,
    endAngle: 0,
    sweep: false,
  });
  /** 반지름과 끝점만 바꿔 쓰는 arc command를 만든다. flag는 작은 호·sweep 방향으로 고정한다. */
  const arcTo = (rx: number, ry: number, x: number, y: number) => ({
    kind: 'arc' as const,
    rx,
    ry,
    xRotation: 0,
    largeArc: false,
    sweep: true,
    x,
    y,
  });

  test('rx가 0이면 zero-length arc를 기록한다', () => {
    const out = endpointArcToCenterInto(blank(), { x: 0, y: 0 }, arcTo(0, 1, 2, 0));
    expect(out).toMatchObject({ cx: 1, cy: 0, startAngle: 0, endAngle: 0 });
  });

  test('rx는 양수이고 ry가 0이면 zero-length arc를 기록한다', () => {
    const out = endpointArcToCenterInto(blank(), { x: 0, y: 0 }, arcTo(1, 0, 2, 0));
    expect(out).toMatchObject({ cx: 1, cy: 0, startAngle: 0, endAngle: 0 });
  });

  test('두 끝점 차이가 제곱하면 underflow되는 크기여도 NaN 없이 중점을 center로 쓴다', () => {
    const out = endpointArcToCenterInto(blank(), { x: 0, y: 0 }, arcTo(1, 1, 3e-200, 0));
    expect(Number.isFinite(out.cx)).toBe(true);
    expect(Number.isFinite(out.cy)).toBe(true);
    expect(Number.isFinite(out.startAngle)).toBe(true);
    expect(Number.isFinite(out.endAngle)).toBe(true);
    expect(out.cx).toBeCloseTo(0, 12);
  });
});
