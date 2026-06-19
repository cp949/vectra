import type { IntersectionKind } from './curve.internal';
import type { XYObjectWritable, XYWritable } from './xy.internal';

/**
 * line-family(segment, ray, infinite-line) × polygon 교점 1건.
 *
 * boolean relation으로 손실되는 교점 위치와 edge metadata를 담는다.
 * `point`는 매 호출 새로 만든 `{ x, y }` object다. input point object를 재사용하지 않는다.
 * - `kind`: edge-level 교차 종류. transversal=`cross`, polygon vertex touch=`touch`,
 *   polygon edge와 collinear overlap 구간 끝점=`overlap`
 * - `tLine`: line-family parameter. segment는 `[0, 1]`, ray는 `[0, ∞)`, infinite-line은 전체 범위
 * - `tEdge`: 교점이 놓인 polygon edge의 edge-local parameter `[0, 1]`
 * - `edgeIndex`: 교점이 놓인 polygon edge index (`vertex[i] → vertex[(i + 1) % n]`)
 */
export interface LinePolygonIntersectionHit<P extends XYWritable = XYObjectWritable> {
  /** 교점 좌표 */
  point: P;

  /** edge-level 교차 종류 */
  kind: IntersectionKind;

  /** line-family parameter */
  tLine: number;

  /** polygon edge-local parameter `[0, 1]` */
  tEdge: number;

  /** polygon edge index */
  edgeIndex: number;
}

/**
 * line-family(segment, ray, infinite-line) × polygon collinear overlap 구간 1건.
 *
 * `LinePolygonIntersectionHit`는 overlap 구간을 끝점 2건으로만 노출한다. 이 type은 같은 overlap을
 * 양의 길이를 가진 단일 interval로 노출한다. polygon edge와 line-family가 collinear로 겹칠 때만
 * 생성되며, transversal crossing/vertex touch/containment-only는 interval을 만들지 않는다.
 * `start`/`end`는 매 호출 새로 만든 `{ x, y }` object다. input point object를 재사용하지 않는다.
 * - `start`/`end`: overlap 구간의 양 끝점. `start`는 `tLineStart`, `end`는 `tLineEnd`에 대응한다.
 * - `tLineStart`/`tLineEnd`: overlap 구간의 line-family parameter. `tLineStart <= tLineEnd`.
 * - `tEdgeStart`/`tEdgeEnd`: 각 끝점이 놓인 polygon edge-local parameter `[0, 1]`. line parameter
 *   start/end 순서에 대응한다.
 * - `edgeIndex`: overlap이 놓인 polygon edge index (`vertex[i] → vertex[(i + 1) % n]`)
 */
export interface LinePolygonOverlapIntervalDetail<P extends XYWritable = XYObjectWritable> {
  /** detail 종류 */
  kind: 'overlap';

  /** overlap 구간 시작점 좌표 (`tLineStart` 대응) */
  start: P;

  /** overlap 구간 끝점 좌표 (`tLineEnd` 대응) */
  end: P;

  /** 구간 시작 line-family parameter */
  tLineStart: number;

  /** 구간 끝 line-family parameter. `tLineStart <= tLineEnd` */
  tLineEnd: number;

  /** 시작점의 polygon edge-local parameter `[0, 1]` */
  tEdgeStart: number;

  /** 끝점의 polygon edge-local parameter `[0, 1]` */
  tEdgeEnd: number;

  /** polygon edge index */
  edgeIndex: number;
}

/**
 * point에서 polygon obstacle list로 쏜 visibility ray hit 1건.
 *
 * `raysFromPointToPolygon(Into)`가 수집하는 hit이다. `point`는 매 호출 새로 만든 `{ x, y }`
 * object다. input point object를 재사용하지 않는다.
 * - `angle`: origin에서 hit point까지의 방향각(radian, `atan2` 결과 `(-π, π]`)
 * - `distance`: origin에서 hit point까지의 Euclidean distance
 * - `polygonIndex`: hit이 놓인 obstacle polygon의 list index
 * - `edgeIndex`: 그 polygon의 edge index (`vertex[i] → vertex[(i + 1) % n]`)
 */
export interface VisibilityRayHit<P extends XYWritable = XYObjectWritable> {
  /** hit point 좌표 */
  point: P;

  /** origin에서 hit point까지의 방향각(radian) */
  angle: number;

  /** origin에서 hit point까지의 distance */
  distance: number;

  /** hit이 놓인 obstacle polygon의 list index */
  polygonIndex: number;

  /** hit이 놓인 polygon edge index */
  edgeIndex: number;
}

/**
 * visibility ray helper 옵션.
 *
 * `epsilon`은 line/edge intersection과 angle/point dedupe에 쓰고 finite validation에는 쓰지 않는다.
 * `angleOffset`은 각 vertex angle 양옆으로 추가로 쏘는 ray의 각 offset(radian)이다. vertex 뒤
 * edge를 잡기 위한 값이며, 기본값은 작은 양수다.
 */
export interface VisibilityOptions {
  /** line/edge intersection과 dedupe 임계값. 기본값 `DEFAULT_EPSILON` */
  epsilon?: number;

  /** vertex angle 양옆 추가 ray의 각 offset(radian). 기본값 작은 양수 */
  angleOffset?: number;
}
