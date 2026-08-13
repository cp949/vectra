/**
 * scanLineFamilyPolygonEdges의 분기 경계를 고정하는 characterization test.
 *
 * hit/overlap 두 recorder를 통해 간접 검증되지만, "non-finite cross/qx/qy로 인한 edge skip"과
 * "collinear이지만 겹침 없음(lo > hi)" 분기는 kernel 자체에서 직접 exercise된 적이 없다.
 */

import { describe, expect, test } from 'vitest';
import {
  edgeParam,
  type LineFamilyPolygonEdgeScanRecorder,
  scanLineFamilyPolygonEdges,
} from '../../../src/internal/polygon-line-edge-scan.internal';
import type { PolygonLike, XYInput } from '../../../src/types';

type CrossingCall = { edgeIndex: number; ex: number; ey: number; qx: number; qy: number; cross: number };
type CollinearCall = { edgeIndex: number; ax: number; ay: number; ex: number; ey: number; lo: number; hi: number };

function makeSpyRecorder(): LineFamilyPolygonEdgeScanRecorder & {
  crossings: CrossingCall[];
  collinears: CollinearCall[];
} {
  const crossings: CrossingCall[] = [];
  const collinears: CollinearCall[] = [];
  return {
    crossings,
    collinears,
    crossing(edgeIndex, ex, ey, qx, qy, cross) {
      crossings.push({ edgeIndex, ex, ey, qx, qy, cross });
    },
    collinear(edgeIndex, ax, ay, ex, ey, lo, hi) {
      collinears.push({ edgeIndex, ax, ay, ex, ey, lo, hi });
    },
  };
}

const p = (x: number, y: number): XYInput => ({ x, y });
const polygon = (...points: XYInput[]): PolygonLike => ({ points });

// 단위 사각형 (0,0)-(4,0)-(4,4)-(0,4): edge index 0=bottom, 1=right, 2=top, 3=left
const square = polygon(p(0, 0), p(4, 0), p(4, 4), p(0, 4));

describe('scanLineFamilyPolygonEdges', () => {
  test('empty polygon(n < 3)이면 어떤 edge도 방문하지 않는다', () => {
    const recorder = makeSpyRecorder();
    scanLineFamilyPolygonEdges(-1, 1, 1, 0, 'inf', polygon(p(0, 0), p(1, 1)), 1e-9, recorder);
    expect(recorder.crossings).toHaveLength(0);
    expect(recorder.collinears).toHaveLength(0);
  });

  test('degenerate direction(|d| = 0)이면 어떤 edge도 방문하지 않는다', () => {
    const recorder = makeSpyRecorder();
    scanLineFamilyPolygonEdges(1, 1, 0, 0, 'inf', square, 1e-9, recorder);
    expect(recorder.crossings).toHaveLength(0);
    expect(recorder.collinears).toHaveLength(0);
  });

  test('non-finite cross(direction이 non-finite)면 해당 edge를 skip한다', () => {
    const recorder = makeSpyRecorder();
    scanLineFamilyPolygonEdges(-1, 1, Number.POSITIVE_INFINITY, 0, 'inf', square, 1e-9, recorder);
    expect(recorder.crossings).toHaveLength(0);
    expect(recorder.collinears).toHaveLength(0);
  });

  test('non-finite origin(qx/qy가 non-finite)이면 해당 edge를 skip한다', () => {
    const recorder = makeSpyRecorder();
    scanLineFamilyPolygonEdges(Number.POSITIVE_INFINITY, 1, 1, 0.0001, 'inf', square, 1e-9, recorder);
    expect(recorder.crossings).toHaveLength(0);
    expect(recorder.collinears).toHaveLength(0);
  });

  test.each([Number.POSITIVE_INFINITY, Number.NaN])(
    'non-finite polygon vertex(%s)와 연결된 edge만 skip한다',
    (nonFiniteCoordinate) => {
      const recorder = makeSpyRecorder();
      const polygonWithNonFiniteVertex = polygon(p(0, 0), p(nonFiniteCoordinate, 0), p(4, 4), p(0, 4));

      scanLineFamilyPolygonEdges(-1, 2, 1, 0, 'inf', polygonWithNonFiniteVertex, 1e-9, recorder);

      expect(recorder.crossings).toEqual([{ edgeIndex: 3, ex: 0, ey: -4, qx: 1, qy: 2, cross: -4 }]);
      expect(recorder.collinears).toHaveLength(0);
    }
  );

  test('non-parallel edge마다 crossing을 호출한다(raw qx/qy/cross 전달, tLine/tEdge 판정 없음)', () => {
    const recorder = makeSpyRecorder();
    // 수직선 x=2: bottom/top edge(0, 2)와는 non-parallel, left/right edge(1, 3)과는 parallel
    scanLineFamilyPolygonEdges(2, -10, 0, 1, 'inf', square, 1e-9, recorder);
    expect(recorder.crossings).toEqual([
      { edgeIndex: 0, ex: 4, ey: 0, qx: -2, qy: 10, cross: -4 },
      { edgeIndex: 2, ex: -4, ey: 0, qx: 2, qy: 14, cross: 4 },
    ]);
    expect(recorder.collinears).toHaveLength(0);
  });

  test('collinear edge가 range와 양의 길이로 겹치면 lo <= hi로 clipping해 collinear을 호출한다', () => {
    const recorder = makeSpyRecorder();
    // origin(-1,0) + direction(6,0) * [0,1] = (-1,0)~(5,0), bottom edge(0,0)-(4,0)와 collinear
    scanLineFamilyPolygonEdges(-1, 0, 6, 0, 'finite', square, 1e-9, recorder);
    expect(recorder.collinears).toHaveLength(1);
    const [c] = recorder.collinears;
    expect(c).toMatchObject({ edgeIndex: 0, ax: 0, ay: 0, ex: 4, ey: 0 });
    expect(c.lo).toBeCloseTo(1 / 6, 12);
    expect(c.hi).toBeCloseTo(5 / 6, 12);
  });

  test('collinear edge가 range 경계와 한 점에서 만나면 lo === hi로 collinear을 호출한다', () => {
    const recorder = makeSpyRecorder();
    // origin(4,0) + direction(1,0) * [0,1]은 bottom edge의 끝점과만 만난다.
    scanLineFamilyPolygonEdges(4, 0, 1, 0, 'finite', square, 1e-9, recorder);

    expect(recorder.collinears).toEqual([{ edgeIndex: 0, ax: 0, ay: 0, ex: 4, ey: 0, lo: 0, hi: 0 }]);
  });

  test('collinear이지만 range 밖이라 겹침이 없으면(lo > hi) collinear을 호출하지 않는다', () => {
    const recorder = makeSpyRecorder();
    // origin(10,0) + direction(4,0) * [0,1] = (10,0)~(14,0): bottom edge와 같은 line(y=0)이지만
    // segment 자기 range [0,1] 밖으로 project되어 lo(0) > hi(-1.5)가 된다.
    scanLineFamilyPolygonEdges(10, 0, 4, 0, 'finite', square, 1e-9, recorder);
    expect(recorder.collinears).toHaveLength(0);
  });
});

describe('edgeParam', () => {
  test.each([
    { point: [2, 0.5], edge: [0, 0, 4, 1], expected: 0.5 },
    { point: [0.5, 2], edge: [0, 0, 1, 4], expected: 0.5 },
    { point: [-2, 0], edge: [0, 0, 4, 0], expected: 0 },
    { point: [6, 0], edge: [0, 0, 4, 0], expected: 1 },
    { point: [10, 20], edge: [1, 2, 0, 0], expected: 0 },
  ])('dominant axis로 투영하고 [0, 1]로 clamp한다', ({ point, edge, expected }) => {
    expect(edgeParam(point[0], point[1], edge[0], edge[1], edge[2], edge[3])).toBe(expected);
  });
});
