/**
 * relation/intersection detail type 모음의 re-export 배럴.
 *
 * 비대해진 단일 파일을 응집 단위 helper 3개(relation-detail / line-polygon / sweep)로 분할하고,
 * 이 파일은 기존 소비처의 import 경로(`./intersection.internal`)와 public type surface를 보존하는
 * re-export 배럴로 전환한다. 직접 type 정의는 두지 않는다.
 */

export type {
  LinePolygonIntersectionHit,
  LinePolygonOverlapIntervalDetail,
  VisibilityOptions,
  VisibilityRayHit,
} from './line-polygon-detail.internal';
export type {
  AreaOverlapDetail,
  CircleCircleDetail,
  EllipseEllipseDetail,
  MultiPointRelationDetail,
  OverlapIntervalDetail,
  PointRelationDetail,
  RelationDetailKind,
  SegmentSegmentDetail,
  TwoPointRelationDetail,
} from './relation-detail.internal';
export type { BoundsSweepDetail } from './sweep-detail.internal';
