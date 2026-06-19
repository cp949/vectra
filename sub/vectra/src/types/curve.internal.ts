/**
 * curve type 모음의 re-export 배럴.
 *
 * 비대해진 단일 파일을 응집 단위 helper 3개(options / shapes / intersection)로 분할하고,
 * 이 파일은 기존 소비처의 import 경로(`./curve.internal`)와 public type surface를 보존하는
 * re-export 배럴로 전환한다. 직접 type 정의는 두지 않는다.
 */

export type {
  CurveIntersectionHit,
  CurveIntersectionKind,
  CurveLike,
  IntersectionHit,
  IntersectionKind,
  StepCurveMode,
} from './curve-intersection.internal';
export type {
  ArcToCubicOptions,
  BezierDegreeReductionOptions,
  BSplineOptions,
  BSplinePolylineOptions,
  CardinalOptions,
  CardinalPolylineOptions,
  CardinalTangentOptions,
  CatmullRomOptions,
  CatmullRomPolylineOptions,
  ClosestPointOptions,
  ControlPointsOptions,
  CubicThroughOptions,
  CubicToArcsOptions,
  CurveIntersectionOptions,
  CurveSampleOptions,
  CurveSpacedPointsOptions,
  FlattenOptions,
  LengthOptions,
  MonotonePolylineOptions,
  NaturalSplinePolylineOptions,
  QuadraticThroughOptions,
  SampleTableOptions,
  StepCurveOptions,
  TAtLengthOptions,
} from './curve-options.internal';
export type {
  CubicCurveType,
  CubicCurveWritable,
  CurveControlPoints,
  CurveControlPointsWritable,
  CurveFrenetFrameResult,
  CurveFrenetFrameWritable,
  CurveLocationResult,
  CurveLookupEntry,
  QuadraticCurveWritable,
} from './curve-shapes.internal';
