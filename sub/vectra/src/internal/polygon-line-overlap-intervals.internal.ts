/**
 * line-family (segment, ray, infinite-line) × polygon collinear overlap 구간 collection 계산용
 * internal kernel.
 *
 * edge 판정(정점 순회 · cross product · finite guard · collinear)은
 * `scanLineFamilyPolygonEdges`(`polygon-line-edge-scan.internal`) 공유 kernel에 위임하고,
 * 이 모듈은 그 결과를 overlap interval record로 기록하는 recorder만 구현한다. non-parallel
 * edge(crossing)는 overlap 구간과 무관하므로 recorder에서 무시한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { LinePolygonOverlapIntervalDetail, PolygonLike, XYObjectWritable } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import {
  edgeParam,
  type LineFamilyPolygonEdgeScanRecorder,
  scanLineFamilyPolygonEdges,
} from './polygon-line-edge-scan.internal';

/**
 * line-family × polygon collinear overlap 구간 1건의 raw record.
 *
 * public `LinePolygonOverlapIntervalDetail`로 매핑하기 전 단계의 평면 record다.
 * `tLineStart <= tLineEnd`이고 `tEdgeStart`/`tEdgeEnd`는 각 끝점의 edge-local parameter `[0, 1]`다.
 */
export interface LinePolygonOverlapIntervalRecord {
  /** 구간 시작점 x */
  startX: number;

  /** 구간 시작점 y */
  startY: number;

  /** 구간 끝점 x */
  endX: number;

  /** 구간 끝점 y */
  endY: number;

  /** 구간 시작 line-family parameter */
  tLineStart: number;

  /** 구간 끝 line-family parameter */
  tLineEnd: number;

  /** 시작점 edge-local parameter `[0, 1]` */
  tEdgeStart: number;

  /** 끝점 edge-local parameter `[0, 1]` */
  tEdgeEnd: number;

  /** polygon edge index */
  edgeIndex: number;
}

/**
 * line-family와 collinear로 겹치는 polygon edge의 overlap 구간을 outIntervals에 기록하고 같은 배열을 반환한다.
 *
 * outIntervals는 먼저 clear되고 양의 길이를 가진 collinear overlap 구간만 push된다. 반환 순서는
 * line-family parameter `tLineStart` 오름차순이다.
 *
 * | 케이스                          | 결과                                          |
 * |--------------------------------|-----------------------------------------------|
 * | collinear edge overlap(양의 길이) | interval 1건 (`tLineStart <= tLineEnd`)       |
 * | transversal crossing            | interval 없음                                 |
 * | vertex touch / containment-only | interval 없음                                 |
 * | 한 점으로 수렴(좌표계 길이 `<= epsilon`) | interval 없음                           |
 * | empty polygon(`n < 3`)          | 빈 배열                                       |
 * | degenerate direction(`|d| = 0`) | 빈 배열                                       |
 * | non-finite vertex/direction/origin | 해당 edge skip(가짜 interval 미생성)        |
 *
 * 각 interval은 line-family own range로 clipping된다(segment `[0, 1]`, ray `[0, ∞)`, infinite-line 전체).
 * `epsilon`은 collinear 판정과 한 점 수렴 판정에 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outIntervals overlap 구간 record를 기록할 output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 교차를 구할 polygon
 * @param epsilon collinear/수렴 판정 임계값
 */
export function lineFamilyPolygonOverlapIntervals(
  outIntervals: LinePolygonOverlapIntervalRecord[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number
): LinePolygonOverlapIntervalRecord[] {
  outIntervals.length = 0;

  const recorder: LineFamilyPolygonEdgeScanRecorder = {
    crossing() {
      // overlap 구간 수집은 non-parallel edge와 무관하다.
    },
    collinear(edgeIndex, ax, ay, ex, ey, lo, hi) {
      const startX = ox + lo * dx;
      const startY = oy + lo * dy;
      const endX = ox + hi * dx;
      const endY = oy + hi * dy;
      // 빈 구간 또는 한 점 수렴은 interval이 아니다. 길이는 line parameter가 아니라 좌표계 거리 기준이다.
      if (Math.hypot(endX - startX, endY - startY) <= epsilon) return;
      outIntervals.push({
        startX,
        startY,
        endX,
        endY,
        tLineStart: lo,
        tLineEnd: hi,
        tEdgeStart: edgeParam(startX, startY, ax, ay, ex, ey),
        tEdgeEnd: edgeParam(endX, endY, ax, ay, ex, ey),
        edgeIndex,
      });
    },
  };
  scanLineFamilyPolygonEdges(ox, oy, dx, dy, kind, polygon, epsilon, recorder);

  outIntervals.sort((p, q) => p.tLineStart - q.tLineStart);
  return outIntervals;
}

/**
 * line-family × polygon collinear overlap 구간을 public `LinePolygonOverlapIntervalDetail`로 outIntervals에
 * 기록하고 같은 outIntervals를 반환한다.
 *
 * record kernel(`lineFamilyPolygonOverlapIntervals`)의 결과를 public interval shape로 매핑한다.
 * outIntervals는 먼저 clear되고 새 interval object가 push된다. push되는 interval과 nested
 * `start`/`end` point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 *
 * @param outIntervals overlap 구간을 기록할 output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 교차를 구할 polygon
 * @param epsilon collinear/수렴 판정 임계값
 */
export function lineFamilyPolygonOverlapIntervalsInto(
  outIntervals: LinePolygonOverlapIntervalDetail[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number
): LinePolygonOverlapIntervalDetail[] {
  const records: LinePolygonOverlapIntervalRecord[] = [];
  lineFamilyPolygonOverlapIntervals(records, ox, oy, dx, dy, kind, polygon, epsilon);
  outIntervals.length = 0;
  for (let i = 0; i < records.length; i++) {
    outIntervals.push(recordToInterval(records[i]));
  }
  return outIntervals;
}

/** raw interval record를 public `LinePolygonOverlapIntervalDetail` object로 변환한다. nested point는 새 `{ x, y }`다. */
export function recordToInterval(
  record: LinePolygonOverlapIntervalRecord
): LinePolygonOverlapIntervalDetail<XYObjectWritable> {
  return {
    kind: 'overlap',
    start: { x: record.startX, y: record.startY },
    end: { x: record.endX, y: record.endY },
    tLineStart: record.tLineStart,
    tLineEnd: record.tLineEnd,
    tEdgeStart: record.tEdgeStart,
    tEdgeEnd: record.tEdgeEnd,
    edgeIndex: record.edgeIndex,
  };
}
