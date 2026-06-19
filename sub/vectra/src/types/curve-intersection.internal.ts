import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

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
