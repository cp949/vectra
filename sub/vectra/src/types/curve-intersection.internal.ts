import type { PointWritable } from './flat-shapes.internal';

/** curve 교차 종류. cross=관통, touch=접촉, overlap=구간 중첩, parallel=평행, coincident=완전 일치. */
export type IntersectionKind = 'cross' | 'touch' | 'overlap' | 'parallel' | 'coincident';

/** curve 교차 결과 1건. point는 교차점, tA/tB는 각 curve의 parameter 값. */
export interface IntersectionHit {
  /** 교차점 */
  point: PointWritable;

  /** 교차 종류 */
  kind: IntersectionKind;

  /** curve A 위 parameter (0–1) */
  tA: number;

  /** curve B 위 parameter (0–1) */
  tB: number;
}

/** generic curve relation facade 교차 종류. `cross`=관통, `touch`=접촉, `overlap`=구간 중첩의 양 끝점. */
export type CurveIntersectionKind = 'cross' | 'touch' | 'overlap';

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
