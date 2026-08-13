/**
 * line-family (segment, ray, infinite-line) × polygon 교점 collection 계산용 internal kernel.
 *
 * boolean relation(`lineFamilyPolygonIntersects`)과 달리 교점 위치/edge metadata를 보존한다.
 * edge 판정(정점 순회 · cross product · finite guard · collinear)은
 * `scanLineFamilyPolygonEdges`(`polygon-line-edge-scan.internal`) 공유 kernel에 위임하고,
 * 이 모듈은 그 결과를 hit record로 기록하는 recorder만 구현한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { IntersectionKind, LinePolygonIntersectionHit, PolygonLike, XYObjectWritable, XYWritable } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import { lineFamilyRangeContains } from './line-family-range.internal';
import {
  edgeParam,
  type LineFamilyPolygonEdgeScanRecorder,
  scanLineFamilyPolygonEdges,
} from './polygon-line-edge-scan.internal';
import { writeXY } from './xy';

/**
 * line-family × polygon 교점 1건의 raw record.
 *
 * public `IntersectionHit`로 매핑하기 전 단계의 평면 record다.
 * `tLine`은 line-family parameter, `tEdge`는 edge-local parameter `[0, 1]`,
 * `edgeIndex`는 polygon edge index(`vertex[i] → vertex[(i + 1) % n]`)다.
 */
export interface LinePolygonHitRecord {
  /** 교점 x 좌표 */
  x: number;

  /** 교점 y 좌표 */
  y: number;

  /** edge-level 교차 종류. transversal=`cross`, vertex touch=`touch`, collinear overlap=`overlap` */
  kind: IntersectionKind;

  /** line-family parameter */
  tLine: number;

  /** edge-local parameter `[0, 1]` */
  tEdge: number;

  /** polygon edge index */
  edgeIndex: number;
}

/**
 * line-family × polygon edge의 모든 교점을 outHits에 기록하고 같은 outHits를 반환한다.
 *
 * outHits는 먼저 clear되고 결과 record가 push된다. 반환 순서는 line-family parameter `tLine`
 * 오름차순이며, 같은 점을 양쪽 edge가 보고하는 vertex hit은 하나로 dedupe된다.
 *
 * | 케이스                          | 결과 record                                  |
 * |--------------------------------|----------------------------------------------|
 * | transversal edge crossing      | `kind: 'cross'`, edge 내부 `tEdge`            |
 * | vertex touch                   | `kind: 'touch'`, `tEdge ≈ 0` 또는 `≈ 1`, dedupe |
 * | collinear edge overlap         | `kind: 'overlap'` 구간 양 끝점 2건            |
 * | containment-only(교점 없음)     | 빈 배열                                       |
 * | empty polygon(`n < 3`)          | 빈 배열                                       |
 * | degenerate direction(`|d| = 0`) | 빈 배열                                       |
 * | non-finite vertex/direction/origin | 해당 edge skip(가짜 record 미생성)         |
 *
 * edge-local tolerance는 epsilon을 edge 길이로 나눠 normalized `[0, 1]` 축으로 환산한다.
 * `epsilon`은 line/edge collinear 판정과 vertex/overlap dedupe에 쓰고 finite validation에는
 * 쓰지 않는다. `tLine` range 판정은 정확 비교다.
 *
 * @param outHits 교점 record를 기록할 output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function lineFamilyPolygonIntersectionHits(
  outHits: LinePolygonHitRecord[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number
): LinePolygonHitRecord[] {
  outHits.length = 0;

  const recorder: LineFamilyPolygonEdgeScanRecorder = {
    crossing(edgeIndex, ex, ey, qx, qy, cross) {
      const tLine = (qx * ey - qy * ex) / cross;
      if (!lineFamilyRangeContains(tLine, kind)) return;
      const tEdge = (qx * dy - qy * dx) / cross;
      // edge-local tolerance: epsilon(거리 스케일)을 edge 길이로 나눠 normalized [0, 1] 축으로 환산한다.
      // 그러지 않으면 긴 edge에서 tolerance가 거리로 부풀어 polygon 밖 점을 touch로 잡거나
      // 내부 transversal 교점을 touch로 오분류한다.
      const edgeLen = Math.hypot(ex, ey);
      const edgeTol = edgeLen > 0 ? epsilon / edgeLen : epsilon;
      if (tEdge < -edgeTol || tEdge > 1 + edgeTol) return;
      const atVertex = tEdge <= edgeTol || tEdge >= 1 - edgeTol;
      const clampedEdge = tEdge < 0 ? 0 : tEdge > 1 ? 1 : tEdge;
      outHits.push({
        x: ox + tLine * dx,
        y: oy + tLine * dy,
        kind: atVertex ? 'touch' : 'cross',
        tLine,
        tEdge: clampedEdge,
        edgeIndex,
      });
    },
    collinear(edgeIndex, ax, ay, ex, ey, lo, hi) {
      pushOverlapEndpoint(outHits, ox, oy, dx, dy, ax, ay, ex, ey, lo, edgeIndex);
      if (lineParamSpanLength(lo, hi, dx, dy) > epsilon) {
        pushOverlapEndpoint(outHits, ox, oy, dx, dy, ax, ay, ex, ey, hi, edgeIndex);
      }
    },
  };
  scanLineFamilyPolygonEdges(ox, oy, dx, dy, kind, polygon, epsilon, recorder);

  outHits.sort((p, q) => p.tLine - q.tLine);
  dedupeByPoint(outHits, epsilon);
  return outHits;
}

/**
 * line-family × polygon 교점을 public `LinePolygonIntersectionHit`로 outHits에 기록하고 같은 outHits를 반환한다.
 *
 * record kernel(`lineFamilyPolygonIntersectionHits`)의 결과를 public hit shape로 매핑한다.
 *
 * outHits는 먼저 clear되고 새 hit object가 push된다. push되는 hit과 nested point는 매 호출 새
 * object이며 입력 point object를 재사용하지 않는다.
 *
 * @param outHits 교점 hit을 기록할 output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function lineFamilyPolygonIntersectionHitsInto(
  outHits: LinePolygonIntersectionHit[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number
): LinePolygonIntersectionHit[] {
  const records: LinePolygonHitRecord[] = [];
  lineFamilyPolygonIntersectionHits(records, ox, oy, dx, dy, kind, polygon, epsilon);
  outHits.length = 0;
  for (let i = 0; i < records.length; i++) {
    outHits.push(recordToHit(records[i]));
  }
  return outHits;
}

/**
 * line-family × polygon collection의 첫(가장 가까운) 교점을 out에 기록하고 true를 반환한다.
 *
 * collection(`tLine` 오름차순)의 첫 hit을 source of truth로 사용한다. 별도 교점 계산으로 drift를
 * 만들지 않는다. 교점이 없으면 false를 반환하고 out을 수정하지 않는다.
 *
 * out.point는 `writeXY`로 기록하고 나머지 metadata field를 덮어쓴다. caller가 out.point를 유효한
 * writable storage로 보장해야 한다.
 *
 * @param out 첫 교점을 기록할 writable hit (no-hit이면 미수정)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 교점을 구할 polygon
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function closestLineFamilyPolygonIntersectionInto<P extends XYWritable>(
  out: LinePolygonIntersectionHit<P>,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number
): boolean {
  const records: LinePolygonHitRecord[] = [];
  lineFamilyPolygonIntersectionHits(records, ox, oy, dx, dy, kind, polygon, epsilon);
  if (records.length === 0) return false;
  const r = records[0];
  writeXY(out.point, r.x, r.y);
  out.kind = r.kind;
  out.tLine = r.tLine;
  out.tEdge = r.tEdge;
  out.edgeIndex = r.edgeIndex;
  return true;
}

/** raw record를 public `LinePolygonIntersectionHit` object로 변환한다. nested point는 새 `{ x, y }`다. */
export function recordToHit(record: LinePolygonHitRecord): LinePolygonIntersectionHit<XYObjectWritable> {
  return {
    point: { x: record.x, y: record.y },
    kind: record.kind,
    tLine: record.tLine,
    tEdge: record.tEdge,
    edgeIndex: record.edgeIndex,
  };
}

/** 두 line parameter 사이 실제 좌표계 길이를 계산한다. */
function lineParamSpanLength(lo: number, hi: number, dx: number, dy: number): number {
  const dt = hi - lo;
  return Math.hypot(dt * dx, dt * dy);
}

/**
 * collinear overlap 구간의 한 parameter `t`에서 교점 record를 push한다.
 *
 * 교점 좌표는 line parameter `t`로 계산하고, edge-local parameter는 edge 위 투영으로 계산한다.
 * edge 길이가 0이면 edge param은 0으로 둔다.
 */
function pushOverlapEndpoint(
  outHits: LinePolygonHitRecord[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  ax: number,
  ay: number,
  ex: number,
  ey: number,
  t: number,
  edgeIndex: number
): void {
  const px = ox + t * dx;
  const py = oy + t * dy;
  const tEdge = edgeParam(px, py, ax, ay, ex, ey);
  outHits.push({ x: px, y: py, kind: 'overlap', tLine: t, tEdge, edgeIndex });
}

/**
 * tLine 오름차순으로 정렬된 hit list에서 같은 점을 가리키는 인접 중복을 제거한다.
 *
 * 같은 polygon vertex를 양쪽 edge가 보고하는 경우를 하나로 합친다. 먼저 등장한 record를
 * 유지한다(낮은 edge index, stable sort 기준).
 */
function dedupeByPoint(outHits: LinePolygonHitRecord[], epsilon: number): void {
  const epsSq = epsilon * epsilon;
  let write = 0;
  for (let read = 0; read < outHits.length; read++) {
    const cur = outHits[read];
    if (write > 0) {
      const prev = outHits[write - 1];
      const ddx = cur.x - prev.x;
      const ddy = cur.y - prev.y;
      if (ddx * ddx + ddy * ddy <= epsSq) continue;
    }
    outHits[write] = cur;
    write++;
  }
  outHits.length = write;
}
