/**
 * segment-segment detail 계산이 수치 한계에서 쓰는 fallback 경로를 확인하는 테스트.
 * 거의 평행한 segment, 매우 짧거나 긴 segment, 영벡터 입력에서 helper와 detail이 내는 결과를 고정한다.
 * 모든 입력은 유한값이다. 비유한 입력은 detail 진입부에서 걸러지므로 다루지 않는다.
 */
import { describe, expect, test } from 'vitest';
import {
  collinearMappedInterval,
  collinearOverlapCandidates,
  collinearOverlapFromMappedInterval,
} from '../../../src/intersects/segment-segment-collinear.internal';
import {
  intersectionParameters,
  intersectionParametersFromEndpoints,
} from '../../../src/intersects/segment-segment-crossing.internal';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';
import {
  axisProjectedLineDist,
  parameterOnSegmentPoint,
  pointLineDist,
} from '../../../src/intersects/segment-segment-geometry.internal';

const BIG = Number.MAX_VALUE;

/** 끝점 두 개로 segment 입력을 만든다. */
function seg(ax: number, ay: number, bx: number, by: number) {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}

describe('segmentSegmentDetail의 수치 한계', () => {
  test('거의 평행해 교점 parameter가 overflow하면 none을 반환한다', () => {
    // A는 (1, 1e-310) 방향이고 B는 수평이다. 교점은 x = 1e310 부근이라 표현할 수 없다.
    // epsilon을 0으로 주면 cross가 0이 아니라 비평행으로 분류되어 parameter 계산까지 간다.
    expect(segmentSegmentDetail(seg(0, 0, 1, 1e-310), seg(0, 1, 1, 1), 0)).toEqual({ kind: 'none' });
  });

  test('A가 극단적으로 짧고 B가 극단적으로 길면 B 위 parameter가 overflow해 none을 반환한다', () => {
    // 두 segment는 x축 위에 겹쳐 있지만 B 시작점의 A 기준 parameter가 1e600 규모라 Infinity가 된다.
    expect(segmentSegmentDetail(seg(0, 0, 1e-300, 0), seg(1e300, 0, 2e300, 0), 0)).toEqual({ kind: 'none' });
  });

  test('A가 B보다 1e600배 짧으면 B 끝점의 A 기준 parameter가 overflow해도 시작점 point를 반환한다', () => {
    // B 끝점의 A 기준 parameter가 Infinity라 mapped interval은 계산되지 않는다.
    // 끝점 후보 경로가 (0, 0)만 남기고 point로 분류한다.
    expect(segmentSegmentDetail(seg(0, 0, 1e-300, 0), seg(0, 0, 1e300, 0), 0)).toEqual({
      kind: 'point',
      point: { x: 0, y: 0 },
      tA: 0,
      tB: 0,
    });
  });
});

describe('pointLineDist', () => {
  test('점과 직선 끝점이 모두 같으면 0이다', () => {
    expect(pointLineDist(1, 1, 1, 1, 1, 1)).toBe(0);
  });

  test('직선 방향 성분이 정규화 중 underflow해 길이 0이 되면 점-끝점 거리를 반환한다', () => {
    // dx = 5e-324는 scale 1e10으로 나누면 0이 된다.
    expect(pointLineDist(1e10, 0, 0, 0, 5e-324, 0)).toBe(1e10);
  });

  test('차분이 overflow하는 극단 입력에서 직선이 점이면 점-점 거리를 반환하고 범위를 넘으면 Infinity다', () => {
    expect(pointLineDist(BIG, 0, -BIG, 0, -BIG, 0)).toBe(Number.POSITIVE_INFINITY);
  });

  test('거리가 double 범위를 넘고 축 투영 거리도 계산할 수 없으면 Infinity다', () => {
    // 점 (1e300, -MAX)에서 세로 직선 x = -MAX까지 거리가 MAX + 1e300이라 표현할 수 없다.
    expect(pointLineDist(1e300, -BIG, -BIG, -1, -BIG, 0)).toBe(Number.POSITIVE_INFINITY);
  });

  test('축 투영 거리를 계산할 수 없는 극단 방향에서도 정규화 거리로 측정한다', () => {
    // 방향 (1e-300, 0)에서 점까지 비율이 Infinity라 axisProjectedLineDist가 undefined다.
    // 정규화한 방향 성분이 subnormal이라 거리는 1e-5 규모의 상대 오차를 가진다.
    expect(pointLineDist(1e10, 3, 0, 0, 1e-300, 0)).toBeCloseTo(3, 3);
  });
});

describe('axisProjectedLineDist', () => {
  test('x가 우세한 방향에서 비율이 overflow하면 undefined를 반환한다', () => {
    expect(axisProjectedLineDist(1e10, 3, 1e-300, 0)).toBeUndefined();
  });

  test('y가 우세한 방향에서 비율이 overflow하면 undefined를 반환한다', () => {
    expect(axisProjectedLineDist(3, 1e10, 0, 1e-300)).toBeUndefined();
  });
});

describe('parameterOnSegmentPoint', () => {
  test('segment가 한 점이고 모두 원점이면 NaN이다', () => {
    expect(parameterOnSegmentPoint(0, 0, 0, 0, 0, 0)).toBeNaN();
  });

  test('차분이 overflow하는 세로 segment는 정규화한 y 성분으로 parameter를 구한다', () => {
    expect(parameterOnSegmentPoint(0, 0, 0, -BIG, 0, BIG)).toBe(0.5);
  });
});

describe('교차 parameter helper', () => {
  test('intersectionParameters는 parameter가 overflow하면 undefined를 반환한다', () => {
    // 두 방향이 거의 평행(cross 1e-300)한데 q가 1e20이라 tA가 -Infinity가 된다.
    expect(intersectionParameters(0, 1e20, 1, 1e-300, 1, 2e-300)).toBeUndefined();
  });

  test('intersectionParametersFromEndpoints는 parameter가 overflow하면 undefined를 반환한다', () => {
    expect(intersectionParametersFromEndpoints(0, 0, 1, 1e-310, 0, 1, 1, 1)).toBeUndefined();
  });

  test('intersectionParametersFromEndpoints는 모든 끝점이 원점이면 undefined를 반환한다', () => {
    expect(intersectionParametersFromEndpoints(0, 0, 0, 0, 0, 0, 0, 0)).toBeUndefined();
  });
});

describe('collinear helper', () => {
  test('collinearMappedInterval은 A가 한 점이라 B 끝점의 parameter가 유한하지 않으면 undefined를 반환한다', () => {
    expect(collinearMappedInterval(0, 0, 0, 0, 1, 1, 2, 2, 0)).toBeUndefined();
  });

  test('collinearOverlapCandidates는 A가 한 점이면 A 쪽 parameter가 NaN인 후보를 버린다', () => {
    expect(collinearOverlapCandidates(0, 0, 0, 0, 0, 0, 1, 1, 1e-9)).toEqual([{ x: 0, y: 0, tA: 0, tB: 0 }]);
  });
});

describe('collinearOverlapFromMappedInterval', () => {
  const sameInterval = { startTA: 0, endTA: 0, startTB: 0, endTB: 0 };

  test('시작점이 A의 끝점 parameter와 어긋나면 none을 반환한다', () => {
    // A 끝점 (1e-20, 0)을 보간으로 복원하면 (0, 0)이라 epsilon 0에서 끝점 일치를 통과하지 못한다.
    // 같은 점은 B(시작점 (0, 0))에서는 일치하므로 A 검사가 결과를 가른다.
    const interval = { startTA: 1, endTA: 1, startTB: 0, endTB: 0 };
    expect(collinearOverlapFromMappedInterval(-1, 0, 1e-20, 0, 0, 0, 1, 0, interval, 0)).toEqual({ kind: 'none' });
  });

  test('한 점으로 수렴한 구간이 B 위의 점과 어긋나면 none을 반환한다', () => {
    // A는 y=0, B는 y=5에 놓여 시작점이 B에서 5만큼 떨어져 있다.
    expect(collinearOverlapFromMappedInterval(0, 0, 10, 0, 0, 5, 10, 5, sameInterval, 1e-9)).toEqual({ kind: 'none' });
  });

  test('구간이 A와 B 모두의 같은 점 위에서 한 점으로 수렴하면 point를 반환한다', () => {
    expect(collinearOverlapFromMappedInterval(0, 0, 10, 0, 0, 0, 10, 0, sameInterval, 1e-9)).toEqual({
      kind: 'point',
      point: { x: 0, y: 0 },
      tA: 0,
      tB: 0,
    });
  });

  test('B 위로 매핑한 구간 길이가 epsilon 이하이면 none을 반환한다', () => {
    const interval = { startTA: 0, endTA: 1, startTB: 0.5, endTB: 0.5 };
    expect(collinearOverlapFromMappedInterval(0, 0, 10, 0, 0, 0, 10, 0, interval, 1e-9)).toEqual({ kind: 'none' });
  });
});
