/** 절대 좌표로 current point를 이동한다. 새로운 subpath를 시작한다. */
export interface MoveCommand {
  readonly kind: 'move';
  readonly x: number;
  readonly y: number;
}

/** 현재 current point에서 (x, y)까지 직선을 그린다. */
export interface LineCommand {
  readonly kind: 'line';
  readonly x: number;
  readonly y: number;
}

/** 현재 current point에서 control point (x1, y1)를 거쳐 (x, y)까지 quadratic Bezier를 그린다. */
export interface QuadraticCommand {
  readonly kind: 'quadratic';
  /** control point x */
  readonly x1: number;
  /** control point y */
  readonly y1: number;
  /** endpoint x */
  readonly x: number;
  /** endpoint y */
  readonly y: number;
}

/** 현재 current point에서 control point (x1, y1), (x2, y2)를 거쳐 (x, y)까지 cubic Bezier를 그린다. */
export interface CubicCommand {
  readonly kind: 'cubic';
  /** first control point x */
  readonly x1: number;
  /** first control point y */
  readonly y1: number;
  /** second control point x */
  readonly x2: number;
  /** second control point y */
  readonly y2: number;
  /** endpoint x */
  readonly x: number;
  /** endpoint y */
  readonly y: number;
}

/**
 * 현재 current point에서 endpoint (x, y)까지 타원호를 그린다.
 * SVG path `A` command와 호환되는 endpoint arc parameter를 보관한다.
 */
export interface ArcCommand {
  readonly kind: 'arc';
  /** x축 반지름 (항상 양수로 보관한다. 음수 보정은 adapter 담당) */
  readonly rx: number;
  /** y축 반지름 (항상 양수로 보관한다. 음수 보정은 adapter 담당) */
  readonly ry: number;
  /** x축 기울기, 단위는 radian (SVG의 degree와 다름. 변환은 adapter 담당) */
  readonly xRotation: number;
  /** large-arc-flag: true = 큰 호 선택 */
  readonly largeArc: boolean;
  /** sweep-flag: true = 시계 방향(clockwise) */
  readonly sweep: boolean;
  /** endpoint x */
  readonly x: number;
  /** endpoint y */
  readonly y: number;
}

/**
 * 현재 subpath를 닫는다. current point를 해당 subpath의 첫 MoveCommand 위치로 되돌린다.
 */
export interface CloseCommand {
  readonly kind: 'close';
}

/** path를 구성하는 모든 command의 discriminated union */
export type PathCommand = MoveCommand | LineCommand | QuadraticCommand | CubicCommand | ArcCommand | CloseCommand;

/** vectra public API가 path input으로 받는 command sequence. */
export type PathLike = readonly PathCommand[];

/**
 * `pointAtLengthInto` / `pointAtLength`의 clamp 정책 옵션.
 *
 * `clamp`가 `false`이면 `distance / length` 비율을 그대로 사용해 supporting line 위
 * 점을 extrapolation한다. 기본값(`undefined` 또는 `true`)이면 `distance`를 `[0, length]`
 * 로 clamp한다.
 */
export interface PointAtLengthOptions {
  /**
   * `false`이면 extrapolation을 허용한다. 기본값: `true` (clamp).
   */
  clamp?: boolean;
}

/**
 * adaptive subdivision 기반 path flattening 연산의 허용 오차와 재귀 깊이 상한을 담는 옵션 object.
 * FlattenOptions와 구조가 동일하지만, path domain 전용 옵션으로 분리 관리한다.
 * 향후 path-specific 필드(예: subpath 처리 정책) 확장 시 독립적으로 진화할 수 있다.
 */
export interface PathFlattenOptions {
  /** geometric error tolerance. 기본값: 0.5 */
  flatness?: number;

  /** subdivision 깊이 상한. 기본값: 32 */
  maxRecursion?: number;
}

/**
 * path measurement 계산 option.
 * length, pointAtLengthInto, boundsInto, closestPointInto, distanceToPoint가 공유한다.
 */
export interface PathMeasurementOptions {
  /** adaptive subdivision geometric error tolerance. 기본값: 0.5 */
  flatness?: number;
  /** subdivision 깊이 상한. 기본값: 32 */
  maxRecursion?: number;
}

/**
 * `propertiesAtLength`가 반환하는 path 위치·접선 정보.
 *
 * caller-side output storage 다형성이 없는 fixed plain result다.
 */
export interface PathPropertiesResult {
  /** 위치 x */
  x: number;

  /** 위치 y */
  y: number;

  /**
   * 접선 방향 단위 벡터 x 성분.
   *
   * degenerate sample(zero-length edge)에서는 접선이 정의되지 않아 zero vector를 기록한다.
   */
  tangentX: number;

  /** 접선 방향 단위 벡터 y 성분. degenerate sample에서는 0이다 (`tangentX` 참고). */
  tangentY: number;

  /** 접선 방향 radian. `atan2(tangentY, tangentX)` 결과. */
  angle: number;

  /** 0-based draw segment index. MoveCommand 및 no-op CloseCommand는 카운트 제외. */
  segmentIndex: number;
}

/**
 * `forEachSegment` visitor에 전달되는 path drawing segment.
 *
 * MoveCommand는 segment로 노출하지 않는다. CloseCommand는 `kind: 'close'` segment로
 * 노출되며, `startsSubpath`는 항상 `false`이다 (close는 subpath 시작이 될 수 없다).
 * `fromX/fromY`는 segment의 시작점, `subpathStartX/subpathStartY`는 현재 subpath의
 * 첫 drawing segment 시작점이다. discriminated union이므로 `kind` 분기 안에서
 * `command`가 자동 narrowing된다.
 */
export type PathSegment =
  | {
      kind: 'line';
      fromX: number;
      fromY: number;
      command: LineCommand;
      startsSubpath: boolean;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'quadratic';
      fromX: number;
      fromY: number;
      command: QuadraticCommand;
      startsSubpath: boolean;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'cubic';
      fromX: number;
      fromY: number;
      command: CubicCommand;
      startsSubpath: boolean;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'arc';
      fromX: number;
      fromY: number;
      command: ArcCommand;
      startsSubpath: boolean;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'close';
      fromX: number;
      fromY: number;
      command: CloseCommand;
      startsSubpath: boolean;
      subpathStartX: number;
      subpathStartY: number;
    };

/**
 * `classifyPoint` 옵션.
 *
 * `PathMeasurementOptions`의 `flatness`, `maxRecursion`을 그대로 상속하며,
 * `boundaryTolerance`로 boundary 판정 허용 거리를 지정한다.
 */
export interface ClassifyPointOptions extends PathMeasurementOptions {
  /** boundary 판정 허용 거리. 기본값 `1e-9`. */
  boundaryTolerance?: number;
}

/**
 * path 위 한 위치를 segment-local parameter로 표현한다.
 *
 * `locationAtLength` / `lengthAtLocation` 인터페이스다.
 * `segmentIndex`의 의미는 `PathPropertiesResult.segmentIndex`와 동일한 0-based drawing
 * segment index이며, MoveCommand와 no-op CloseCommand는 카운트에서 제외된다.
 */
export interface PathLocation {
  /** drawing segment의 0-based index (MoveCommand 및 no-op CloseCommand 제외 카운트) */
  segmentIndex: number;
  /** 해당 segment 내 normalized parameter `[0, 1]` */
  t: number;
}
