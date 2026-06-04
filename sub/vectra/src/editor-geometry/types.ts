/**
 * editor-geometry domain 공용 타입.
 *
 * barrel(index.ts)에서 re-export하지 않는다. 각 leaf module이 직접 import한다.
 */

import type { BoundsLike, XYInput, XYObjectWritable, XYWritable } from '../types';

// ---------------------------------------------------------------------------
// Handle / Anchor 타입
// ---------------------------------------------------------------------------

/** 8개 resize handle 식별자. clockwise from top-left 순서. */
export type ResizeHandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/** resize handle + rotate handle 식별자 union. */
export type HandleId = ResizeHandleId | 'rotate';

/** 9-point anchor 식별자. */
export type AnchorKind =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

/**
 * handle id와 좌표를 묶은 collection 원소.
 *
 * resizeHandlesInto / rotateHandlesInto가 caller writable 배열에 push하는 단위.
 * Point는 caller-side object 다형성을 보존하기 위해 generic으로 둔다.
 * handleAtPoint 같은 read-only consumer를 위해 constraint를 XYInput으로 열어 둔다.
 */
export interface HandlePoint<Point extends XYInput = XYObjectWritable> {
  /** handle 식별자 */
  id: HandleId;
  /** handle 좌표를 기록한 caller-side writable point */
  point: Point;
}

/** snap이 발생한 원인 출처 */
export type SnapSource = 'grid' | 'angle' | 'distance' | 'pixel' | 'segment' | 'vertex' | 'guide' | 'none';

/**
 * snap 연산 결과.
 *
 * hit 없음: `{ snapped: false, x: inputX, y: inputY, distance: Infinity, source: 'none' }`
 */
export interface SnapResult {
  /** snap이 발생했으면 true */
  snapped: boolean;
  /** snap 후 x 좌표 */
  x: number;
  /** snap 후 y 좌표 */
  y: number;
  /** 원래 좌표와 snap 좌표 사이의 거리. hit 없으면 Infinity */
  distance: number;
  /** snap 발생 원인 */
  source: SnapSource;
}

/** magnetic snap 후보 좌표 */
export interface SnapCandidate {
  x: number;
  y: number;
  source: SnapSource;
}

/** 가이드라인 입력 */
export interface GuideInput {
  axis: 'x' | 'y';
  value: number;
}

// ---------------------------------------------------------------------------
// Alignment / Distribution 타입
// ---------------------------------------------------------------------------

/** alignment 종류. x축은 left/center-x/right, y축은 top/center-y/bottom. */
export type AlignmentKind = 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom';

/**
 * distribution 종류.
 * edge: bounds의 시작 edge 기준 등간격.
 * center: bounds 중심 기준 등간격.
 * gap: 인접 bounds 사이 간격을 균등화.
 */
export type DistributionKind = 'edge-x' | 'center-x' | 'gap-x' | 'edge-y' | 'center-y' | 'gap-y';

/**
 * alignment guide 1건. axis-aligned 무한 직선이지만 caller에게 alignment 종류와
 * 참여한 item index를 함께 알려야 하므로 GuideInput을 직접 확장하지 않고 별도 result 타입을 둔다.
 */
export interface AlignmentGuideResult {
  /** 'x' = x=value 수직선, 'y' = y=value 수평선 */
  axis: 'x' | 'y';
  /** guide line 좌표 */
  value: number;
  /** alignment 종류 */
  kind: AlignmentKind;
  /** 이 guide에 참여한 item bounds index (insertion order, 오름차순) */
  itemIndices: number[];
}

/**
 * distribution guide 1건. edge/center/gap 종류에 따른 axis-aligned 직선이다.
 * gap kind는 두 item 사이의 중간 지점을 value로 기록한다.
 */
export interface DistributionGuideResult {
  /** 'x' = x=value 수직선, 'y' = y=value 수평선 */
  axis: 'x' | 'y';
  /** guide line 좌표 */
  value: number;
  /** distribution 종류 */
  kind: DistributionKind;
  /** 이 guide와 인접한 item bounds index (insertion order, 오름차순) */
  itemIndices: number[];
}

/**
 * distributeEqually 결과 1건. caller가 그대로 bounds 이동에 사용할 수 있도록
 * item index와 target top-left 좌표를 기록한다. offset이 아니라 absolute target position이다.
 */
export interface DistributeTarget<Point extends XYWritable = XYObjectWritable> {
  /** 원본 bounds 배열에서의 index */
  index: number;
  /** distribution 결과로 이동해야 할 bounds의 새 min(top-left) 좌표 */
  point: Point;
}

// ---------------------------------------------------------------------------
// Constraint 옵션 타입
// ---------------------------------------------------------------------------

/**
 * constrainDragInto / constrainDrag 옵션.
 *
 * - `axisLock`: `'horizontal'` → y를 from.y로 고정. `'vertical'` → x를 from.x로 고정.
 *   `'auto'` → |dx| vs |dy|를 비교해 우세 축을 자동 결정한다. dx===dy===0이면 to를 그대로 기록한다.
 * - `containIn`: 이 bounds 밖으로 나가지 않도록 to 좌표를 클램프한다.
 * - `size`: containIn 클램프 시 드래그 대상의 크기를 고려한다.
 *   제공 시 `to.x + size.width <= containIn.max.x` 등 전체 영역이 bounds 안에 들어오도록 보정.
 */
export interface DragConstraintOptions {
  /** 이동 축 잠금. 'horizontal' | 'vertical' | 'auto' */
  axisLock?: 'horizontal' | 'vertical' | 'auto';
  /** to 좌표를 클램프할 bounds */
  containIn?: BoundsLike;
  /** containIn 클램프 시 드래그 대상 크기 */
  size?: { width: number; height: number };
}

/**
 * constrainResizeInto / constrainResize 옵션.
 *
 * - `aspectLocked`: true면 current 기준 aspect ratio를 유지한다.
 *   shorter axis를 longer axis에 맞춰 보정한다.
 * - `minWidth` / `minHeight`: 각 축 최솟값. 기본값 0.
 *   0보다 작으면 0으로 처리한다.
 * - `maxWidth` / `maxHeight`: 각 축 최댓값. 기본값 Infinity.
 */
export interface ResizeConstraintOptions {
  aspectLocked?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * constrainRotate 옵션.
 *
 * - `step`: 지정 step 단위로 snap한다 (radian). 미지정 시 step snap 비활성.
 * - `snapAngles`: 특정 각도 목록 중 tolerance 이내 가장 가까운 값으로 snap한다 (radian).
 *   `step`과 함께 지정하면 둘 중 더 가까운 후보를 반환한다.
 * - `tolerance`: snap 발동 최대 거리 (absolute radian). caller 제공 필수.
 *   미지정 또는 양의 유한수가 아니면 snap 없이 입력 각도를 그대로 반환한다.
 */
export interface RotateConstraintOptions {
  step?: number;
  snapAngles?: readonly number[];
  /** caller가 제공하는 필수 tolerance. 라이브러리 기본값 없음 */
  tolerance: number;
}

/**
 * constrainDrawingBoundsInto / constrainDrawingBounds 옵션.
 *
 * - `shape`: call-site 의미 태그(`'rect'` | `'ellipse'`)다. 반환 geometry는 항상 bounds이며
 *   산식에 영향을 주지 않는다. invalid string도 throw하지 않는다.
 * - `aspectLocked`: 기본값 `false`. `true`면 size를 `max(abs(dx), abs(dy))`로 맞춰 square bounds로
 *   보정하고 pointer 방향 sign을 유지한다.
 * - `fromCenter`: 기본값 `false`. `false`면 `origin`이 corner, `true`면 `origin`이 center다.
 */
export interface DrawingBoundsOptions {
  /** call-site 의미 태그. 산식에 영향을 주지 않는 no-op이다. */
  shape?: 'rect' | 'ellipse';

  /** true면 square bounds로 보정한다. 기본값 false. */
  aspectLocked?: boolean;

  /** true면 origin을 center로, false면 corner로 본다. 기본값 false. */
  fromCenter?: boolean;
}

// ---------------------------------------------------------------------------
// Transform from handles 타입
// ---------------------------------------------------------------------------

/**
 * transformFromHandles 입력.
 *
 * handle drag 결과를 affine transform matrix로 환산하는 데 필요한 최소 정보.
 * - `bounds`: 원본 unrotated AABB
 * - `handle`: 사용자가 잡은 resize handle id
 * - `to`: handle이 이동한 새 위치 (world 좌표)
 */
export interface TransformFromHandlesInput {
  /** 원본 unrotated AABB */
  bounds: BoundsLike;
  /** 드래그한 resize handle 식별자 */
  handle: ResizeHandleId;
  /** handle이 이동한 새 위치 (world 좌표) */
  to: XYInput;
}

/**
 * transformFromHandles 옵션.
 *
 * - `aspectLocked`: true면 corner handle 드래그를 등비례(min scale)로 보정.
 *   edge handle에서는 무시된다.
 * - `fromAnchor`: 기본값은 handle의 대각 anchor. 명시하면 해당 anchor 기준으로 scale한다.
 */
export interface TransformFromHandlesOptions {
  /** true면 corner handle을 등비례로 보정 (edge handle은 무시) */
  aspectLocked?: boolean;
  /** anchor override. 미지정이면 handle 대각 위치를 사용 */
  fromAnchor?: AnchorKind;
}
