import type { StepCurveMode } from './curve-intersection.internal';

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

/** curve intersection 수치 kernel option. 미지정 시 기본값이 적용된다. */
export interface CurveIntersectionOptions {
  /** geometric 거리 허용 오차. 기본값: DEFAULT_EPSILON */
  epsilon?: number;

  /** parameter 수렴 허용 오차. 기본값: 1e-10 */
  epsilonT?: number;

  /** subdivision 재귀 깊이 상한. 기본값: 32 */
  maxDepth?: number;
}

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
