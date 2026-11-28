/**
 * curve 도메인 컬렉션 companion이 대응 *Into 함수와 같은 결과를 내는지 검증한다.
 * 짧은 입력의 빈 배열, 잘못된 옵션의 RangeError, 항목 수도 다룬다.
 * split, controlPoints companion이 매번 새 객체를 돌려주는지도 확인한다.
 */
import { flatQuadraticFromLegacyPoints, flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';
import { describe, expect, test } from 'vitest';
import { arcFlatten } from '../../../src/curve/arc-flatten';
import { arcFlattenInto } from '../../../src/curve/arc-flatten-into';
import { arcSample } from '../../../src/curve/arc-sample';
import { arcSampleInto } from '../../../src/curve/arc-sample-into';
import { arcSplitAt } from '../../../src/curve/arc-split-at';
import { arcToCubic } from '../../../src/curve/arc-to-cubic';
import { bsplinePath } from '../../../src/curve/bspline-path';
import { bsplinePathInto } from '../../../src/curve/bspline-path-into';
import { bsplinePolyline } from '../../../src/curve/bspline-polyline';
import { bsplinePolylineInto } from '../../../src/curve/bspline-polyline-into';
import { bumpXPath } from '../../../src/curve/bump-x-path';
import { bumpXPathInto } from '../../../src/curve/bump-x-path-into';
import { bumpYPath } from '../../../src/curve/bump-y-path';
import { bumpYPathInto } from '../../../src/curve/bump-y-path-into';
import { cardinalPath } from '../../../src/curve/cardinal-path';
import { cardinalPathInto } from '../../../src/curve/cardinal-path-into';
import { cardinalPolyline } from '../../../src/curve/cardinal-polyline';
import { cardinalPolylineInto } from '../../../src/curve/cardinal-polyline-into';
import { catmullRomPath } from '../../../src/curve/catmull-rom-path';
import { catmullRomPathInto } from '../../../src/curve/catmull-rom-path-into';
import { catmullRomPolyline } from '../../../src/curve/catmull-rom-polyline';
import { catmullRomPolylineInto } from '../../../src/curve/catmull-rom-polyline-into';
import { controlPoints } from '../../../src/curve/control-points';
import { controlPointsInto } from '../../../src/curve/control-points-into';
import { cubicChainFlatten } from '../../../src/curve/cubic-chain-flatten';
import { cubicChainFlattenInto } from '../../../src/curve/cubic-chain-flatten-into';
import { cubicFlatten } from '../../../src/curve/cubic-flatten';
import { cubicFlattenInto } from '../../../src/curve/cubic-flatten-into';
import { cubicHull } from '../../../src/curve/cubic-hull';
import { cubicHullInto } from '../../../src/curve/cubic-hull-into';
import { cubicSample } from '../../../src/curve/cubic-sample';
import { cubicSampleInto } from '../../../src/curve/cubic-sample-into';
import { cubicSplit } from '../../../src/curve/cubic-split';
import { cubicSplitInto } from '../../../src/curve/cubic-split-into';
import { cubicToArcs } from '../../../src/curve/cubic-to-arcs';
import { monotoneXPath } from '../../../src/curve/monotone-x-path';
import { monotoneXPathInto } from '../../../src/curve/monotone-x-path-into';
import { monotoneXPolyline } from '../../../src/curve/monotone-x-polyline';
import { monotoneXPolylineInto } from '../../../src/curve/monotone-x-polyline-into';
import { monotoneYPath } from '../../../src/curve/monotone-y-path';
import { monotoneYPathInto } from '../../../src/curve/monotone-y-path-into';
import { monotoneYPolyline } from '../../../src/curve/monotone-y-polyline';
import { monotoneYPolylineInto } from '../../../src/curve/monotone-y-polyline-into';
import { naturalSplinePath } from '../../../src/curve/natural-spline-path';
import { naturalSplinePathInto } from '../../../src/curve/natural-spline-path-into';
import { naturalSplinePolyline } from '../../../src/curve/natural-spline-polyline';
import { naturalSplinePolylineInto } from '../../../src/curve/natural-spline-polyline-into';
import { quadraticFlatten } from '../../../src/curve/quadratic-flatten';
import { quadraticFlattenInto } from '../../../src/curve/quadratic-flatten-into';
import { quadraticHull } from '../../../src/curve/quadratic-hull';
import { quadraticHullInto } from '../../../src/curve/quadratic-hull-into';
import { quadraticSample } from '../../../src/curve/quadratic-sample';
import { quadraticSampleInto } from '../../../src/curve/quadratic-sample-into';
import { quadraticSplit } from '../../../src/curve/quadratic-split';
import { quadraticSplitInto } from '../../../src/curve/quadratic-split-into';
import { stepAfterPath } from '../../../src/curve/step-after-path';
import { stepAfterPathInto } from '../../../src/curve/step-after-path-into';
import { stepBeforePath } from '../../../src/curve/step-before-path';
import { stepBeforePathInto } from '../../../src/curve/step-before-path-into';
import { stepPath } from '../../../src/curve/step-path';
import { stepPathInto } from '../../../src/curve/step-path-into';
import { stepPolyline } from '../../../src/curve/step-polyline';
import { stepPolylineInto } from '../../../src/curve/step-polyline-into';

const P0 = { x: 0, y: 0 };
const P1 = { x: 5, y: 10 };
const P2 = { x: 10, y: 0 };
const P3 = { x: 15, y: 5 };
const POINTS = [P0, P1, P2, P3];
const CENTER_ARC = {
  cx: 0,
  cy: 0,
  rx: 10,
  ry: 10,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI,
  sweep: true,
};

type CompanionCase = {
  name: string;
  actual: () => unknown;
  expected: () => unknown;
  empty?: () => unknown[];
  rangeError?: () => unknown;
  length?: number;
};

/**
 * void를 돌려주는 *PolylineInto 함수의 출력을 새 배열로 모은다.
 * companion 기대값을 out 배열 형태로 맞출 때 쓴다.
 */
function collect(fill: (out: any[]) => void): any[] {
  const out: any[] = [];
  fill(out);
  return out;
}

/**
 * companion 사례 하나로 describe 블록을 만든다.
 * 사례에 있는 필드에 따라 동등성, 빈 배열, RangeError, 길이 시험을 등록한다.
 */
function defineCompanionCase(companionCase: CompanionCase): void {
  describe(companionCase.name, () => {
    test(`${companionCase.name}Into 결과와 deep equal이다`, () => {
      expect(companionCase.actual()).toEqual(companionCase.expected());
    });

    if (companionCase.empty) {
      test('invalid-size input은 empty array를 반환한다', () => {
        expect(companionCase.empty?.()).toEqual([]);
      });
    }

    if (companionCase.rangeError) {
      test('invalid option이면 RangeError를 던진다', () => {
        expect(companionCase.rangeError).toThrow(RangeError);
      });
    }

    if (companionCase.length !== undefined) {
      const expectedLength = companionCase.length;
      test(`총 ${expectedLength}개의 항목을 반환한다`, () => {
        expect(companionCase.actual()).toHaveLength(expectedLength);
      });
    }
  });
}

const companionCases = [
  {
    name: 'arcFlatten',
    actual: () => arcFlatten(CENTER_ARC),
    expected: () => arcFlattenInto([], CENTER_ARC),
  },
  {
    name: 'arcSample',
    actual: () => arcSample(CENTER_ARC, { steps: 8 }),
    expected: () => arcSampleInto([], CENTER_ARC, { steps: 8 }),
    rangeError: () => arcSample(CENTER_ARC, { steps: 1 }),
  },
  {
    name: 'quadraticFlatten',
    actual: () => quadraticFlatten(flatQuadraticFromLegacyPoints(P0, P1, P2)),
    expected: () => quadraticFlattenInto([], flatQuadraticFromLegacyPoints(P0, P1, P2)),
  },
  {
    name: 'quadraticSample',
    actual: () => quadraticSample(flatQuadraticFromLegacyPoints(P0, P1, P2), { steps: 8 }),
    expected: () => quadraticSampleInto([], flatQuadraticFromLegacyPoints(P0, P1, P2), { steps: 8 }),
    rangeError: () => quadraticSample(flatQuadraticFromLegacyPoints(P0, P1, P2), { steps: 1 }),
  },
  {
    name: 'quadraticHull',
    actual: () => quadraticHull(flatQuadraticFromLegacyPoints(P0, P1, P2), 0.5),
    expected: () => quadraticHullInto([], flatQuadraticFromLegacyPoints(P0, P1, P2), 0.5),
    length: 6,
  },
  {
    name: 'cubicFlatten',
    actual: () => cubicFlatten(flatCubicFromLegacyPoints(P0, P1, P2, P3)),
    expected: () => cubicFlattenInto([], flatCubicFromLegacyPoints(P0, P1, P2, P3)),
  },
  {
    name: 'cubicChainFlatten',
    actual: () => cubicChainFlatten(POINTS),
    expected: () => cubicChainFlattenInto([], POINTS),
    empty: () => cubicChainFlatten([P0, P1, P2]),
  },
  {
    name: 'cubicSample',
    actual: () => cubicSample(flatCubicFromLegacyPoints(P0, P1, P2, P3), { steps: 8 }),
    expected: () => cubicSampleInto([], flatCubicFromLegacyPoints(P0, P1, P2, P3), { steps: 8 }),
    rangeError: () => cubicSample(flatCubicFromLegacyPoints(P0, P1, P2, P3), { steps: 1 }),
  },
  {
    name: 'cubicHull',
    actual: () => cubicHull(flatCubicFromLegacyPoints(P0, P1, P2, P3), 0.5),
    expected: () => cubicHullInto([], flatCubicFromLegacyPoints(P0, P1, P2, P3), 0.5),
    length: 10,
  },
  {
    name: 'catmullRomPolyline',
    actual: () => catmullRomPolyline(POINTS, { steps: 8, alpha: 0.5, closed: false }),
    expected: () => collect((out) => catmullRomPolylineInto(out, POINTS, { steps: 8, alpha: 0.5, closed: false })),
    empty: () => catmullRomPolyline([P0], { steps: 8, alpha: 0.5, closed: false }),
  },
  {
    name: 'catmullRomPath',
    actual: () => catmullRomPath(POINTS),
    expected: () => catmullRomPathInto([], POINTS),
    empty: () => catmullRomPath([P0]),
  },
  {
    name: 'cardinalPolyline',
    actual: () => cardinalPolyline(POINTS, { steps: 8, tension: 0, closed: false }),
    expected: () => collect((out) => cardinalPolylineInto(out, POINTS, { steps: 8, tension: 0, closed: false })),
    empty: () => cardinalPolyline([P0], { steps: 8, tension: 0, closed: false }),
  },
  {
    name: 'cardinalPath',
    actual: () => cardinalPath(POINTS),
    expected: () => cardinalPathInto([], POINTS),
    empty: () => cardinalPath([P0]),
  },
  {
    name: 'bsplinePolyline',
    actual: () => bsplinePolyline(POINTS, { steps: 8, closed: false }),
    expected: () => collect((out) => bsplinePolylineInto(out, POINTS, { steps: 8, closed: false })),
    empty: () => bsplinePolyline([P0, P1, P2], { steps: 8, closed: false }),
  },
  {
    name: 'bsplinePath',
    actual: () => bsplinePath(POINTS),
    expected: () => bsplinePathInto([], POINTS),
    empty: () => bsplinePath([P0, P1, P2]),
  },
  {
    name: 'stepPolyline',
    actual: () => stepPolyline(POINTS, { mode: 'before' }),
    expected: () => collect((out) => stepPolylineInto(out, POINTS, { mode: 'before' })),
    empty: () => stepPolyline([P0]),
  },
  {
    name: 'stepPath',
    actual: () => stepPath(POINTS, { mode: 'after' }),
    expected: () => stepPathInto([], POINTS, { mode: 'after' }),
    empty: () => stepPath([P0]),
  },
  {
    name: 'stepBeforePath',
    actual: () => stepBeforePath(POINTS),
    expected: () => stepBeforePathInto([], POINTS),
    empty: () => stepBeforePath([P0]),
  },
  {
    name: 'stepAfterPath',
    actual: () => stepAfterPath(POINTS),
    expected: () => stepAfterPathInto([], POINTS),
    empty: () => stepAfterPath([P0]),
  },
] satisfies CompanionCase[];

companionCases.forEach(defineCompanionCase);

describe('arcSplitAt', () => {
  test('항상 길이 2 배열을 반환한다', () => {
    expect(arcSplitAt(CENTER_ARC, 0.5)).toHaveLength(2);
    expect(arcSplitAt(CENTER_ARC, 0)).toHaveLength(2);
    expect(arcSplitAt(CENTER_ARC, 1)).toHaveLength(2);
  });
});

describe('arcToCubic', () => {
  test('zero-sweep arc는 empty array를 반환한다', () => {
    const zeroSweep = { ...CENTER_ARC, startAngle: 0, endAngle: 0 };
    expect(arcToCubic(zeroSweep)).toEqual([]);
  });
});

describe('quadraticSplit', () => {
  test('quadraticSplitInto 결과와 deep equal이다', () => {
    const left = { kind: 'quadratic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
    const right = { kind: 'quadratic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
    quadraticSplitInto(left, right, flatQuadraticFromLegacyPoints(P0, P1, P2), 0.5);
    expect(quadraticSplit(flatQuadraticFromLegacyPoints(P0, P1, P2), 0.5)).toEqual({ left, right });
  });

  test('새 left/right curve object를 반환한다', () => {
    const a = quadraticSplit(flatQuadraticFromLegacyPoints(P0, P1, P2), 0.5);
    const b = quadraticSplit(flatQuadraticFromLegacyPoints(P0, P1, P2), 0.5);
    expect(a).not.toBe(b);
    expect(a.left).not.toBe(b.left);
    expect(a.right).not.toBe(b.right);
  });
});

describe('cubicToArcs', () => {
  test('zero-length degenerate cubic은 빈 배열을 반환한다', () => {
    const pt = { x: 0, y: 0 };
    expect(cubicToArcs(flatCubicFromLegacyPoints(pt, pt, pt, pt))).toEqual([]);
  });
});

describe('cubicChainFlatten', () => {
  test('options를 cubicChainFlattenInto로 그대로 전달한다', () => {
    // 두 segment chain + 작은 flatness로 options 전달이 결과 point 수에 반영되는지 본다.
    const chain = [P0, P1, P2, P3, { x: 20, y: -5 }, { x: 25, y: 0 }, { x: 30, y: 5 }];
    const options = { flatness: 0.05, maxRecursion: 32 };
    expect(cubicChainFlatten(chain, options)).toEqual(cubicChainFlattenInto([], chain, options));
  });
});

describe('cubicSplit', () => {
  test('cubicSplitInto 결과와 deep equal이다', () => {
    const left = { kind: 'cubic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
    const right = { kind: 'cubic' as const, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
    cubicSplitInto(left, right, flatCubicFromLegacyPoints(P0, P1, P2, P3), 0.5);
    expect(cubicSplit(flatCubicFromLegacyPoints(P0, P1, P2, P3), 0.5)).toEqual({ left, right });
  });

  test('새 left/right curve object를 반환한다', () => {
    const a = cubicSplit(flatCubicFromLegacyPoints(P0, P1, P2, P3), 0.5);
    const b = cubicSplit(flatCubicFromLegacyPoints(P0, P1, P2, P3), 0.5);
    expect(a).not.toBe(b);
    expect(a.left).not.toBe(b.left);
    expect(a.right).not.toBe(b.right);
  });
});

describe('controlPoints', () => {
  test('controlPointsInto 결과와 deep equal이다', () => {
    const out = {
      previous: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      next: { x: 0, y: 0 },
      nextNext: { x: 0, y: 0 },
    };
    controlPointsInto(out, POINTS, 1);
    expect(controlPoints(POINTS, 1)).toEqual(out);
  });

  test('closed option을 controlPointsInto로 그대로 전달한다', () => {
    const out = {
      previous: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      next: { x: 0, y: 0 },
      nextNext: { x: 0, y: 0 },
    };
    controlPointsInto(out, POINTS, 0, { closed: true });
    expect(controlPoints(POINTS, 0, { closed: true })).toEqual(out);
  });

  test('empty input은 undefined를 반환한다', () => {
    expect(controlPoints([], 0)).toBeUndefined();
  });

  test('새 object와 nested point를 반환한다', () => {
    const a = controlPoints(POINTS, 1);
    const b = controlPoints(POINTS, 1);
    expect(a).not.toBe(b);
    expect(a?.previous).not.toBe(b?.previous);
    expect(a?.current).not.toBe(b?.current);
    expect(a?.next).not.toBe(b?.next);
    expect(a?.nextNext).not.toBe(b?.nextNext);
    // nested point는 input point object를 재사용하지 않는다
    expect(a?.previous).not.toBe(POINTS[0]);
    expect(a?.current).not.toBe(POINTS[1]);
    expect(a?.next).not.toBe(POINTS[2]);
    expect(a?.nextNext).not.toBe(POINTS[3]);
  });
});

// x strict monotonic point set (POINTS는 x가 0,5,10,15로 증가한다)
const MONO_X = POINTS;
// y strict monotonic point set
const MONO_Y = [
  { x: 0, y: 0 },
  { x: 5, y: 4 },
  { x: 2, y: 8 },
  { x: 8, y: 12 },
];

const monotoneCompanionCases = [
  {
    name: 'monotoneXPolyline',
    actual: () => monotoneXPolyline(MONO_X, { steps: 8 }),
    expected: () => collect((out) => monotoneXPolylineInto(out, MONO_X, { steps: 8 })),
    empty: () => monotoneXPolyline([P0], { steps: 8 }),
  },
  {
    name: 'monotoneXPath',
    actual: () => monotoneXPath(MONO_X),
    expected: () => monotoneXPathInto([], MONO_X),
    empty: () => monotoneXPath([P0]),
  },
  {
    name: 'monotoneYPolyline',
    actual: () => monotoneYPolyline(MONO_Y, { steps: 8 }),
    expected: () => collect((out) => monotoneYPolylineInto(out, MONO_Y, { steps: 8 })),
    empty: () => monotoneYPolyline([P0], { steps: 8 }),
  },
  {
    name: 'monotoneYPath',
    actual: () => monotoneYPath(MONO_Y),
    expected: () => monotoneYPathInto([], MONO_Y),
    empty: () => monotoneYPath([P0]),
  },
  {
    name: 'naturalSplinePolyline',
    actual: () => naturalSplinePolyline(POINTS, { steps: 8 }),
    expected: () => collect((out) => naturalSplinePolylineInto(out, POINTS, { steps: 8 })),
    empty: () => naturalSplinePolyline([P0], { steps: 8 }),
  },
  {
    name: 'naturalSplinePath',
    actual: () => naturalSplinePath(POINTS),
    expected: () => naturalSplinePathInto([], POINTS),
    empty: () => naturalSplinePath([P0]),
  },
  {
    name: 'bumpXPath',
    actual: () => bumpXPath(POINTS),
    expected: () => bumpXPathInto([], POINTS),
    empty: () => bumpXPath([P0]),
  },
  {
    name: 'bumpYPath',
    actual: () => bumpYPath(POINTS),
    expected: () => bumpYPathInto([], POINTS),
    empty: () => bumpYPath([P0]),
  },
] satisfies CompanionCase[];

monotoneCompanionCases.forEach(defineCompanionCase);
