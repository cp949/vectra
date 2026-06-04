import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/**
 * 세 개의 writable control point에 결과를 기록할 수 있는 structural quadratic Bezier curve output.
 *
 * `p0`은 시작점, `p1`은 제어점, `p2`는 끝점이다.
 */
export interface QuadraticCurveWritable<
  P0 extends XYWritable = XYObjectWritable,
  P1 extends XYWritable = XYObjectWritable,
  P2 extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 시작점 */
  p0: P0;

  /** 기록 가능한 제어점 */
  p1: P1;

  /** 기록 가능한 끝점 */
  p2: P2;
}

/**
 * 네 개의 writable control point에 결과를 기록할 수 있는 structural cubic Bezier curve output.
 *
 * `p0`은 시작점, `p1`은 첫 번째 제어점, `p2`는 두 번째 제어점, `p3`는 끝점이다.
 */
export interface CubicCurveWritable<
  P0 extends XYWritable = XYObjectWritable,
  P1 extends XYWritable = XYObjectWritable,
  P2 extends XYWritable = XYObjectWritable,
  P3 extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 시작점 */
  p0: P0;

  /** 기록 가능한 첫 번째 제어점 */
  p1: P1;

  /** 기록 가능한 두 번째 제어점 */
  p2: P2;

  /** 기록 가능한 끝점 */
  p3: P3;
}

/**
 * `reduceBezierDegreeInto` / `reduceBezierDegree` 옵션.
 *
 * `tolerance`는 후보 quadratic을 cubic으로 degree elevation했을 때 원본 cubic control point와의
 * 최대 허용 편차다. 이 값을 넘으면 축소가 실패한다.
 */
export interface BezierDegreeReductionOptions {
  /**
   * 축소 성공 판정에 쓰는 control point 최대 허용 편차. 기본값 `1e-9`.
   * finite number가 아니거나 음수이면 RangeError.
   */
  tolerance?: number;
}

/** quadratic Bezier flatten 연산의 허용 오차와 재귀 깊이 상한을 담는 옵션 object. */
export interface FlattenOptions {
  /** 선형 근사 허용 geometric error. 기본값: 0.5 */
  flatness?: number;

  /** subdivision 재귀 깊이 상한. 기본값: 32 */
  maxRecursion?: number;
}

/** quadratic Bezier length 수치 적분의 subdivision 수를 담는 옵션 object. */
export interface LengthOptions {
  /** Gauss-Legendre 적분 구간 분할 수. 기본값: 12 */
  segments?: number;
}

/**
 * `cubicThroughCommandsInto` 옵션.
 *
 * `t`는 through 점이 cubic Bezier 위에 위치하는 parameter (기본 `0.5`).
 * `controlScale`은 control handle 길이 배율 (기본 `1`).
 * `controlScale === 1`이면 cubic을 parameter `t`에서 evaluate했을 때 through 점을 정확히 통과한다.
 * `t === 0` 또는 `t === 1`이면 control point 계산에서 분모가 0이 되어 NaN/Infinity로 흐른다.
 */
export interface CubicThroughOptions {
  /** through 점의 parameter 위치. 기본값 `0.5`. */
  t?: number;

  /** control handle 길이 배율. 기본값 `1`. */
  controlScale?: number;
}

/**
 * `quadraticThroughCommandsInto` 옵션.
 *
 * `t`는 through 점이 quadratic Bezier 위에 위치하는 parameter (기본 `0.5`).
 * `t === 0` 또는 `t === 1`이면 control point 계산에서 분모가 0이 되어 NaN으로 흐른다
 * (invalid numeric pass-through).
 */
export interface QuadraticThroughOptions {
  /** through 점의 parameter 위치. 기본값 `0.5`. */
  t?: number;
}

/** cubic Bezier 형태 분류 결과. */
export type CubicCurveType = 'line' | 'quadratic' | 'cusp' | 'loop' | 'serpentine';

/**
 * TAtLength 역함수 계산 option type.
 * LengthOptions(segments)를 상속하고, 이진 탐색 수렴 제어 option을 추가한다.
 */
export interface TAtLengthOptions extends LengthOptions {
  /** 이진 탐색 수렴 threshold. 기본값: 1e-8 */
  tolerance?: number;
  /** 이진 탐색 최대 반복 횟수. 기본값: 64 */
  maxIterations?: number;
}

/**
 * arc-length spaced point sampling option type.
 * 기존 TAtLength 탐색 option(segments / tolerance / maxIterations)을 그대로 재사용한다.
 */
export interface CurveSpacedPointsOptions extends TAtLengthOptions {}

/**
 * curve lookup table의 entry 1건.
 *
 * uniform t sample의 cumulative chord-length approximation을 담는다.
 * `length`는 exact arc length가 아니라 인접 sample 사이 chord distance 누적값이다.
 */
export interface CurveLookupEntry {
  /** sample parameter, `[0, 1]` */
  t: number;

  /** curve 시작점부터 이 sample까지 chord distance 누적값. nondecreasing */
  length: number;
}

/**
 * closest point 수치 최적화 option type.
 * 초기 탐색 sample 수와 Newton-Raphson 수렴 제어 option을 담는다.
 */
export interface ClosestPointOptions {
  /**
   * Newton-Raphson 수렴 threshold. 기본값: 1e-8.
   * non-finite이거나 음수이면 기본값을 사용한다.
   */
  tolerance?: number;
  /**
   * Newton-Raphson 최대 반복 횟수. 기본값: 20.
   * 정수가 아니거나 음수이거나 non-finite이면 기본값을 사용한다.
   */
  maxIterations?: number;
  /**
   * 초기 탐색 sample 수. 기본값: 11.
   * 정수가 아니거나 2 미만이거나 non-finite이면 endpoint 두 점만 비교한다.
   */
  sampleCount?: number;
}

/**
 * curve 위 closest location 결과.
 *
 * `point`는 `XYObjectWritable` 형식의 새 plain object로 curve 위 점 좌표를 담는다.
 * `t`는 curve-local parameter `[0, 1]`,
 * `distance`는 query까지의 Euclidean distance, `distanceSquared`는 그 제곱이다.
 *
 * `distance`는 `Math.sqrt(distanceSquared)`로 계산한다. oversized finite 좌표로
 * `distanceSquared`가 `Infinity`가 되면 `distance`도 `Infinity`다.
 */
export interface CurveLocationResult {
  /** curve 위 closest point 좌표 */
  point: XYObjectWritable;

  /** curve-local parameter, `[0, 1]`로 clamp된다 */
  t: number;

  /** query까지의 Euclidean distance */
  distance: number;

  /** query까지 거리의 제곱 */
  distanceSquared: number;
}

/**
 * `curveFrenetFrameAtInto`가 결과를 기록하는 writable output shape.
 *
 * `point`/`tangent`/`normal`은 object 또는 tuple writable point storage이고, `curvature`는 scalar다.
 */
export interface CurveFrenetFrameWritable {
  /** curve 위 evaluation point storage */
  point: XYWritable;

  /** unit tangent vector storage. zero derivative이면 zero vector */
  tangent: XYWritable;

  /** unit normal vector storage. zero derivative이면 zero vector */
  normal: XYWritable;

  /** signed curvature. degenerate(zero derivative)이면 `0` */
  curvature: number;
}

/**
 * `curveFrenetFrameAt`이 반환하는 nested plain result object.
 *
 * `point`/`tangent`/`normal`은 새 `{ x, y }` object이고, `curvature`는 scalar다.
 */
export interface CurveFrenetFrameResult {
  /** curve 위 evaluation point */
  point: XYObjectWritable;

  /** unit tangent vector. zero derivative이면 zero vector */
  tangent: XYObjectWritable;

  /** unit normal vector. zero derivative이면 zero vector */
  normal: XYObjectWritable;

  /** signed curvature. degenerate(zero derivative)이면 `0` */
  curvature: number;
}

/**
 * cubicToArcsInto / cubicToArcs 근사 option type.
 *
 * 생략된 option은 각각의 기본값이 적용된다.
 * finite positive가 아닌 값을 지정하면 RangeError로 실패한다.
 */
export interface CubicToArcsOptions {
  /** 원호 근사 허용 최대 편차. 기본값: 1e-3 */
  errorTolerance?: number;

  /** 출력 배열 최대 arc 수. 기본값: 64 */
  maxSegments?: number;

  /** 재귀 분할 최소 parameter 폭. 기본값: 1e-6 */
  minSegmentT?: number;
}

/**
 * arcToCubicInto 분할 option type.
 */
export interface ArcToCubicOptions {
  /** 분할 최대 각도 (radian). 기본값: Math.PI / 2 */
  maxAngle?: number;
}

/** curve 교차 종류. cross=관통, touch=접촉, overlap=구간 중첩, parallel=평행, coincident=완전 일치. */
export type IntersectionKind = 'cross' | 'touch' | 'overlap' | 'parallel' | 'coincident';

/** curve 교차 결과 1건. point는 교차점, tA/tB는 각 curve의 parameter 값. */
export interface IntersectionHit<P extends XYWritable = XYObjectWritable> {
  /** 교차점 */
  point: P;

  /** 교차 종류 */
  kind: IntersectionKind;

  /** curve A 위 parameter (0–1) */
  tA: number;

  /** curve B 위 parameter (0–1) */
  tB: number;
}

/** curve intersection 수치 kernel option. 미지정 시 기본값이 적용된다. */
export interface CurveIntersectionOptions {
  /** geometric 거리 허용 오차. 기본값: DEFAULT_EPSILON */
  epsilon?: number;

  /** parameter 수렴 허용 오차. 기본값: 1e-10 */
  epsilonT?: number;

  /** subdivision 재귀 깊이 상한. 기본값: 32 */
  maxDepth?: number;
}

/**
 * generic curve relation facade의 public Bezier curve input union.
 *
 * `kind` discriminant로 quadratic/cubic을 구분한다. 좌표 field는 모두 `XYInput`이다.
 * arc/path union은 포함하지 않는다.
 */
export type CurveLike =
  | { kind: 'quadratic'; p0: XYInput; p1: XYInput; p2: XYInput }
  | { kind: 'cubic'; p0: XYInput; p1: XYInput; p2: XYInput; p3: XYInput };

/** generic curve relation facade 교차 종류. `cross`=관통, `touch`=접촉. */
export type CurveIntersectionKind = 'cross' | 'touch';

/**
 * generic curve relation facade 교차 결과 1건.
 *
 * 좌표는 flat `x`, `y`다. parameter field는 호출 함수별로 선택적으로 기록된다.
 */
export interface CurveIntersectionHit {
  /** 교차점 x 좌표 */
  x: number;

  /** 교차점 y 좌표 */
  y: number;

  /** 교차 종류 */
  kind: CurveIntersectionKind;

  /** curve A 위 parameter, `[0, 1]` */
  tA?: number;

  /** curve B 위 parameter, `[0, 1]` */
  tB?: number;

  /** curve 위 parameter, `[0, 1]` */
  tCurve?: number;

  /** line/segment 위 parameter. segment는 normalized `[0, 1]` */
  tLine?: number;
}

/** step curve의 elbow 위치 정책. 'middle'은 중간 x, 'before'는 끝점 x 선행, 'after'는 시작점 x 후행. */
export type StepCurveMode = 'middle' | 'before' | 'after';

/** step polyline/path helper 옵션. */
export interface StepCurveOptions {
  /** step elbow 위치 mode. 기본값 'middle'. */
  mode?: StepCurveMode;
}

/** monotone cubic polyline sampling option. */
export interface MonotonePolylineOptions {
  /** segment당 sample 수. 기본값 16. safe integer가 아니거나 1 미만이면 RangeError. */
  steps?: number;
}

/** natural cubic spline polyline sampling option. */
export interface NaturalSplinePolylineOptions {
  /** segment당 sample 수. 기본값 16. safe integer가 아니거나 1 미만이면 RangeError. */
  steps?: number;
}

/** Catmull-Rom curve evaluation option. */
export interface CatmullRomOptions {
  /** centripetal 파라미터. 0=uniform, 0.5=centripetal(기본값), 1=chordal */
  alpha?: number;
  /** true이면 closed loop curve. 기본값 false */
  closed?: boolean;
}

/** Catmull-Rom polyline sampling option. */
export interface CatmullRomPolylineOptions {
  /** 전체 샘플 수. 기본값 32 */
  steps?: number;
  /** centripetal 파라미터. 0=uniform, 0.5=centripetal(기본값), 1=chordal */
  alpha?: number;
  /** true이면 closed loop curve. 기본값 false */
  closed?: boolean;
}

/** Uniform cubic B-Spline curve evaluation option. */
export interface BSplineOptions {
  /** true이면 closed loop curve. 기본값 false */
  closed?: boolean;
}

/** Uniform cubic B-Spline polyline sampling option. */
export interface BSplinePolylineOptions {
  /** 전체 샘플 수. 기본값 32 */
  steps?: number;
  /** true이면 closed loop curve. 기본값 false */
  closed?: boolean;
}

/** Cardinal spline curve evaluation option. */
export interface CardinalOptions {
  /** tangent scale 계수. 0=full cardinal tangent, 1=zero tangent. 기본값 0 */
  tension?: number;
  /** true이면 closed loop curve. 기본값 false */
  closed?: boolean;
}

/** Cardinal spline polyline sampling option. */
export interface CardinalPolylineOptions {
  /** tangent scale 계수. 0=full cardinal tangent, 1=zero tangent. 기본값 0 */
  tension?: number;
  /** true이면 closed loop curve. 기본값 false */
  closed?: boolean;
  /** 전체 샘플 수. 기본값 32 */
  steps?: number;
}

/**
 * Cardinal tangent scalar helper 옵션.
 *
 * `tangentCardinal`, `cubicHermiteFromPoints`, `cubicHermiteFromPointsClamped`가 공유한다.
 */
export interface CardinalTangentOptions {
  /** tangent scale 계수. 0=full cardinal tangent, 1=zero tangent. 기본값 0. `[0, 1]` 범위 밖이면 RangeError. */
  tension?: number;
}

/**
 * curve segment-local 균등 샘플링 옵션.
 *
 * sampling 위치는 t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 */
export interface CurveSampleOptions {
  /**
   * output point 수. 2 이상 0xffffffff 이하의 safe integer.
   * 기본값 32. 범위 밖이면 RangeError.
   */
  steps?: number;
}

/**
 * `sampleTableAt` 보간 및 외삽 옵션.
 *
 * `interpolation` 기본값은 `'linear'`. `extrapolate` 기본값은 `false`.
 */
export interface SampleTableOptions {
  /**
   * 보간 방법. `'linear'`는 인접 sample을 선형 보간한다.
   * `'nearest'`는 가장 가까운 sample index로 반올림한다.
   * 기본값: `'linear'`. unknown 값이면 RangeError.
   */
  interpolation?: 'linear' | 'nearest';

  /**
   * `true`이면 `t`가 `[0, 1]` 밖일 때 첫 두 또는 마지막 두 sample로 선형 외삽한다.
   * `false`이면 `t`를 `[0, 1]`로 clamp한다.
   * 기본값: `false`.
   */
  extrapolate?: boolean;
}

/** `controlPointsInto` / `controlPoints` 옵션. */
export interface ControlPointsOptions {
  /**
   * `true`이면 index lookup이 modulo wrapping을 사용한다.
   * `false`이거나 생략하면 open edge clamp를 사용한다.
   * 기본값: `false`.
   */
  closed?: boolean;
}

/**
 * point-list curve 계산에 필요한 4-point neighborhood 결과 shape.
 *
 * `controlPoints`가 반환하는 읽기용 형태다. 기본 point 표현은 `XYObjectWritable`(`{ x, y }`)이다.
 */
export interface CurveControlPoints<P = XYObjectWritable> {
  /** 직전 이웃 점. open edge에서 없으면 `current` */
  previous: P;

  /** current point index가 가리키는 점 */
  current: P;

  /** 다음 이웃 점. open edge에서 없으면 `current` */
  next: P;

  /** 다다음 이웃 점. open edge에서 없으면 `next` */
  nextNext: P;
}

/**
 * `controlPointsInto`가 4-point neighborhood를 기록하는 writable output shape.
 *
 * 네 field는 각각 object 또는 tuple writable point storage다.
 */
export interface CurveControlPointsWritable<P extends XYWritable = XYWritable> {
  /** 직전 이웃 점 storage */
  previous: P;

  /** current point storage */
  current: P;

  /** 다음 이웃 점 storage */
  next: P;

  /** 다다음 이웃 점 storage */
  nextNext: P;
}
