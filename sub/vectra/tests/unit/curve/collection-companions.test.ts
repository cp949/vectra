/**
 * curve domain collection companion unit test.
 *
 * 각 companion이 대응 *-into 함수와 동등한 결과를 반환하는지 검증한다.
 */
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

function collect(fill: (out: any[]) => void): any[] {
  const out: any[] = [];
  fill(out);
  return out;
}

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
    actual: () => arcSample(CENTER_ARC, 8),
    expected: () => arcSampleInto([], CENTER_ARC, 8),
    rangeError: () => arcSample(CENTER_ARC, 1),
  },
  {
    name: 'quadraticFlatten',
    actual: () => quadraticFlatten(P0, P1, P2),
    expected: () => quadraticFlattenInto([], P0, P1, P2),
  },
  {
    name: 'quadraticSample',
    actual: () => quadraticSample(P0, P1, P2, 8),
    expected: () => quadraticSampleInto([], P0, P1, P2, 8),
    rangeError: () => quadraticSample(P0, P1, P2, 1),
  },
  {
    name: 'quadraticHull',
    actual: () => quadraticHull(P0, P1, P2, 0.5),
    expected: () => quadraticHullInto([], P0, P1, P2, 0.5),
    length: 6,
  },
  {
    name: 'cubicFlatten',
    actual: () => cubicFlatten(P0, P1, P2, P3),
    expected: () => cubicFlattenInto([], P0, P1, P2, P3),
  },
  {
    name: 'cubicChainFlatten',
    actual: () => cubicChainFlatten(POINTS),
    expected: () => cubicChainFlattenInto([], POINTS),
    empty: () => cubicChainFlatten([P0, P1, P2]),
  },
  {
    name: 'cubicSample',
    actual: () => cubicSample(P0, P1, P2, P3, 8),
    expected: () => cubicSampleInto([], P0, P1, P2, P3, 8),
    rangeError: () => cubicSample(P0, P1, P2, P3, 1),
  },
  {
    name: 'cubicHull',
    actual: () => cubicHull(P0, P1, P2, P3, 0.5),
    expected: () => cubicHullInto([], P0, P1, P2, P3, 0.5),
    length: 10,
  },
  {
    name: 'catmullRomPolyline',
    actual: () => catmullRomPolyline(POINTS, 8),
    expected: () => collect((out) => catmullRomPolylineInto(out, POINTS, 8)),
    empty: () => catmullRomPolyline([P0], 8),
  },
  {
    name: 'catmullRomPath',
    actual: () => catmullRomPath(POINTS),
    expected: () => catmullRomPathInto([], POINTS),
    empty: () => catmullRomPath([P0]),
  },
  {
    name: 'cardinalPolyline',
    actual: () => cardinalPolyline(POINTS, 8),
    expected: () => collect((out) => cardinalPolylineInto(out, POINTS, 8)),
    empty: () => cardinalPolyline([P0], 8),
  },
  {
    name: 'cardinalPath',
    actual: () => cardinalPath(POINTS),
    expected: () => cardinalPathInto([], POINTS),
    empty: () => cardinalPath([P0]),
  },
  {
    name: 'bsplinePolyline',
    actual: () => bsplinePolyline(POINTS, 8),
    expected: () => collect((out) => bsplinePolylineInto(out, POINTS, 8)),
    empty: () => bsplinePolyline([P0, P1, P2], 8),
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
    const left = { p0: { x: 0, y: 0 }, p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 } };
    const right = { p0: { x: 0, y: 0 }, p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 } };
    quadraticSplitInto(left, right, P0, P1, P2, 0.5);
    expect(quadraticSplit(P0, P1, P2, 0.5)).toEqual({ left, right });
  });

  test('새 left/right curve object를 반환한다', () => {
    const a = quadraticSplit(P0, P1, P2, 0.5);
    const b = quadraticSplit(P0, P1, P2, 0.5);
    expect(a).not.toBe(b);
    expect(a.left).not.toBe(b.left);
    expect(a.right).not.toBe(b.right);
  });
});

describe('cubicToArcs', () => {
  test('zero-length degenerate cubic은 빈 배열을 반환한다', () => {
    const pt = { x: 0, y: 0 };
    expect(cubicToArcs(pt, pt, pt, pt)).toEqual([]);
  });
});

describe('cubicChainFlatten', () => {
  test('options를 cubicChainFlattenInto로 그대로 전달한다', () => {
    // 두 segment chain + 작은 flatness로 options 전달이 결과 point 수에 반영되는지 본다.
    const chain = [P0, P1, P2, P3, { x: 20, y: -5 }, { x: 25, y: 0 }, { x: 30, y: 5 }];
    const options = { flatness: 0.05 };
    expect(cubicChainFlatten(chain, options)).toEqual(cubicChainFlattenInto([], chain, options));
  });
});

describe('cubicSplit', () => {
  test('cubicSplitInto 결과와 deep equal이다', () => {
    const left = {
      p0: { x: 0, y: 0 },
      p1: { x: 0, y: 0 },
      p2: { x: 0, y: 0 },
      p3: { x: 0, y: 0 },
    };
    const right = {
      p0: { x: 0, y: 0 },
      p1: { x: 0, y: 0 },
      p2: { x: 0, y: 0 },
      p3: { x: 0, y: 0 },
    };
    cubicSplitInto(left, right, P0, P1, P2, P3, 0.5);
    expect(cubicSplit(P0, P1, P2, P3, 0.5)).toEqual({ left, right });
  });

  test('새 left/right curve object를 반환한다', () => {
    const a = cubicSplit(P0, P1, P2, P3, 0.5);
    const b = cubicSplit(P0, P1, P2, P3, 0.5);
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
    actual: () => monotoneXPolyline(MONO_X, 8),
    expected: () => collect((out) => monotoneXPolylineInto(out, MONO_X, 8)),
    empty: () => monotoneXPolyline([P0], 8),
  },
  {
    name: 'monotoneXPath',
    actual: () => monotoneXPath(MONO_X),
    expected: () => monotoneXPathInto([], MONO_X),
    empty: () => monotoneXPath([P0]),
  },
  {
    name: 'monotoneYPolyline',
    actual: () => monotoneYPolyline(MONO_Y, 8),
    expected: () => collect((out) => monotoneYPolylineInto(out, MONO_Y, 8)),
    empty: () => monotoneYPolyline([P0], 8),
  },
  {
    name: 'monotoneYPath',
    actual: () => monotoneYPath(MONO_Y),
    expected: () => monotoneYPathInto([], MONO_Y),
    empty: () => monotoneYPath([P0]),
  },
  {
    name: 'naturalSplinePolyline',
    actual: () => naturalSplinePolyline(POINTS, 8),
    expected: () => collect((out) => naturalSplinePolylineInto(out, POINTS, 8)),
    empty: () => naturalSplinePolyline([P0], 8),
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
