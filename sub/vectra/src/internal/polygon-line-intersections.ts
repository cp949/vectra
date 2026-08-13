/**
 * line-family (segment, ray, infinite-line) × polygon 교점/overlap 계산용 internal facade.
 *
 * 이 모듈은 internal 전용으로, public domain barrel이나 export surface에 노출되지 않는다.
 * 기존 caller import 경로를 유지하기 위해 세부 구현 module을 다시 export한다.
 */

export type { LinePolygonHitRecord } from './polygon-line-hits.internal';
export {
  closestLineFamilyPolygonIntersectionInto,
  lineFamilyPolygonIntersectionHits,
  lineFamilyPolygonIntersectionHitsInto,
  recordToHit,
} from './polygon-line-hits.internal';
export type { LinePolygonOverlapIntervalRecord } from './polygon-line-overlap-intervals.internal';
export {
  lineFamilyPolygonOverlapIntervals,
  lineFamilyPolygonOverlapIntervalsInto,
  recordToInterval,
} from './polygon-line-overlap-intervals.internal';
