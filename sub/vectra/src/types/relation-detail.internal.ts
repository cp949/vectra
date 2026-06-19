import type { XYObjectWritable } from './xy.internal';

/**
 * relation detail result의 discriminant 종류.
 *
 * - `none`: 교차/접촉 없음
 * - `point`: 한 점에서 만남 (proper crossing, T-crossing, shared endpoint, point hit)
 * - `overlap`: 길이/면적을 가진 구간 또는 영역 중첩
 * - `two-point`: 두 점에서 만남
 * - `multi-point`: 3개 이상(최대 4개)의 점에서 만남
 * - `touch`: 경계에서 점으로만 닿음
 * - `contains`: 한쪽이 다른 쪽을 포함
 */
export type RelationDetailKind = 'none' | 'point' | 'overlap' | 'two-point' | 'multi-point' | 'touch' | 'contains';

/**
 * 한 점에서 만나는 relation detail.
 *
 * proper crossing, T-crossing, shared endpoint, zero-length point hit를 모두 표현한다.
 * `point`는 매 호출 새로 만든 plain `{ x, y }` object다. input point object를 재사용하지 않는다.
 */
export interface PointRelationDetail {
  /** detail 종류 */
  kind: 'point';

  /** 교차점 좌표 */
  point: XYObjectWritable;

  /** 첫 번째 입력의 normalized parameter */
  tA: number;

  /** 두 번째 입력의 normalized parameter */
  tB: number;
}

/**
 * 길이를 가진 collinear overlap을 표현하는 relation detail.
 *
 * 한 점만 공유하는 경우는 overlap이 아니라 `PointRelationDetail`이다.
 * `start`/`end`와 `tA` tuple은 첫 번째 입력 기준 parameter 오름차순이다.
 * `start`/`end`는 매 호출 새로 만든 plain `{ x, y }` object다. input point object를 재사용하지 않는다.
 */
export interface OverlapIntervalDetail {
  /** detail 종류 */
  kind: 'overlap';

  /** overlap 구간 시작점 좌표 */
  start: XYObjectWritable;

  /** overlap 구간 끝점 좌표 */
  end: XYObjectWritable;

  /** 첫 번째 입력의 overlap parameter interval. 오름차순 */
  tA: readonly [number, number];

  /** 두 번째 입력의 overlap parameter interval. 첫 번째 입력 parameter 순서를 따른다 */
  tB: readonly [number, number];
}

/**
 * 두 segment의 교차 관계 detail.
 *
 * boolean `intersectsSegmentSegment`로 손실되는 point/overlap/none 구분을 담는다.
 * `none`은 disjoint, parallel disjoint, collinear non-overlap을 표현한다.
 * fixed plain result object이며 `Into`/companion 대상이 아니다.
 */
export type SegmentSegmentDetail = { kind: 'none' } | PointRelationDetail | OverlapIntervalDetail;

/**
 * 두 점에서 만나는 relation detail.
 *
 * circle/ellipse pair처럼 두 교점을 가지는 후속 helper가 재사용한다.
 * `points`는 매 호출 새로 만든 plain `{ x, y }` object 두 개다.
 */
export interface TwoPointRelationDetail {
  /** detail 종류 */
  kind: 'two-point';

  /** 두 교점 좌표 */
  points: readonly [XYObjectWritable, XYObjectWritable];
}

/**
 * 1~4개 boundary point에서 만나는 relation detail.
 *
 * axis-aligned ellipse pair처럼 교점이 3개 이상일 수 있는 후속 helper가 재사용한다.
 * `points`는 매 호출 새로 만든 plain `{ x, y }` object 배열이다. input point object를
 * 재사용하지 않는다. 길이는 1 이상 4 이하이며, 길이 1은 단일 boundary 교점,
 * 길이 2 이상은 ordering 정책에 따라 정렬된 다중 교점이다.
 *
 * tangent 1점은 `PointRelationDetail`로, proper 2점 교차는 `TwoPointRelationDetail`로
 * 표현한다. `multi-point`는 그 두 type으로 표현되지 않는 3~4점 교차에 사용한다.
 */
export interface MultiPointRelationDetail {
  /** detail 종류 */
  kind: 'multi-point';

  /** 교점 좌표 배열. 길이 1~4, ordering 정책으로 정렬됨 */
  points: readonly XYObjectWritable[];
}

/**
 * 두 circle circumference의 교차 관계 detail.
 *
 * boolean `intersectsCircleCircle`로 손실되는 tangent / two-point / containment / coincident
 * 구분을 담는다. circumference(경계선) 교점 관계이며 disk area overlap이 아니다.
 * - `none`: 외부 분리, radius ≤ 0, non-finite center/radius, scale 복원 후 좌표 overflow
 * - `point`: 외접/내접 tangent 한 점. `tA`/`tB`는 각 circle 기준 normalized turn parameter `[0, 1)`
 * - `two-point`: proper two-point 교차. `points`는 circle `a` 기준 turn 오름차순
 * - `overlap`: 같은 중심 같은 반지름의 coincident circumference
 * - `contains`: 한 circumference가 다른 disk 내부에 있어 경계 교점이 없는 containment
 *
 * 계산은 공통 scale로 정규화해 `d²`/`r²` overflow를 피한다. fixed plain result object이며
 * `Into`/companion 대상이 아니다.
 */
export type CircleCircleDetail =
  | { kind: 'none' }
  | PointRelationDetail
  | TwoPointRelationDetail
  | { kind: 'overlap' }
  | { kind: 'contains' };

/**
 * 두 axis-aligned ellipse boundary의 교차 관계 detail.
 *
 * boolean relation으로 손실되는 tangent / two-point / multi-point / containment / coincident
 * 구분을 담는다. circumference(경계선) 교점 관계이며 disk area overlap이 아니다.
 * - `none`: 외부 분리, boundary 교점 없는 disjoint, empty ellipse(rx/ry ≤ 0),
 *   non-finite center/radius, quartic 계수 무효, scale 복원 후 좌표 overflow
 * - `point`: 외접/내접 tangent 한 점. `tA`/`tB`는 각 ellipse 기준 normalized turn parameter `[0, 1)`
 * - `two-point`: proper 2점 교차. `points`는 ellipse `a` 기준 turn 오름차순
 * - `multi-point`: 3~4점 교차. `points`는 ellipse `a` 기준 turn 오름차순
 * - `overlap`: 같은 center, 같은 radiusX/radiusY의 coincident ellipse
 * - `contains`: 한 ellipse가 다른 ellipse 내부에 있어 경계 교점이 없는 containment
 *
 * 계산은 공통 scale로 정규화해 overflow를 피하고, 최종 좌표가 non-finite이면 `none`으로 환원한다.
 * fixed plain result object이며 `Into`/companion 대상이 아니다(API-006 직접 반환).
 */
export type EllipseEllipseDetail =
  | { kind: 'none' }
  | PointRelationDetail
  | TwoPointRelationDetail
  | MultiPointRelationDetail
  | { kind: 'overlap' }
  | { kind: 'contains' };

/**
 * 면적을 가진 두 영역의 중첩 관계 detail.
 *
 * 실제 면적 numeric value나 clipping 결과를 담지 않는다. 관계 분류만 표현한다.
 * - `none`: 분리
 * - `touch`: 경계 점에서만 닿음
 * - `overlap`: 면적을 가진 부분 중첩
 * - `contains`: 한쪽이 다른 쪽을 완전히 포함
 */
export type AreaOverlapDetail =
  | { kind: 'none' }
  | { kind: 'touch'; points: readonly XYObjectWritable[] }
  | { kind: 'overlap' }
  | { kind: 'contains' };
